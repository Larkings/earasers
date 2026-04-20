# Shopify Headless Storefront — Hard-Won Checklist

A reusable playbook for building Next.js + Shopify headless storefronts on Vercel. Every item here exists because it bit someone in production. Follow top-to-bottom when starting a new build.

---

## 1. Day-1 Environment Variables

All variables prefixed `NEXT_PUBLIC_*` are **inlined into the JS bundle at build time** by Next.js. Consequences:
- Adding or changing them in Vercel does **NOT auto-redeploy** — you must manually trigger a redeploy
- If values seem stale after redeploy, redeploy again with **"Use existing Build Cache" UNCHECKED**
- Verify a value is actually inlined: `curl -s https://<site>/_next/static/chunks/<hash>.js | grep <expected-value>`

### Required vars

| Variable | Value | How to obtain |
|---|---|---|
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | `<shop>.myshopify.com` | Shopify admin URL |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | Storefront API token | Shopify Admin → Apps → Develop apps → Storefront API access tokens |
| `SHOPIFY_ADMIN_API_TOKEN` | Admin API token (server-only, no `NEXT_PUBLIC_`) | Same app, Admin API access token |
| `NEXT_PUBLIC_SHOPIFY_SHOP_ID` | **Numeric** shop ID (e.g. `25467387989`) | See "Getting the shop ID" below |

### Pixel / analytics vars (add as needed)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Google Analytics 4 (`G-XXXXXXX`) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta / Facebook Pixel |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads conversion (`AW-XXXX` or raw number) |
| `NEXT_PUBLIC_GOAFFPRO_TOKEN` + `NEXT_PUBLIC_GOAFFPRO_SHOP` | GoAffPro affiliate tracking |

### Getting the shop ID (numeric)

Run this against the Admin API:

```bash
curl -s -X POST "https://<shop>.myshopify.com/admin/api/2024-10/graphql.json" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_API_TOKEN" \
  -d '{"query":"{ shop { id name myshopifyDomain } }"}'
```

Response: `{"data":{"shop":{"id":"gid://shopify/Shop/25467387989", ...}}}`

The numeric part after the last slash (`25467387989`) is what you store in `NEXT_PUBLIC_SHOPIFY_SHOP_ID`. **Do not** store the full GID in the env var — let the code wrap it (see section 3).

---

## 2. Critical Library: `@shopify/hydrogen-react`

For headless analytics to show up in the **Shopify Analytics dashboard**, you must send events to Shopify's monorail via `sendShopifyAnalytics()` from `@shopify/hydrogen-react`. This is the only thing that populates the native dashboard for headless storefronts.

```bash
npm install @shopify/hydrogen-react
```

---

## 3. THE shopId Gotcha (this one is vicious)

**Symptom:** Monorail requests return **207 Multi-Status** with body:
```json
[{"status":400,"message":"Schema validation error: [error=shopId: no value provided for required field]"}]
```
Despite `NEXT_PUBLIC_SHOPIFY_SHOP_ID` being correctly set. Shopify Analytics dashboard stays empty forever.

**Root cause:** `sendShopifyAnalytics` internally calls `parseGid()` on the `shopId` field. `parseGid()` expects **GID format** (`gid://shopify/Shop/<id>`). If you pass a plain number:
- `parseGid("25467387989")` → `{ id: undefined }`
- `parseInt(undefined)` → `NaN`
- `JSON.stringify(NaN)` → `null`
- Monorail rejects with 400.

**Fix:** wrap the env var before passing to hydrogen-react. Idempotent — accepts both raw numbers and full GIDs:

```ts
// lib/analytics.ts
const SHOP_ID_RAW = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID ?? ''
const SHOP_ID = SHOP_ID_RAW
  ? (SHOP_ID_RAW.startsWith('gid://') ? SHOP_ID_RAW : `gid://shopify/Shop/${SHOP_ID_RAW}`)
  : ''

