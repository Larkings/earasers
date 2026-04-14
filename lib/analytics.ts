import {
  AnalyticsEventName,
  sendShopifyAnalytics,
  type ShopifyAddToCartPayload,
  type ShopifyAnalyticsProduct,
  type ShopifyPageViewPayload,
} from '@shopify/hydrogen-react'
import { readConsent } from '../context/consent'

/**
 * Analytics layer voor Earasers.
 *
 * Vier targets per event:
 *   1) Shopify Customer Events  — via `window.dispatchEvent('shopify:*')`,
 *      opgevangen door een Custom Web Pixel in Shopify Admin → Settings →
 *      Customer events (optioneel; voor eigen doorstuurlogica).
 *   2) Shopify monorail         — `sendShopifyAnalytics()` post naar
 *      monorail-edge.shopifysvc.com zodat het native Analytics dashboard
 *      van deze headless Next.js storefront óók frontend-traffic ziet
 *      (pageviews, product views, add-to-cart). Checkout/purchase vuurt
 *      Shopify zelf vanuit de hosted checkout.
 *   3) Meta Pixel               — `fbq('track', ...)`
 *   4) Google Analytics 4 / Ads — `gtag('event', ...)`
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

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? ''
const SHOP_ID_RAW    = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID ?? ''
// hydrogen-react's sendShopifyAnalytics roept intern parseGid() aan op shopId
// en verwacht GID-formaat. Puur nummer → parseGid returnt {id: undefined} →
// NaN → JSON null → Shopify monorail weigert event met 400.
const SHOP_ID = SHOP_ID_RAW
  ? (SHOP_ID_RAW.startsWith('gid://') ? SHOP_ID_RAW : `gid://shopify/Shop/${SHOP_ID_RAW}`)
  : ''
const DEFAULT_CURRENCY = 'EUR' as const

const UNIQUE_TOKEN_KEY = 'earasers-shopify-unique-token'
const VISIT_TOKEN_KEY  = 'earasers-shopify-visit-token'

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function getOrCreate(storage: Storage, key: string): string {
  let v = storage.getItem(key)
  if (!v) { v = uuid(); storage.setItem(key, v) }
  return v
}

function shopifyBase(): Omit<ShopifyPageViewPayload, 'pageType'> | null {
  if (typeof window === 'undefined') return null
  if (!SHOPIFY_DOMAIN || !SHOP_ID) return null
  return {
    shopifySalesChannel: 'headless',
    shopId: SHOP_ID,
    currency: DEFAULT_CURRENCY,
    acceptedLanguage: (navigator.language?.slice(0, 2).toUpperCase() || 'EN') as ShopifyPageViewPayload['acceptedLanguage'],
    hasUserConsent: readConsent().analytics,
    url: window.location.href,
    path: window.location.pathname,
    search: window.location.search,
    referrer: document.referrer,
    title: document.title,
    navigationType: 'navigate',
    navigationApi: 'PerformanceNavigationTiming',
    userAgent: navigator.userAgent,
    uniqueToken: getOrCreate(window.localStorage, UNIQUE_TOKEN_KEY),
    visitToken:  getOrCreate(window.sessionStorage, VISIT_TOKEN_KEY),
  }
}

function sendToShopify(eventName: string, payload: Record<string, unknown>) {
  const base = shopifyBase()
  if (!base) return
  void sendShopifyAnalytics({
    eventName,
    payload: { ...base, ...payload } as ShopifyPageViewPayload | ShopifyAddToCartPayload,
  })
}

function dispatch(eventName: string, data: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(`shopify:${eventName}`, { detail: data }))
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${eventName}`, data)
  }
}

function toShopifyProduct(
  product: { id: string; title: string },
  variant: { id: string; title: string; price: { amount: string; currencyCode: string } },
  quantity = 1,
): ShopifyAnalyticsProduct {
  return {
    productGid: product.id,
    variantGid: variant.id,
    name: product.title,
    variantName: variant.title,
    brand: 'Earasers',
    price: variant.price.amount,
    quantity,
  }
}

/** GA4: gegated op analytics consent (anonieme stats). */
function gtagEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (!readConsent().analytics) return
  window.gtag?.('event', name, params ?? {})
}

/** Meta Pixel: gegated op marketing consent. */
function fbqTrack(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (!readConsent().marketing) return
  window.fbq?.('track', name, params ?? {})
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function trackPageView(url: string) {
  dispatch('page_viewed', { url })
  sendToShopify(AnalyticsEventName.PAGE_VIEW, { pageType: 'page' })
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

  sendToShopify(AnalyticsEventName.PRODUCT_VIEW, {
    pageType: 'product',
    resourceId: product.id,
    products: [toShopifyProduct(product, variant)],
    totalValue: value,
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

export function trackAddToCart(
  variantId: string,
  quantity: number,
  price: number,
  productName?: string,
) {
  dispatch('product_added_to_cart', {
    cartLine: {
      merchandise: { id: variantId },
      quantity,
      cost: { totalAmount: { amount: String(price * quantity), currencyCode: 'EUR' } },
    },
  })

  const value = price * quantity

  sendToShopify(AnalyticsEventName.ADD_TO_CART, {
    cartId: variantId,
    totalValue: value,
    products: [{
      productGid: variantId,
      variantGid: variantId,
      name: productName ?? 'Product',
      brand: 'Earasers',
      price: String(price),
      quantity,
    }],
  })

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

export function trackRemoveFromCart(variantId: string, quantity: number, price: number) {
  const value = price * quantity

  dispatch('product_removed_from_cart', {
    cartLine: {
      merchandise: { id: variantId },
      quantity,
      cost: { totalAmount: { amount: String(value), currencyCode: 'EUR' } },
    },
  })

  gtagEvent('remove_from_cart', {
    currency: 'EUR',
    value,
    items: [{ item_id: variantId, price, quantity }],
  })

  // Meta heeft geen native RemoveFromCart standard event; gebruik custom event
  if (typeof window !== 'undefined' && readConsent().marketing) {
    window.fbq?.('trackCustom', 'RemoveFromCart', {
      content_ids: [variantId],
      value,
      currency: 'EUR',
    })
  }
}

export function trackSignUp(method: 'email' | 'oauth' = 'email') {
  dispatch('customer_signup', { method })
  gtagEvent('sign_up', { method })
  fbqTrack('CompleteRegistration', { content_name: method })
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
