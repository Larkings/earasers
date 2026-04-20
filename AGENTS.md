# AGENTS.md — Earasers Landing Page

Earasers is a **Next.js + TypeScript e-commerce landing page** for award-winning HiFi earplugs, built with NextUI and integrated with Shopify. This guide helps AI agents understand critical architectural patterns, developer workflows, and the hard-won mobile/viewport gotchas we've hit in production.

---

## Architecture Overview

### Multi-Context Provider Stack
Stacked in `pages/_app.tsx` (outer → inner):
1. **`I18nextProvider`** — Localized content (en, nl, de, es) with per-page namespace bundles
2. **`ConsentProvider`** — Granular cookie consent (`{analytics, marketing}`) for pixel gating
3. **`CurrencyProvider`** — EUR/GBP switching with IP-geobased detection
4. **`AuthProvider`** — Shopify Storefront GraphQL authentication
5. **`CartProvider`** — Hybrid local + Shopify cart synchronization

Drawer components (`<CartDrawer />`, `<AuthDrawer />`, `<CookieBanner />`, `<AnalyticsScripts />`) are rendered **inside** `<CartProvider>` so they have access to all contexts.

### Shopify Integration
- **Storefront GraphQL API** (`lib/shopify.ts`) — `shopifyFetch<T>()` with built-in retry (3 attempts, exponential backoff) on 429 / 5xx / timeouts / GraphQL `THROTTLED` errors. 8s per-attempt timeout to stay under Vercel's 10s serverless budget.
- **Request coalescing cache** (`lib/shopify-cache.ts`) — TTL + in-flight promise dedup for read-only queries (`getProductWithVariants`, `getCollectionProducts`, `getAccessoryProduct`). Mutations (cart, login) bypass the cache.
- **Auth tokens**: `customerAccessTokenCreate` mutations return bearer tokens stored as httpOnly cookies (`storefront_token`).
- **Cart sync**: `CartProvider` maintains dual state — local cart in memory + Shopify backend (`shopifyCart`) keyed by variant IDs.
- **Checkout**: Cart context exposes `checkout()` that redirects to `shopifyCart.checkoutUrl`. Purchase events fire on Shopify side (Customer Events), not here.

When adding features that touch auth or cart, **test token persistence** and **verify Shopify API error responses** include `customerUserErrors` or `errors` array.

### Internationalization Pattern
- `next-i18next` with SSG per locale (default `en`, fallback `en`)
- Locales in `/public/locales/{lang}/{namespace}.json` (namespaces: `common`, `home`, `about`, `faq`, `contact`, `returns`, `affiliates`, `collection`, `product`, `account`)
- Per-page namespace loading via `getStaticProps`
- `useTranslation('namespace')` in components
- Locale auto-detect on first visit via browser language (`detectLocale()` in `_app.tsx`)

**Don't add UI text without updating locale JSON files in all four languages.**

### Styling Convention
- **CSS Modules** — one `.module.css` per component
- Avoid inline `style={}` unless dynamic
- Global styles in `styles/globals.css`
- Reveal animation: `data-reveal` attribute auto-applies `.in-view` via `IntersectionObserver` in `_app.tsx`

---

## Mobile & Viewport Patterns (Hard-Won Rules)

This section exists because we've been bitten by every single one of these. **Follow them religiously** when touching layout-sensitive code.

### Rule 1: `overflow-x: hidden` on `html`/`body` breaks `position: fixed` on iOS Safari
Use `overflow-x: clip` instead. `clip` hides horizontal overflow without creating a scroll container, so fixed elements keep working. Safari 16+, Chrome 90+ — sufficient coverage.

See `styles/globals.css` — this one rule fixed a navbar that was stuttering/disappearing during scroll.

### Rule 2: Viewport-height units — pick the right one
| Unit | Use case | Avoid for |
|---|---|---|
| `100svh` | Modals, drawers, cart drawer | Full-page hero sections |
| `100dvh` | Full-page sections where adapting to address bar is OK | Modals (causes jumpiness when iOS address bar toggles) |
| `100vh` | **Fallback only** — always paired with `svh` or `dvh` override | Primary value |

CartDrawer uses `100svh` (stable, no jump). Full-page pages can use `100dvh` if needed.

### Rule 3: Don't put `transform` or `will-change: transform` on `position: fixed` elements
On iOS Safari, this breaks the "fixed" behavior — the element starts behaving like `absolute` or renders a black GPU-buffer rectangle during scroll. We tried this as a "fix" for backdrop-filter flicker and it made things worse.

