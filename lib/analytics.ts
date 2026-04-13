import { readConsent } from '../context/consent'

/**
 * Analytics layer voor Earasers.
 *
 * Drie targets per event:
 *   1) Shopify Customer Events  — via `window.dispatchEvent('shopify:*')`,
 *      opgevangen door een Custom Web Pixel in Shopify Admin → Settings →
 *      Customer events. Voor purchase tracking zit Shopify aan het stuur
 *      (checkout gebeurt op shopify.com), de Pixel daar moet de Meta/GA4
 *      events doorsturen.
 *   2) Meta Pixel               — `fbq('track', ...)`
 *   3) Google Analytics 4 / Ads — `gtag('event', ...)`
 *
 * Alle pixel-calls zijn cookie-consent gated. Zonder 'all' consent gaan
 * alleen Shopify dispatch events door (die zijn 1st-party + nodig voor
 * site-functionaliteit zoals admin metrics).
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

const isMarketingAllowed = () => readConsent() === 'all'

function dispatch(eventName: string, data: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(`shopify:${eventName}`, { detail: data }))
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${eventName}`, data)
  }
}

function gtagEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !isMarketingAllowed()) return
  window.gtag?.('event', name, params ?? {})
}

function fbqTrack(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !isMarketingAllowed()) return
  window.fbq?.('track', name, params ?? {})
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function trackPageView(url: string) {
  dispatch('page_viewed', { url })
  gtagEvent('page_view', { page_path: url })
  fbqTrack('PageView')
}

export function trackProductView(
  product: { id: string; title: string; handle: string },
  variant: { id: string; title: string; price: { amount: string; currencyCode: string } },
) {
  const value    = parseFloat(variant.price.amount)
  const currency = variant.price.currencyCode

  dispatch('product_viewed', {
    productVariant: {
      id: variant.id,
      title: variant.title,
      price: variant.price,
      product: { id: product.id, title: product.title, vendor: 'Earasers' },
    },
  })

  gtagEvent('view_item', {
    currency,
    value,
    items: [{
      item_id: variant.id,
      item_name: product.title,
      item_variant: variant.title,
      price: value,
      quantity: 1,
    }],
  })

  fbqTrack('ViewContent', {
    content_ids: [variant.id],
    content_name: product.title,
    content_type: 'product',
    value,
    currency,
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

  const value = price * quantity

  gtagEvent('add_to_cart', {
    currency: 'EUR',
    value,
    items: [{ item_id: variantId, price, quantity }],
  })

  fbqTrack('AddToCart', {
    content_ids: [variantId],
    content_type: 'product',
    value,
    currency: 'EUR',
  })
}

export function trackViewCart(items: Array<{ variantId: string; price: number; qty: number }>) {
  const value = items.reduce((s, i) => s + i.price * i.qty, 0)

  gtagEvent('view_cart', {
    currency: 'EUR',
    value,
    items: items.map(i => ({ item_id: i.variantId, price: i.price, quantity: i.qty })),
  })

  // Meta heeft geen native ViewCart event; gebruik standard custom event
  fbqTrack('ViewContent', {
    content_ids: items.map(i => i.variantId),
    content_type: 'product',
    value,
    currency: 'EUR',
  })
}

export function trackCheckoutStarted(checkoutUrl: string, totalAmount: string) {
  dispatch('checkout_started', {
    checkout: {
      checkoutUrl,
      totalPrice: { amount: totalAmount, currencyCode: 'EUR' },
    },
  })

  const value = parseFloat(totalAmount) || 0

  gtagEvent('begin_checkout', {
    currency: 'EUR',
    value,
  })

  fbqTrack('InitiateCheckout', {
    value,
    currency: 'EUR',
  })
}
