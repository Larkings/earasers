/* ============================================================
   EARASERS THEME — earasers-cart.js
   Cart drawer, add-to-cart, quantity picker
   ============================================================ */

async function addToCart(variantId, qty = 1) {
  const res = await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity: qty }),
  });
  if (!res.ok) return;
  await refreshCart();
  openCart();
}

async function buyNow() {
  const variantId = document.getElementById('variant-id')?.value;
  const qty = parseInt(document.getElementById('qty')?.value || '1', 10);
  if (!variantId) return;
  const res = await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity: qty }),
  });
  if (!res.ok) return;
  window.location.href = '/checkout';
}

async function updateCartItem(key, qty) {
  await fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: key, quantity: qty }),
  });
  await refreshCart();
}

async function refreshCart() {
  const res  = await fetch('/cart.js');
  const cart = await res.json();

  document.querySelectorAll('#cart-count, #drawer-count').forEach(el => {
    el.textContent = cart.item_count;
  });

  const totalEl = document.getElementById('drawer-total');
  if (totalEl) totalEl.textContent = formatMoney(cart.total_price);

  const itemsEl = document.getElementById('cart-drawer-items');
  if (itemsEl) {
    const sectionRes = await fetch('/?sections=cart-items');
    if (sectionRes.ok) {
      const data = await sectionRes.json();
      if (data['cart-items']) itemsEl.innerHTML = data['cart-items'];
    }
  }
}

function formatMoney(cents) {
  return '€' + (cents / 100).toFixed(2).replace('.', ',');
}

function openCart() {
  const drawer = document.getElementById('cart-drawer');
  if (drawer) {
    drawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCart() {
  const drawer = document.getElementById('cart-drawer');
  if (drawer) {
    drawer.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}

function adjustQty(delta) {
  const input = document.getElementById('qty');
  if (!input) return;
  input.value = Math.max(1, (parseInt(input.value, 10) || 1) + delta);
}

/* Cart toggle button */
const cartToggle = document.getElementById('cart-toggle');
if (cartToggle) cartToggle.addEventListener('click', openCart);

/* Product form submit */
const productForm = document.getElementById('product-form');
if (productForm) {
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const variantId = document.getElementById('variant-id').value;
    const qty = parseInt(document.getElementById('qty')?.value || '1', 10);
    await addToCart(variantId, qty);
  });
}

/* Variant selector */
function updateVariant() {
  const form = document.getElementById('product-form');
  if (!form) return;
  const variantsJson = document.getElementById('product-variants-json');
  if (!variantsJson) return;
  const variants = JSON.parse(variantsJson.textContent);
  const selectedOptions = Array.from(form.querySelectorAll('input[type="radio"]:checked')).map(i => i.value);
  const match = variants.find(v => v.options.every((opt, idx) => opt === selectedOptions[idx]));
  if (match) {
    document.getElementById('variant-id').value = match.id;
    const priceEl = document.getElementById('product-price');
    if (priceEl) priceEl.textContent = formatMoney(match.price);
    const btn = document.getElementById('add-to-cart-btn');
    if (btn) btn.textContent = match.available ? 'Add to cart' : 'Sold out';
  }
}

function swapImg(src, btn) {
  const mainImg = document.getElementById('main-product-img');
  if (mainImg) mainImg.src = src;
  document.querySelectorAll('.main-product__thumb').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
}