function shopifyBase() {
  if (typeof window === 'undefined') return null
  if (!SHOPIFY_DOMAIN || !SHOP_ID) return null
  return {
    shopifySalesChannel: 'headless',
    shopId: SHOP_ID,
    currency: 'EUR',
    hasUserConsent: readConsent().analytics,
    // ... rest of the base payload
  }
}
```

**Verification after deploy:**
1. Incognito → your site → Accept all cookies
2. DevTools → Network → filter `monorail`
3. Click `produce_batch` → should return **200 OK with empty response body** (success)
4. If you still see 207 with schema errors → check the bundle has the value (section 1 curl trick)

---

## 4. Shopify Analytics Dashboard Propagation

Even when everything is wired correctly and monorail returns 200:

- **Headless traffic takes 6–24 hours to appear** in the Shopify Analytics dashboard
- Don't panic or "fix" things the first hour
- Navigate through your site manually after deploy, generate a handful of pageviews
- Come back tomorrow and data should be there

---

## 5. Landing-Page Classification Traps (the silent killer)

Monorail returning 200 and events showing up in the dashboard is **not** the same as landings being classified correctly. Shopify's landing-page classifier has its own logic that can leave your landings tagged as "Geen" (None) in the "Sessies per landingspagina" report even when every event is accepted. Four traps we hit in production:

### Trap 1: Classifier pattern-matches URLs, not just resourceId

The dashboard's classifier uses URL patterns (`/products/[handle]`, `/collections/[handle]`) as a primary signal. If your headless routes don't follow Shopify's convention — e.g. `/product?slug=X`, `/collection/{slug}`, `/shop/{slug}` — landings show up as "Geen" **even when `resourceId` is a correct numeric product GID**.

**Fix without breaking routing:** rewrite only the monorail payload's `path` + `url` fields to Shopify's convention. Browser URL, Next.js routes, canonicals, sitemap, inbound links: all untouched. The helper lives in the analytics layer, not in routing. Locale-aware (strip `/en|nl|de|es` prefixes before matching). Safe-default: unknown paths return unchanged.

```ts
// lib/analytics.ts
function shopifyCompatPath(pathname: string, search: string): string {
  const localeMatch = /^\/(en|nl|de|es)(\/|$)/.exec(pathname)
  const rest = localeMatch ? pathname.slice(localeMatch[1].length + 1) : pathname
  const p = rest === '' ? '/' : rest
  if (localeMatch && p === '/') return '/'
  if (p === '/collection') return '/collections/all'
  const collMatch = /^\/collection\/([^/]+)\/?$/.exec(p)
  if (collMatch) {
    const slug = collMatch[1]
    if (slug === 'accessories') return '/collections/accessories'
    if (isProductLandingSlug(slug)) {
      const handle = SLUG_TO_HANDLE[slug]
      if (handle) return `/products/${handle}`
    }
    return pathname
  }
  if (p === '/product') {
    const slug = new URLSearchParams(search).get('slug') ?? 'default'
    const handle = SLUG_TO_HANDLE[slug] ?? SLUG_TO_HANDLE.default
    return `/products/${handle}`
  }
  return pathname
}
```

Apply in `shopifyBase()` before returning the payload:
```ts
const compatPath = shopifyCompatPath(window.location.pathname, window.location.search)
const compatUrl = window.location.origin + compatPath + window.location.search + window.location.hash
return { /* ... */, url: compatUrl, path: compatPath, search: window.location.search }
```

### Trap 2: `/collection/{slug}` rendering a single-product landing

If your "collection" route is actually a product-family landing page (breadcrumb = "Home / Shop / X Earplugs", hero = one product, 1–4 variants), the classifier still needs it classified as **Product**, not **Collection**. Define a single source of truth:

```ts
// lib/products.ts
export const PRODUCT_LANDING_SLUGS = ['musician', 'dj', 'dentist', /* … */] as const
export function isProductLandingSlug(slug: string): boolean {
  return (PRODUCT_LANDING_SLUGS as readonly string[]).includes(slug)
}
```

Consumed by three sites in `lib/analytics.ts` + `pages/_app.tsx`:
- path-rewrite → `/products/{handle}`
- `resolvePageType` → `'product'`, not `'collection'`
- `isProductPath` → schedules fallback instead of firing the immediate generic PAGE_VIEW

And the landing page itself must fire `trackPageView(url, resourceId, [product])` from a `useEffect` after `getServerSideProps` has the Shopify `product.id` + first variant — **not** only `trackCollectionView` (which is a separate event type that does not populate the landing classification).

### Trap 3: SPA-nav double-fire from fallback timer

Pattern: `_app.tsx` listens to `routeChangeComplete`, and on product-paths calls `schedulePageViewFallback(url, 3000)` — the intent being that the landing page itself fires the authoritative PAGE_VIEW and cancels the timer via `clearPageViewFallback()` inside `trackPageView(url, resourceId, ...)`. Works fine **on hard refresh**. On SPA nav the two can interleave in either order, and when the page's `useEffect` runs **before** `routeChangeComplete`, the `clearPageViewFallback()` call is a no-op (timer isn't scheduled yet) and the fallback then fires ~3 s later with `pageType='page'` and no resourceId — polluting the data with a duplicate beacon that risks the classifier falling back to "Page".

**Fix is ordering-independent:** a module-level URL-keyed flag.

```ts
// lib/analytics.ts
let fallbackPageViewTimer: ReturnType<typeof setTimeout> | null = null
let lastFullPageViewUrl: string | null = null