### Rule 4: `backdrop-filter` on fixed elements flickers/renders-black during iOS scroll
The GPU compositing layer can't sample the scrolled pixels correctly. **Disable backdrop-filter on mobile viewports** via media query; keep it for desktop (≥1024px) where it works fine.

Pattern in `components/navbar/navbar.module.css`:
```css
.header { background: rgba(255,255,255,0.88); backdrop-filter: blur(12px); }
@media (max-width: 1023px) {
  .header { background: #fff; backdrop-filter: none; }
}
```

### Rule 5: Body scroll-lock for modals must be BFCache-proof
Simple `body.style.overflow = 'hidden'` is NOT enough on iOS (touch-scroll goes through). Use:
1. `position: fixed` on body with negative `top: -scrollY`
2. Restore scroll position on cleanup
3. **Listen to `pagehide`** to run cleanup before BFCache snapshot — otherwise user comes back via BACK button to a locked page
4. **Listen to `pageshow` with `e.persisted`** to detect BFCache restore and reset state

Reference implementation: `components/cart-drawer/index.tsx`.

### Rule 6: Safe-area-insets must be applied per side separately
- Elements at `top: 0` need `padding-top: env(safe-area-inset-top, 0px)` OR the containing var must account for it (see `--bar-height` in globals.css)
- Footer CTAs need `padding-bottom: max(20px, env(safe-area-inset-bottom, 0px))`
- Landscape orientation: `padding-left/right: env(safe-area-inset-left/right, 0px)` for elements touching screen edges
- Viewport meta must have `viewport-fit=cover` (set in `_app.tsx`)

### Rule 7: Scrollable internal areas need proper touch ergonomics
Any `overflow-y: auto` on mobile should also have:
```css
-webkit-overflow-scrolling: touch;
overscroll-behavior: contain;
```
Without `overscroll-behavior`, scrolling inside a drawer/menu chains to the underlying page.

### Rule 8: Grid/flex items default `min-width: auto` blows out `1fr` columns
When a grid item contains a horizontally scrollable child (e.g. a thumbs row), the default `min-width: auto` makes the grid column refuse to shrink below the child's intrinsic width. Result: `grid-template-columns: 1fr 1fr` becomes lopsided the moment the scroller has many items.

Fix: `min-width: 0` on the offending grid/flex item. Lets the column respect `1fr`; the child's own `overflow-x: auto` then handles scrolling.

Hit this when bumping `images(first: 5 → 20)` on the accessory gallery — the 2-column product layout collapsed. The gallery component wasn't broken; the thumb row's intrinsic width just outgrew the column.

### Rule 9: Inline `style={}` on `<Image>` beats CSS module class rules
`<Image className={styles.thumb} style={{ objectFit: 'cover' }} />` — inline wins. If you're trying to change `object-fit` via CSS and nothing happens, check the JSX for an inline override.

---

## Analytics & Pixel Integration

### Three-layer tracking
1. **Shopify Customer Events** (configured in Shopify Admin) — handles checkout + purchase events
2. **Next.js client-side pixels** — handles browse/cart events before checkout
3. **Google Analytics 4** via gtag — cross-session analytics

### Consent gating (`context/consent.tsx`)
- Storage: JSON `{a:0|1, m:0|1}` under `earasers-cookie-consent` key (backwards-compat with legacy `'all'`/`'necessary'` strings)
- `analyticsAllowed` → gates GA4
- `marketingAllowed` → gates Meta Pixel, Google Ads, GoAffPro
- `readConsent()` is the sync helper for non-React code (use in `lib/analytics.ts`)

### Pixel scripts (`components/analytics/scripts.tsx`)
- Renders Script tags conditionally based on consent
- Zero network calls before consent is granted
- Env vars (all `NEXT_PUBLIC_*`, baked at build time — add to Vercel Project Settings):
  - `NEXT_PUBLIC_META_PIXEL_ID`
  - `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
  - `NEXT_PUBLIC_GOOGLE_ADS_ID`
  - `NEXT_PUBLIC_GOAFFPRO_TOKEN` + `NEXT_PUBLIC_GOAFFPRO_SHOP`
  - `NEXT_PUBLIC_SHOPIFY_SHOP_ID` — **numeric Shopify shop ID** (get via Admin API `{ shop { id } }`, extract last segment of the returned GID). Code wraps it in `gid://shopify/Shop/<id>` before passing to hydrogen-react.
  - `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` — myshopify domain
  - `NEXT_PUBLIC_SHOPIFY_SHOP_ID` (numeric) is REQUIRED for Shopify Analytics dashboard to show headless traffic

