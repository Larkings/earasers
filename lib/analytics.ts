// Shopify Analytics — stuurt events naar Shopify Web Pixels
// Vereist dat de Shopify Web Pixel is ingesteld in Admin → Settings → Customer events

function dispatch(eventName: string, data: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(`shopify:${eventName}`, { detail: data }))
}

export function trackPageView(url: string) {
  dispatch('page_viewed', { url })
}

export function trackProductView(
  product: { id: string; title: string; handle: string },
  variant: { id: string; title: string; price: { amount: string; currencyCode: string } },
) {
  dispatch('product_viewed', {
    productVariant: {
      id: variant.id,
      title: variant.title,
      price: variant.price,
      product: {
        id: product.id,
        title: product.title,
        vendor: 'Earasers',
      },
    },
  })
}

export function trackAddToCart(variantId: string, quantity: number, price: number) {
  dispatch('product_added_to_cart', {
    cartLine: {
      merchandise: { id: variantId },
      quantity,
      cost: { totalAmount: { amount: String(price * quantity), currencyCode: 'EUR' } },
    },
  })
}

export function trackCheckoutStarted(checkoutUrl: string, totalAmount: string) {
  dispatch('checkout_started', {
    checkout: {
      checkoutUrl,
      totalPrice: { amount: totalAmount, currencyCode: 'EUR' },
    },
  })
}
