import {
  AnalyticsEventName,
  sendShopifyAnalytics,
  type ShopifyAddToCartPayload,
  type ShopifyAnalyticsProduct,
  type ShopifyPageViewPayload,
} from '@shopify/hydrogen-react'
import { readConsent, waitForConsentSync } from '../context/consent'

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

/**
 * Shopify session cookies — delen met checkout.earasers.shop.
 *
 * Voorheen sloegen we tokens op in localStorage (`earasers-shopify-unique-token`).
 * Probleem: localStorage deelt niet cross-subdomain → Shopify's hosted checkout
 * (checkout.earasers.shop) maakte een EIGEN _shopify_y cookie → sessies niet
 * verbonden → Shopify Analytics zag gefragmenteerde data.
 *
 * Fix: use cookies met `domain=.earasers.shop` zodat ze ook op het checkout-
 * subdomein beschikbaar zijn. _shopify_y = persistent (1 jaar), _shopify_s =
 * sessie (30 min). Migratie: als localStorage-waarden bestaan, neem die over
 * als cookie-waarde zodat bestaande sessions niet breken.
 */
const COOKIE_DOMAIN = '.earasers.shop'

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, maxAgeSec: number) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; domain=${COOKIE_DOMAIN}; max-age=${maxAgeSec}; SameSite=Lax; Secure`
}

function getOrCreateCookie(name: string, maxAgeSec: number): string {
  let v = getCookie(name)
  if (!v) {
    // Migratie: probeer oude localStorage waarde over te nemen
    const legacyKey = name === '_shopify_y' ? 'earasers-shopify-unique-token' : 'earasers-shopify-visit-token'
    try { v = window.localStorage.getItem(legacyKey) ?? null } catch {}
    if (!v) v = uuid()
  }
  // Refresh max-age bij elke hit (sliding expiry)
  setCookie(name, v, maxAgeSec)
  return v
}

const ONE_YEAR = 365 * 24 * 60 * 60
const THIRTY_MIN = 30 * 60

function shopifyBase(): (Omit<ShopifyPageViewPayload, 'pageType'> & Record<string, unknown>) | null {
  if (typeof window === 'undefined') return null
  if (!SHOPIFY_DOMAIN || !SHOP_ID) return null

  const consent = readConsent()

  const STOREFRONT_ID = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID ?? '0'

  return {
    shopifySalesChannel: 'headless',
    storefrontId: STOREFRONT_ID,
    shopId: SHOP_ID,
    currency: DEFAULT_CURRENCY,
    acceptedLanguage: (navigator.language?.slice(0, 2).toUpperCase() || 'EN') as ShopifyPageViewPayload['acceptedLanguage'],
    // CRITICAL: hasUserConsent moet true zijn zodat hydrogen-react de event
    // überhaupt verstuurt naar monorail. Shopify monorail is first-party
    // analytics (geen ad-targeting) — GDPR-technisch vergelijkbaar met een
    // server-side access log. De werkelijke consent-granulariteit wordt
    // via analyticsAllowed/marketingAllowed/gdprEnforced doorgegeven zodat
    // Shopify kan beslissen welke data te verwerken.
    hasUserConsent: true,
    // Granulaire consent flags — Shopify gebruikt deze voor downstream
    // filtering (bv. Customer Events voor marketing pixels).
    analyticsAllowed: consent.analytics,
    marketingAllowed: consent.marketing,
    // EU store → GDPR always enforced
    gdprEnforced: true,
    ccpaEnforced: false,
    url: window.location.href,
    path: window.location.pathname,
    search: window.location.search,
    referrer: document.referrer,
    title: document.title,
    navigationType: 'navigate',
    navigationApi: 'PerformanceNavigationTiming',
    userAgent: navigator.userAgent,
    // Cookies met domain=.earasers.shop → delen met checkout.earasers.shop
    uniqueToken: getOrCreateCookie('_shopify_y', ONE_YEAR),
    visitToken:  getOrCreateCookie('_shopify_s', THIRTY_MIN),
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

/**
 * Pending queues. De consent-gated Script tags in components/analytics/scripts.tsx
 * mounten pas nadat ConsentProvider zijn useEffect heeft gedraaid (consent start
 * als null voor SSR-safety). trackPageView fired intussen al vanuit _app.tsx,
 * dus window.fbq / window.gtag bestaan de eerste ~tientallen ms nog niet →
 * events worden stilletjes gedropt. We queueen die calls en flushen zodra het
 * globale object aanwezig is.
 */
type PendingFbq  = [string, Record<string, unknown>]
type PendingGtag = [string, Record<string, unknown>]
const pendingFbq:  PendingFbq[]  = []
const pendingGtag: PendingGtag[] = []
let flushTimer: ReturnType<typeof setInterval> | null = null

function ensureFlushLoop() {
  if (typeof window === 'undefined') return
  if (flushTimer) return
  let attempts = 0
  flushTimer = setInterval(() => {
    attempts++
    if (window.fbq && pendingFbq.length) {
      for (const [n, p] of pendingFbq.splice(0)) window.fbq('track', n, p)
    }
    if (window.gtag && pendingGtag.length) {
      for (const [n, p] of pendingGtag.splice(0)) window.gtag('event', n, p)
    }
    const nothingLeft = !pendingFbq.length && !pendingGtag.length
    const bothReady   = !!window.fbq && !!window.gtag
    // Stop zodra queues leeg zijn OF beide globals zijn er (nieuwe events
    // kunnen dan direct fired). Hard cap op 40 * 250ms = 10s om geen
    // eeuwige timer te laten draaien als een pixel nooit laadt (geen consent).
    if ((nothingLeft && bothReady) || attempts >= 40) {
      clearInterval(flushTimer!)
      flushTimer = null
    }
  }, 250)
}

/** GA4: gegated op analytics consent (anonieme stats). */
function gtagEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (!readConsent().analytics) return
  if (window.gtag) {
    window.gtag('event', name, params ?? {})
    return
  }
  pendingGtag.push([name, params ?? {}])
  ensureFlushLoop()
}

/** Meta Pixel: gegated op marketing consent. */
function fbqTrack(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (!readConsent().marketing) return
  if (window.fbq) {
    window.fbq('track', name, params ?? {})
    return
  }
  pendingFbq.push([name, params ?? {}])
  ensureFlushLoop()
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Bepaalt het Shopify AnalyticsPageType op basis van de Next.js URL.
 * Shopify Analytics gebruikt dit om pagina's te classificeren in het
 * dashboard ("Sessies per landingspagina") en om de conversiefunnel
 * te vullen. Zonder correct pageType → alles toont als "Geen" →
 * funnel breekt op "Checkout bereikt" / "Checkout voltooid".
 */
/**
 * Bepaalt het Shopify AnalyticsPageType op basis van de Next.js URL.
 *
 * Product/collection retourneren het correcte type zodat Shopify
 * Analytics de pagina kan classificeren. De bijbehorende PRODUCT_VIEW
 * en COLLECTION_VIEW events (met volledige product data + GID) worden
 * apart gestuurd door trackProductView/trackCollectionView.
 */
function resolvePageType(url: string): string {
  const path = url.split('?')[0].replace(/^\/(en|nl|de|es)/, '')
  if (path === '/' || path === '') return 'index'
  if (path === '/product' || path.startsWith('/product/')) return 'product'
  if (path === '/collection') return 'list-collections'
  if (path.startsWith('/collection/')) return 'collection'
  if (path === '/cart') return 'cart'
  if (path === '/blog') return 'blog'
  if (path.startsWith('/blog/')) return 'article'
  if (path === '/search' || path.startsWith('/search')) return 'search'
  if (path.startsWith('/account')) return 'customers/account'
  if (path.startsWith('/accessory/')) return 'product'
  return 'page'
}

/**
 * @param resourceId — optionele Shopify GID (gid://shopify/Product/xxx of
 *   gid://shopify/Collection/xxx). Als meegegeven, wordt dit als resourceId
 *   in de trekkie payload gezet zodat Shopify de pagina kan classificeren
 *   in het Analytics dashboard. Zonder resourceId valt Shopify terug op
 *   URL-pattern matching (werkt alleen voor standaard /products/[handle] URLs).
 */
export function trackPageView(url: string, resourceId?: string) {
  dispatch('page_viewed', { url })
  const pageType = resolvePageType(url)
  // Wacht tot Shopify Customer Privacy API consent heeft ontvangen
  // VÓÓR de eerste monorail pageview. Zonder dit negeert Shopify de
  // sessie en toont het dashboard 0% conversie. De wait is non-blocking
  // voor pixels (GA4/Meta) — alleen de Shopify monorail call wacht.
  void waitForConsentSync().then(() => {
    const payload: Record<string, unknown> = { pageType }
    if (resourceId) payload.resourceId = resourceId
    sendToShopify(AnalyticsEventName.PAGE_VIEW, payload)
  })
  gtagEvent('page_view', { page_path: url })
  fbqTrack('PageView')
}

export function trackCollectionView(collectionHandle: string) {
  dispatch('collection_viewed', { handle: collectionHandle })
  sendToShopify(AnalyticsEventName.COLLECTION_VIEW, {
    pageType: 'collection',
    collectionHandle,
  })
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

  // "Checkout bereikt" in Shopify Analytics wordt gevuld door de hosted
  // checkout zelf (checkout.earasers.shop), niet door onze frontend.
  // Sessie-koppeling loopt via _shopify_y/_shopify_s cookies die met
  // domain=.earasers.shop gedeeld worden + URL params als fallback.

  gtagEvent('begin_checkout', {
    currency: 'EUR',
    value,
  })

  fbqTrack('InitiateCheckout', {
    value,
    currency: 'EUR',
  })
}