### Shopify monorail / Analytics dashboard gotchas
- `sendShopifyAnalytics` from `@shopify/hydrogen-react` calls `parseGid()` internally on `shopId`. If you pass a raw number (e.g. `"25467387989"`), parseGid returns `{id: undefined}` → `parseInt(undefined)` → `NaN` → JSON serializes as `null` → monorail rejects batch with **400 "shopId: no value provided for required field"** → Shopify Analytics dashboard stays empty.
- **Fix** (already applied in `lib/analytics.ts:39-44`): wrap raw env var in `gid://shopify/Shop/${raw}` before assigning to `SHOP_ID`. Accepts already-GID values too (idempotent).
- **Verify** after deploy: DevTools Network → filter `monorail` → `produce_batch` should return **200 OK with empty body** (not 207 Multi-Status). Response body `[{"status":200}]` = success.
- **Dashboard propagation delay**: headless traffic takes **6-24 hours** to appear in Shopify Analytics. Don't panic if the dashboard is empty right after a fix.
- **`NEXT_PUBLIC_*` build-time inlining**: adding/changing these in Vercel does NOT auto-redeploy. Must trigger redeploy (and uncheck "Use existing Build Cache" if values seem stale). Verify a value is actually in the bundle with: `curl -s https://<site>/_next/static/chunks/<chunk>.js | grep <value>`.
- **Consent gating caveat**: if user hasn't clicked "Accept all", `hasUserConsent: false` is sent. Shopify may filter these events from the dashboard regardless of monorail accepting them.

### Event helpers (`lib/analytics.ts`)
- `trackPageView(url, resourceId?, products?)` — fires on mount AND `routeChangeComplete`. For product landings (both `/product?slug=X` and `/collection/{productLandingSlug}`), the landing page itself passes `resourceId` (Shopify GID) + `products` so the Analytics classifier categorizes as "Product". Without those, `resolvePageType` + NaN-fallback degrades `pageType` to 'page' safely (prevents `resourceId: NaN → null → monorail 400`).
- `schedulePageViewFallback(url, delayMs)` — `_app.tsx` calls this instead of `trackPageView` for paths where the page is going to fire the authoritative event itself (see `isProductPath`). If the page-useEffect never fires (data missing, crash), the 3 s timer fires a generic `pageType='page'` beacon so the session isn't lost. **Race-guard**: module-level `lastFullPageViewUrl` in `lib/analytics.ts` — `trackPageView` with `resourceId` sets it, the scheduler skips when it matches. Ordering-independent: SPA nav's `routeChangeComplete` vs. the new page's `useEffect` can run in either order without producing a duplicate beacon.
- `trackProductView` / `view_item` — on product page variant mount
- `trackCollectionView` — on `/collection/accessories` (real multi-product collection) and as fallback when `getServerSideProps` couldn't fetch the product GID
- `trackAddToCart` / `trackRemoveFromCart` — in cart context mutations
- `trackViewCart` — on cart drawer open
- `trackCheckoutStarted` / `begin_checkout` — before redirect to Shopify
- `trackSignUp` / `CompleteRegistration` — on successful register

### Landing-page classification (the URL-pattern trap)

Shopify Analytics' landing-page classifier primarily pattern-matches URLs: `/products/[handle]` → "Product", `/collections/[handle]` → "Collection". A correct `resourceId` is **not** sufficient if the URL doesn't match — the dashboard's "Sessies per landingspagina" report shows "Geen" and conversion funnels break. Headless storefronts whose routes don't follow Shopify's convention hit this.

**Our three-layer fix (commits `22c8c03` / `a680f28` / `666af0e`, April 2026):**

1. **`shopifyCompatPath(pathname, search)`** in `lib/analytics.ts` — rewrites only the monorail payload's `path` + `url` fields to Shopify convention. Browser URL, Next.js routes, canonicals, sitemap, inbound links: all unchanged. Locale-aware (strips `/en|nl|de|es` prefix before matching). Safe-default: unknown paths return unchanged.
2. **`PRODUCT_LANDING_SLUGS`** in `lib/products.ts` — single source of truth for slugs under `/collection/*` that semantically render a single-product landing (breadcrumb + hero + one product), not a multi-product browse. Consumed by three call sites:
   - `shopifyCompatPath` → rewrites to `/products/{handle}`
   - `resolvePageType` → returns `'product'` (not `'collection'`)
   - `pages/_app.tsx` `isProductPath` → schedules fallback instead of firing the immediate generic PAGE_VIEW
