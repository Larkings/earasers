import React, { useEffect, useState, startTransition } from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import styles from './cartDrawer.module.css';
import { useCart, type CartItem } from '../../context/cart';
import { fmt } from '../../lib/products';
import { CloseIcon, CheckIcon, ArrowRightIcon } from '../icons';

const FREE_SHIPPING = 39;

const EmptyCartIcon = () => (
  <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const DrawerItem = ({ item }: { item: CartItem }) => {
  const { setQty, removeItem, closeCart } = useCart();
  return (
    <div className={styles.item}>
      <Link href={`/product?slug=${item.slug}`} className={styles.itemImg} onClick={closeCart}>
        <Image src={item.img} alt={item.name} fill style={{ objectFit: 'cover' }} />
      </Link>
      <div className={styles.itemBody}>
        <Link href={`/product?slug=${item.slug}`} className={styles.itemName} onClick={closeCart}>
          {item.name}
        </Link>
        <div className={styles.itemMeta}>
          <span className={styles.itemPill}>Size {item.size}</span>
          <span className={styles.itemPill}>{item.filter}</span>
        </div>
        <div className={styles.itemFooter}>
          <span className={styles.itemPrice}>{fmt(item.price * item.qty)}</span>
          <div className={styles.itemActions}>
            <div className={styles.qtyControl}>
              <button className={styles.qtyBtn} onClick={() => setQty(item.id, item.qty - 1)} aria-label="Decrease">−</button>
              <span className={styles.qtyCount}>{item.qty}</span>
              <button className={styles.qtyBtn} onClick={() => setQty(item.id, item.qty + 1)} aria-label="Increase">+</button>
            </div>
            <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DrawerContent = () => {
  const { items, totalCount, isCartOpen, closeCart } = useCart();

  const subtotal  = items.reduce((s, i) => s + i.price * i.qty, 0);
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);
  const progress  = Math.min(100, (subtotal / FREE_SHIPPING) * 100);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeCart]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      <div className={styles.backdrop} onClick={closeCart} aria-hidden="true" />

      <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Cart">

        {/* Header */}
        <div className={styles.header}>
          <p className={styles.title}>
            Cart
            {totalCount > 0 && <span className={styles.count}>({totalCount})</span>}
          </p>
          <button className={styles.closeBtn} onClick={closeCart} aria-label="Close cart">
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <EmptyCartIcon />
              <p className={styles.emptyTitle}>Your cart is empty</p>
              <p className={styles.emptySub}>Add a product to get started.</p>
              <Link href="/collection" className={styles.emptyLink} onClick={closeCart}>
                Browse our collection <ArrowRightIcon size={13} />
              </Link>
            </div>
          ) : (
            items.map(item => <DrawerItem key={item.id} item={item} />)
          )}
        </div>

        {/* Footer — only when items exist */}
        {items.length > 0 && (
          <div className={styles.footer}>

            {/* Free shipping bar */}
            <div className={styles.shippingBar}>
              {remaining > 0 ? (
                <p className={styles.shippingMsg}>
                  Only <strong>{fmt(remaining)}</strong> away from free shipping
                </p>
              ) : (
                <p className={styles.shippingFree}>
                  <CheckIcon size={13} /> Free shipping!
                </p>
              )}
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Subtotal */}
            <div className={styles.totals}>
              <span className={styles.totalsLabel}>Subtotal</span>
              <span className={styles.totalsPrice}>{fmt(subtotal)}</span>
            </div>

            {/* CTA */}
            <Link href="/cart" className={styles.checkoutBtn} onClick={closeCart}>
              Checkout <ArrowRightIcon size={15} />
            </Link>

            <Link href="/cart" className={styles.viewCartBtn} onClick={closeCart}>
              View cart
            </Link>

          </div>
        )}
      </div>
    </>
  );
};

export const CartDrawer = () => {
  const { isCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { startTransition(() => setMounted(true)); }, []);

  if (!mounted || !isCartOpen) return null;

  return ReactDOM.createPortal(<DrawerContent />, document.body);
};
