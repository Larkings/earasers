/**
 * Shared checkout-redirect helpers.
 *
 * Vóór Fix G (commit 2026-04-21) leefde `enrichCheckoutUrl` + `collectMetaAttrs`
 * lokaal in `context/cart.tsx` en werden ze ALLEEN aangeroepen vanuit de
 * reguliere cart-drawer checkout. De Buy Now flow in `pages/product.tsx` en
 * `pages/accessory/[handle].tsx` sloeg ze volledig over → orders via Buy Now
 * hadden geen `_meta_*` attribution, geen UTM-propagation, en geen
 * `trackCheckoutStarted` fire. Empirisch bewezen met order #11696 (Valerie
 * Thibault, 2026-04-21, Buy Now → geen `_meta_source_url` in admin) versus
 * #11694 (Patrick, cart-flow → wel aanwezig).
 *
 * Door beide helpers hier te centraliseren kunnen beide checkout-paden ze
 * consistent aanroepen. Het `_checkout_flow` attribute is nieuw: geeft
 * retroactieve analyse-mogelijkheid (filter orders op flow) zonder dat we
 * opnieuw moeten gokken welk pad een order genomen heeft.
 */

export type CheckoutFlow = 'cart' | 'buy_now'

/**
 * Verrijkt een Shopify checkoutUrl met UTM params + `_shopify_y`/`_shopify_s`
 * session cookies zodat marketing-attributie bewaard blijft bij de
 * cross-domain redirect van www.earasers.shop → checkout.earasers.shop.
 * Zonder enrichment ziet Shopify de checkout als "Direct traffic" en gaat
 * UTM-context verloren.
 *
 * Let op: de session cookie-propagation hier is nuttig voor onze EIGEN
 * order-attribution en Shopify's marketing-UTM rapportage. De native
 * Shopify conversion-attributie-engine accepteert de headless storefront
 * session-ID's niet (architectuur-limiet empirisch bevestigd 2026-04-21
 * via cookie-compare www→checkout). Dat dashboard-cijfer blijft cosmetisch
 * blind voor klant-traffic, onafhankelijk van deze enrichment.
 */
export function enrichCheckoutUrl(url: string): string {
  if (typeof window === 'undefined') return url
  try {
    const checkout = new URL(url)
    const current = new URLSearchParams(window.location.search)
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
      const val = current.get(key)
      if (val && !checkout.searchParams.has(key)) checkout.searchParams.set(key, val)
    }
    const sy = getCookie('_shopify_y')
    const ss = getCookie('_shopify_s')
    if (sy && !checkout.searchParams.has('_shopify_y')) checkout.searchParams.set('_shopify_y', sy)
    if (ss && !checkout.searchParams.has('_shopify_s')) checkout.searchParams.set('_shopify_s', ss)
    return checkout.toString()
  } catch {
    return url
  }
}

/**
 * Verzamelt Meta-tracking metadata (fbp/fbc cookies, source URL, user-agent)
 * + `_checkout_flow` zodat de server-side Purchase event in onze webhook
 * handler de order kan koppelen aan de originele ad-klik én zichtbaar maakt
 * welk front-end pad de klant heeft genomen.
 *
 * Keys worden prefixed met `_meta_` zodat ze in Shopify order admin als
 * aparte metadata herkenbaar zijn en niet mengen met note_attributes die
 * Shopify-apps zelf zetten. `_checkout_flow` is bewust zonder prefix want
 * het is geen Meta-specifiek veld — het is onze eigen telemetry.
 *
 * @param flow 'cart' als afgerekend via de cart-drawer met alle items;
 *             'buy_now' als afgerekend via de directe single-variant buy-now
 *             knop op product-/accessory-detailpagina.
 */
export function collectMetaAttrs(flow: CheckoutFlow): Array<{ key: string; value: string }> {
  if (typeof document === 'undefined') return []
  const fbp = getCookie('_fbp')
  const fbc = getCookie('_fbc')
  const attrs: Array<{ key: string; value: string }> = []
  if (fbp) attrs.push({ key: '_meta_fbp', value: fbp })
  if (fbc) attrs.push({ key: '_meta_fbc', value: fbc })
  attrs.push({ key: '_meta_source_url', value: window.location.href })
  attrs.push({ key: '_meta_user_agent', value: navigator.userAgent })
  attrs.push({ key: '_checkout_flow', value: flow })
  return attrs
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}