export function schedulePageViewFallback(url: string, delayMs = 3000) {
  if (lastFullPageViewUrl === url) return      // page already covered this URL
  clearPageViewFallback()
  fallbackPageViewTimer = setTimeout(() => {
    fallbackPageViewTimer = null
    if (lastFullPageViewUrl === url) return    // race: page covered it just in time
    trackPageView(url)
  }, delayMs)
}

export function trackPageView(url: string, resourceId?: string, products?: Product[]) {
  if (resourceId) {
    lastFullPageViewUrl = url                   // mark URL as covered
    clearPageViewFallback()                     // covers the reverse ordering
  }
  // … send beacon …
}
```

Works regardless of whether `routeChangeComplete` or the useEffect fires first: the flag + the clear are both idempotent and both tied to the URL, not to call ordering.

### Trap 4: `products` array hidden in the wrong schema

`sendShopifyAnalytics` from hydrogen-react fans out **multiple schemas** per call. `products` ends up in `custom_storefront_customer_tracking/1.2` (as a **JSON-stringified** array inside `event_name='product_page_rendered'`), **not** in `trekkie_storefront_page_view/1.4`. If you inspect only the page-view schema and see no `products` key, don't conclude it's missing. Inspect both batches in DevTools Network → filter `monorail` → expand the batch → check each schema envelope.

### Four signals must agree

For a product landing, these four must all point at the same product, all derived from one slug → handle/GID pair:

```
path         = /products/{handle}            (via shopifyCompatPath)
pageType     = "product"                     (via resolvePageType)
resourceId   = numeric Shopify product ID    (via getServerSideProps → page useEffect → trackPageView)
products[0]  = { productGid: same, … }       (same source)
```

If any one of them is inconsistent, the classifier can still fall back to "Page" or "Geen".

### Verification routine after deploy

1. **Immediate** (DevTools, 5 min): hard-refresh landing + SPA-nav landing. For each, one monorail batch per navigation. Expand and verify the four signals above.
2. **Zero duplicates**: no second PAGE_VIEW with `pageType='page'` + null resourceId within 5 s of the good one. If present → Trap 3.
3. **24–36 h later**: Shopify Analytics → landing pages report → the routes you fixed should now read "Product" / "Collection", not "Geen".

---

## 6. Consent Gating Architecture

Modern cookie regulations (GDPR/CCPA) require granular consent before firing pixels. Standard pattern:

```ts
// context/consent.tsx
type Consent = { analytics: boolean; marketing: boolean }
// Store as {a:0|1, m:0|1} in localStorage under a stable key
// Expose: useConsent() React hook + readConsent() sync helper for non-React code
```

**Rules:**
- `analyticsAllowed` gates GA4 (analytics cookie category)
- `marketingAllowed` gates Meta Pixel, Google Ads, affiliate trackers
- Pixel scripts must **not render at all** until consent granted — no network requests whatsoever to `connect.facebook.net`, `googletagmanager.com`, etc. before the user clicks Accept
- Gate with `<Script>` tags conditionally rendered based on consent state
- `hasUserConsent` in Shopify monorail payload reflects analytics consent — Shopify may filter events from the dashboard if this is false

---

## 7. Dual Auth Flow Pattern

For customer accounts, two Shopify auth systems commonly coexist:

1. **Storefront API** (`customerAccessTokenCreate`) — classic email/password
2. **Customer Account API** (OAuth) — newer, browser-redirect flow

If you want to support both, unify them in a `lib/unified-customer.ts` that picks the active token from whichever cookie is set. Cookie conventions:
- `storefront_token` — Storefront API token (HttpOnly, Secure, SameSite=Lax)
- `customer_token` — Customer Account API OAuth token (same flags)

**Passwords are never stored by your app** — Shopify handles hashing. But:
- Set minimum password length to **at least 8 characters** (Shopify's default is 5 — too weak)
- Rate limit the login endpoint to prevent credential stuffing
- CSRF Origin check on all mutation endpoints

---

## 8. Performance & Caching

- `shopifyFetch<T>()` helper with 8s timeout (stays under Vercel's 10s serverless limit)
- Retry on 429 / 5xx / GraphQL `THROTTLED` errors (3 attempts, exponential backoff)
- Request coalescing cache with TTL + in-flight promise dedup for read-only queries
- **Mutations bypass cache** (cart mutations, login, etc.)
- Use `getServerSideProps` with CDN caching headers for dynamic collection pages:
  `Cache-Control: s-maxage=600, stale-while-revalidate=3600`

---

## 9. Mobile / Viewport Gotchas (iOS Safari specifically)

- `overflow-x: hidden` on `html`/`body` **breaks `position: fixed`** on iOS Safari. Use `overflow-x: clip` instead.
- iOS Safari's address bar hiding/showing changes viewport height. Use `100dvh` not `100vh`, and avoid calculating heights in JS on scroll.
- Scroll lock (e.g. when cart drawer opens) can survive BFCache restore after Shopify checkout. Explicitly unlock on `pageshow` event.
- Fixed navbars with backdrop-filter can render black on iOS Safari during scroll. Use `transform: translateZ(0)` on the navbar element.

---

## 10. SEO Requirements

Every page must have:
- Per-page `<title>` and meta description (localized)
- Open Graph + Twitter card tags
- `<link rel="canonical">` + `hreflang` tags for multi-language sites
- JSON-LD structured data:
  - `Organization` schema on homepage
  - `Product` schema on product pages
  - `Article` schema on blog pages
- `/sitemap.xml` listing all localized URLs
- `/robots.txt` pointing to the sitemap

---

## 11. Debugging Checklist

When analytics dashboard is empty:

1. **Is the pixel script loaded?** DevTools → Network → filter `gtm`, `fbevents`, `monorail`. If nothing → consent not granted or env vars missing.
2. **Are monorail requests succeeding?** Filter `monorail` → status 200 = good, 207 with 400 schema error = shopId issue (section 3), no requests at all = shopId env var empty at build time.
3. **Is the env var in the bundle?** `curl <chunk-url> | grep <expected-value>`. If missing → redeploy without build cache.
4. **Did you wait 24h?** Shopify dashboard has propagation delay.
5. **Is consent granted?** `localStorage.getItem('<consent-key>')` should show analytics:1.

When dashboard shows traffic but landings read as "Geen":

6. **URL pattern mismatch?** Your routes don't look like `/products/[handle]` / `/collections/[handle]` → see section 5 Trap 1.
7. **pageType says 'page' instead of 'product'?** Missing `resourceId` triggering NaN-fallback → section 5 Trap 2.
8. **Two PAGE_VIEW beacons per landing?** One good + one `pageType='page'` ~3 s later → section 5 Trap 3.
9. **Four signals inconsistent?** `path`, `pageType`, `resourceId`, `products[0].productGid` must all resolve to the same product → section 5 "Four signals must agree".

---

## 12. Things That Will Waste Your Time If You Forget

- `NEXT_PUBLIC_*` changes require manual redeploy
- `heavy-library` (e.g. `isomorphic-dompurify`, ~9MB jsdom) in SSR routes crashes Vercel serverless functions — lazy-import or use client-only
- Don't mix `getStaticPaths` with `getServerSideProps` — pick one per page
- Shopify API version (`2024-10` or whatever) must be consistent across all fetches
- `next-i18next` requires per-page namespace loading via `getStaticProps` / `getServerSideProps`
- GraphQL errors live in `errors[]` OR `customerUserErrors[]` depending on the mutation — check both

---

## 13. First-Day Verification Routine

After initial deploy:

```bash
# 1. Bundle has shop ID
curl -s https://<site>/_next/static/chunks/*.js | grep -o "25467387989" | head -1

# 2. Sitemap + robots work
curl -sI https://<site>/sitemap.xml
curl -sI https://<site>/robots.txt

# 3. Collection pages return 200
for slug in musician dj product-a product-b; do
  curl -sI "https://<site>/collection/$slug" | head -1
done

# 4. Monorail after manual browser test
# DevTools → Network → produce_batch → 200 OK (empty body)
```

If all four pass: you're shipping. If any fail: consult the relevant section above.
