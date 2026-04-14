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

### Event helpers (`lib/analytics.ts`)
- `trackPageView` — fires on mount AND `routeChangeComplete` (GA4 has `send_page_view: false` so manual firing is required; without the mount fire, initial landing pages would be missed)
- `trackProductView` / `view_item` — on product page variant mount
- `trackAddToCart` / `trackRemoveFromCart` — in cart context mutations
- `trackViewCart` — on cart drawer open
- `trackCheckoutStarted` / `begin_checkout` — before redirect to Shopify
- `trackSignUp` / `CompleteRegistration` — on successful register

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

**Last updated: April 2026** — updated after shipping analytics integration, CSP, distributed rate limiting, and hardening the mobile viewport / fixed-positioning story end-to-end.