3. **The landing page fires the authoritative PAGE_VIEW itself** (see `pages/collection/[slug].tsx` and `pages/product.tsx`), with `resourceId` + `products` from `getServerSideProps` / `getStaticProps`. Ref-guarded per slug so variant-switch doesn't duplicate, and so SPA nav `musician → dj` still fires a new one.

Four classifier signals must agree: `path`, `pageType`, `resourceId`, `products[0].productGid` — all pointing at the same product, all derived from the same `SLUG_TO_HANDLE[slug]` keying.

**`products` in the payload**: hydrogen-react splits these across two schemas. `trekkie_storefront_page_view/1.4` does **not** carry `products`. `custom_storefront_customer_tracking/1.2` event `product_page_rendered` does — as a JSON-stringified array. When debugging an "empty products" claim, always inspect both schemas in the monorail batch.

---

## Security

### Headers (`vercel.json`)
- HSTS (2y + preload)
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy (camera, mic, geolocation, FLoC all denied)
- Content-Security-Policy: explicit allowlist for Shopify CDN, GTM, Meta, GoAffPro, Upstash, Google Fonts

**When adding a new external script/image/iframe source, update the CSP** in `vercel.json` or the browser will block it.

### CSRF (`lib/csrf.ts`)
`checkOrigin(req, res)` on all mutation endpoints (POST/PUT/DELETE). Rejects requests without a matching Origin/Referer.

### Rate limiting (`lib/rate-limit.ts`)
- **Not middleware** — each API route calls `await rateLimit(req, res, { limit, windowMs, name })` explicitly
- Async signature. Callers must `await` (and invert with `!(await ...)`)
- Uses Upstash Redis via REST API when `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` env vars are set (cross-instance limit on serverless)
- Falls back to per-instance in-memory bucket if Upstash vars missing
- Current limits:
  - `/api/auth/login` → 10/min
  - `/api/auth/register` → 5/15min
  - `/api/auth/forgot-password` → 3/10min
  - `/api/auth/set-token` → 20/5min
  - `/api/accessories` → 60/min
  - `/api/contact` → 3/10min

### Stock validation
Product page + accessory page check `availableForSale` before add-to-cart and buy-now to prevent selling out-of-stock items. Uses `soldOut` translation key.

---

## Critical Data Flows

### Product Data (`lib/products.ts`)
- Hardcoded product objects keyed by slug (`musician`, `dj`, `dentist`, `sleeping`, `motorsport`, `sensitivity`)
- Each has `slug`, `name`, `price`, `originalPrice`, `kitPrice`, `images[]`, `filters[]`, `features[]`, `rating`, `reviews`
- **No database** — products are static; variants fetched from Shopify at runtime
- Use product slug for URL routing: `/product?slug=musician`
- `SLUG_TO_HANDLE` maps category slug → Shopify product handle (authoritative — don't recreate a separate mapping)

### Product Gallery & Media
- Galleries live on `pages/product.tsx` (category) and `pages/accessory/[handle].tsx`. Both use `styles/product.module.css` — changes there hit both pages.
- **Category pages = hybrid**: hardcoded hero images (`PRODUCTS[slug].images`) merged with Shopify media via `new Set([...hardcoded, ...shopify])`. Hardcoded first for hero positioning; Shopify fetch failure → gallery falls back to hardcoded only.
- **Accessory pages = pure Shopify** via `getAccessoryProduct(handle)`.
- Shopify image queries use `images(first: 20)` in `getProductWithVariants` and `fetchAccessoryProduct`. Raise the limit, don't add a separate query — images come back on the same call used for variants, so no extra Shopify round-trip.
- **`object-fit: contain`** on `.mainImg img` (not `cover`) — galleries mix square product photos with wide infographics (comparison charts ~12:5). `cover` crops the charts; `contain` letterboxes with the container background (`--color-surface-2`) and preserves both aspect ratios.
- **Click-to-zoom lightbox**: `<ImageLightbox src alt open onClose />` in `components/zoomable-image/lightbox.tsx`. Wraps the main gallery image in a `<button className={styles.mainImg}>` that toggles `lightboxOpen` state. Lightbox supplies fullscreen view, 100/200/300% zoom, ESC close, body scroll-lock, safe-area insets. Separate from `<ZoomableImage>` which is a self-contained trigger+lightbox unit used in the specs tab.
- **Shopify content freshness**: `cachedRead` TTL (60s) + ISR `revalidate: 300` → Shopify media updates propagate in ~5–6 min. This is intentional so the shop owner can self-edit media without a redeploy.

### Cart Item Structure (`context/cart.tsx`)
```typescript
{
  id: string;              // slug + size + filter (composite key)
  slug: string;
  variantId?: string;      // Shopify variant GID
  shopifyLineId?: string;  // Cart line ID after sync
  price: number;
  qty: number;
  // + display fields: name, img, size, filter
}
```
Populate `variantId` from Shopify query when adding to cart, or Shopify sync won't work.

### Authentication Flow
1. User submits email + password → `customerAccessTokenCreate` mutation
2. Success returns `accessToken` + `expiresAt` → stored as httpOnly cookie `storefront_token`
3. Query `customer(customerAccessToken: $token)` to fetch user data
4. Logout → token revoked at Shopify, cookie cleared, state reset

Shopify returns `customerUserErrors` array on failure — display first error message.

---

## Developer Workflows

### Start Development
```bash
npm install
npm run dev
```
Required env vars in `.env.local`:
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`
- `SHOPIFY_ADMIN_API_TOKEN` (server-only)

Optional (enables features if present):
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (distributed rate limiting)
- `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOAFFPRO_TOKEN`, `NEXT_PUBLIC_GOAFFPRO_SHOP`

### Build & Test
```bash
npm run build       # SSG prerender
npm start           # Production server
npm run lint        # ESLint check
npx tsc --noEmit    # Type check (no emit)
```

**Before pushing:** run build + lint + typecheck. Build errors in pre-deploy are cheaper than failed Vercel deploys.

### Adding a Page
1. Create `pages/my-page.tsx`
2. Export `getStaticProps` via `lib/i18n.ts` `serverSideTranslations`
3. Create `/public/locales/{en,nl,de,es}/my-page.json`
4. **Must SSR or SSG** — client-only rendering breaks i18n

### Adding an API route
1. Create `pages/api/my-route.ts`
2. **Call `checkOrigin()` for mutations** (POST/PUT/DELETE)
3. **Call `await rateLimit()`** with a unique `name` namespace and sensible limit
4. Wrap Shopify calls in try/catch — `shopifyFetch` throws on all non-2xx / GraphQL errors

### Adding a third-party script / image source
1. Add to `vercel.json` CSP allowlist (script-src, img-src, connect-src as appropriate)
2. If image: add to `next.config.js` `remotePatterns`
3. Gate on consent if tracking-related

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `pages/_app.tsx` | Provider stack, i18n setup, scroll-reveal, page_view tracking |
| `context/auth.tsx` | Shopify auth state + cookie persistence |
| `context/cart.tsx` | Dual cart sync (local + Shopify) + tracking hooks |
| `context/currency.tsx` | EUR/GBP switching with geolocation fallback |
| `context/consent.tsx` | Granular cookie consent `{analytics, marketing}` |
| `lib/shopify.ts` | GraphQL fetch with retry + exponential backoff |
| `lib/shopify-cache.ts` | Request coalescing + TTL cache for reads |
| `lib/shopify-cart.ts` | Cart operations (create, add, update, remove) |
| `lib/products.ts` | Hardcoded product catalog + variant helpers |
| `lib/analytics.ts` | Pixel event helpers (Shopify + Meta + GA4) |
| `lib/rate-limit.ts` | Upstash-backed rate limiter with in-memory fallback |
| `lib/csrf.ts` | `checkOrigin()` for mutation endpoints |
| `components/analytics/scripts.tsx` | Consent-gated pixel script injection |
| `vercel.json` | Security headers, CSP, redirects |
| `next-i18next.config.js` | i18n configuration |

---

## Common Pitfalls

1. **`overflow-x: hidden` on `html`/`body`** — breaks iOS fixed positioning. Use `overflow-x: clip`.
2. **`100vh` in a modal on mobile** — iOS address bar toggle causes layout jump. Use `100svh`.
3. **`transform` / `will-change: transform` on fixed elements** — breaks iOS fixed positioning. Don't.
4. **Body scroll-lock without `pagehide` listener** — BFCache restores locked state, user can't scroll after BACK from checkout.
5. **Forgetting to `await rateLimit()`** — it's async now; forgetting await silently lets all requests through.
6. **Cart item without `variantId`** — won't sync to Shopify, item stays local-only.
7. **Untranslated UI keys** — render as literal `key.name`. Update all four locale files.
8. **New third-party script without CSP update** — silently blocked by browser.
9. **`NEXT_PUBLIC_*` env var added locally but not in Vercel** — works in dev, dark in prod (baked at build time).
10. **GA4 without initial `page_view` fire** — `send_page_view: false` means you must fire on mount AND on routeChangeComplete, not just routeChangeComplete.
11. **Meta Pixel double-firing `InitiateCheckout`** — Next.js fires on checkout click AND Shopify Customer Event fires on checkout page load. Accept small overcount or use `event_id` dedup.
12. **Missing `availableForSale` check** — customers can buy out-of-stock. Check before add-to-cart AND buy-now flows.
13. **`images(first: N)` limits too low** — Shopify silently returns only N media items. Default queries used 2/5; bumped to 20. Check query before assuming Shopify "doesn't have" more media.
14. **Grid columns collapsing after adding more gallery items** — `min-width: auto` default. Add `min-width: 0` to the gallery column (see Viewport Rule 8).
15. **Inline `style={{ objectFit }}` silently beats CSS module** — strip the inline prop if you want CSS to win (see Viewport Rule 9).
16. **Recreating `SLUG_TO_HANDLE`** — the mapping already exists in `lib/products.ts`. Don't maintain two.
17. **Classifying `/collection/{slug}` as a collection when it renders a product landing** — Shopify Analytics cares about intent, not URL literal. Product-family landings under `/collection/*` must fire PAGE_VIEW with `pageType='product'` + `resourceId` from the page itself, not just `trackCollectionView`. See `PRODUCT_LANDING_SLUGS` in `lib/products.ts`.
18. **Relying on `clearPageViewFallback()` call order in SPA nav** — `_app.tsx`'s `routeChangeComplete` and the new page's `useEffect` interleave unpredictably. If useEffect runs first, it has no timer to clear; the scheduler then fires the fallback unopposed. Always use the URL-keyed `lastFullPageViewUrl` flag, not call ordering.
19. **Assuming `products` is missing when it's not in the first schema** — hydrogen-react puts `products` into `custom_storefront_customer_tracking/1.2` as a JSON-string, not into `trekkie_storefront_page_view/1.4`. Check both schemas in the monorail batch before declaring a regression.
20. **Rewriting the browser URL instead of just the monorail payload** — changing Next.js routes or `history.replaceState` to please Shopify's classifier breaks SEO, canonicals, inbound links, ads URLs. `shopifyCompatPath` only mutates the monorail POST body; the user-visible URL stays exactly as the route handler serves it.

---

## Security & Performance Notes

- **Security headers** configured in `vercel.json` (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- **Image formats**: AVIF + WebP with fallbacks; responsive device sizes (375–1536px); Shopify CDN in `next.config.js` remotePatterns
- **Rate limiting**: Upstash if configured, in-memory fallback otherwise
- **Shopify API resilience**: 3-attempt retry, 8s per-attempt timeout, 60s read cache, in-flight dedup
- **Client secrets**: `NEXT_PUBLIC_*` prefix means visible in browser (Storefront tokens are intentionally public per Shopify design; admin tokens must stay server-only)

---

## Debugging checklist for mobile bugs

When a mobile bug appears, work through these in order:

1. Open Safari remote debugging (Mac: Develop → iPhone → [page])
2. Check Console for CSP violations
3. Inspect the `html` and `body` for any `overflow` besides `clip` or `visible`
4. Check for `transform` / `will-change` / `filter` / `backdrop-filter` on ancestors of the broken fixed element
5. For viewport-height issues: check if `vh` is used where `svh`/`dvh` should be
6. For scroll-lock issues: verify cleanup runs (add `console.log` in useEffect return)
7. For BFCache issues: test with Safari Develop → Web Inspector → Timelines, watch for pagehide/pageshow

---

**Last updated: April 2026** — added product gallery hybrid pattern (hardcoded hero + Shopify media), `<ImageLightbox>` click-to-zoom, `min-width: 0` grid rule, `object-fit: contain` for mixed-aspect galleries, and the inline-style-vs-CSS-module gotcha after expanding Shopify media from `first: 5` to `first: 20`. Analytics fixes C+D+E (`22c8c03`/`a680f28`/`666af0e`): `shopifyCompatPath()` monorail-only URL rewrite, `PRODUCT_LANDING_SLUGS` single source of truth for `/collection/{slug}` product landings, and `lastFullPageViewUrl` race-guard for the `routeChangeComplete` vs `useEffect` ordering problem on SPA nav.
