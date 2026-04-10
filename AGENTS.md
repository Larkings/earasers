# AGENTS.md — Earasers Landing Page

Earasers is a **Next.js + TypeScript e-commerce landing page** for award-winning HiFi earplugs, built with NextUI and integrated with Shopify. This guide helps AI agents understand critical architectural patterns and developer workflows.

---

## Architecture Overview

### Multi-Context Provider Stack
The app uses **four primary React contexts** (see `pages/_app.tsx`):
1. **`AuthProvider`** — Shopify Storefront GraphQL authentication (login/register/logout)
2. **`CartProvider`** — Hybrid local + Shopify cart synchronization
3. **`CurrencyProvider`** — EUR/GBP switching with IP-geobased detection
4. **`I18nextProvider`** — Localized content (en, nl, de, es) with per-page namespace bundles

Stack them in order above. They **must wrap component trees that need their context hooks**. Drawer components (`<CartDrawer />`, `<AuthDrawer />`, `<CookieBanner />`) wrap `<Component />` to guarantee context access.

### Shopify Integration
- **Storefront GraphQL API** (`lib/shopify.ts`) — single `shopifyFetch<T>()` function for all queries/mutations
- **Auth tokens**: `customerAccessTokenCreate` mutations return bearer tokens stored in `localStorage` as `earasers-token`
- **Cart sync**: `CartProvider` maintains dual state — local cart in memory + Shopify backend (`shopifyCart`) keyed by variant IDs
- **Checkout flow**: Cart context exposes `checkout()` method that redirects to `shopifyCart.checkoutUrl`

When adding features that touch auth or cart, **test token persistence** in localStorage and **verify Shopify API error responses** include `customerUserErrors` or `errors` array.

### Internationalization Pattern
- Uses `next-i18next` with SSG per locale (default `en`, fallback `en`)
- Locales stored in `/public/locales/{lang}/{namespace}.json` (namespaces: `common`, `home`, `about`, `faq`, `contact`, `returns`, `affiliates`, `collection`, `product`, `account`)
- **Per-page namespace loading**: each page exports `getStaticProps` that loads its specific namespaces via `getStaticProps` from `next-i18next`
- Components use `const { t } = useTranslation('namespace')` to reference keys
- Locale detection auto-runs on first visit via browser language (`detectLocale()` in `_app.tsx`)

**Don't add new UI text without updating locale JSON files.** Untranslated keys render as `key-name` in the UI.

### Styling Convention
- **CSS Modules** — one `.module.css` per component (e.g., `components/hero/hero.module.css`)
- Avoid inline `style={}` unless dynamic; use CSS instead
- Global styles in `styles/globals.css`; component-specific in module files
- **Reveal animation pattern**: elements with `data-reveal` attribute auto-apply `.in-view` class on scroll (configured in `_app.tsx` with `IntersectionObserver`)

### Component Directory Pattern
Each major section is a component folder:
```
components/{name}/
  ├── {name}.module.css
  └── index.tsx
```
Modular sections on homepage: Hero, Trust Band, Use Cases, Best Sellers, Size Quiz, Award Section, Compare Table, How It Works, Reviews, Influencers, Blog Teaser.

---

## Critical Data Flows

### Product Data (`lib/products.ts`)
- Hardcoded product objects keyed by slug (e.g., `musician`, `dj`, `sleeper`)
- Each product has `slug`, `name`, `price`, `originalPrice`, `kitPrice`, `images[]`, `filters[]`, `features[]`, `rating`, `reviews`
- **No database** — products are static; variants fetched from Shopify at runtime
- Use product slug for URL routing: `/product?slug=musician`

### Cart Item Structure (`context/cart.tsx`)
```typescript
{
  id: string;              // slug + size + filter (composite key)
  slug: string;
  variantId?: string;      // Shopify variant GID (e.g., "gid://shopify/ProductVariant/...")
  shopifyLineId?: string;  // Cart line ID after sync
  price: number;
  qty: number;
  // + display fields: name, img, size, filter
}
```
When adding to cart from product page, **populate `variantId` from Shopify query** so Shopify sync works. Empty `variantId` means item stays local only.

### Authentication Flow
1. User submits email + password → `shopifyFetch` `customerAccessTokenCreate` mutation
2. Success returns `accessToken` + `expiresAt` → stored in localStorage as `earasers-token`
3. Query `customer(customerAccessToken: $token)` to fetch user data
4. User object cached in reducer state + localStorage as `earasers-user`
5. Logout → token revoked at Shopify, localStorage cleared, state reset

**Error handling**: Shopify returns `customerUserErrors` array; display first error message to user. Don't assume mutation succeeded without checking.

---

## Developer Workflows

### Start Development
```bash
npm install
npm run dev
```
Opens http://localhost:3000. Environment variables required:
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` (e.g., `earasers-eu.myshopify.com`)
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` (Storefront API access token)

### Build & Test
```bash
npm run build       # SSG prerender + optimization
npm start           # Production server
npm run lint        # ESLint check (config: `eslint.config.mjs`)
```

### Adding a Page
1. Create `pages/my-page.tsx`
2. Export `getStaticProps` with `getStaticProps` from `next-i18next` (copies default locale setup)
3. Add namespaces to `next-i18next.config.js` if new ones needed
4. Create `/public/locales/{en,nl,de,es}/my-page.json` translation files
5. **Must SSR or SSG all pages** — client-side rendering breaks i18n

### Adding a Locale or Updating Translations
- Edit JSON files in `/public/locales/{locale}/{namespace}.json`
- No restart needed in dev mode; hot-reload works
- Test each locale by appending `?locale=de` to URL or changing in language picker

### Middleware & Rate Limiting
`middleware.ts` applies **60 requests per minute per IP** to `/api/*` routes only. Other routes bypass it. Enforce rate limits in custom API endpoints via `NextResponse.json({ error: '...' }, { status: 429 })`.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `pages/_app.tsx` | Provider stack, i18n setup, scroll-reveal observer |
| `context/auth.tsx` | Shopify auth state + localStorage persistence |
| `context/cart.tsx` | Dual cart sync (local + Shopify) |
| `context/currency.tsx` | EUR/GBP switching with geolocation fallback |
| `lib/shopify.ts` | GraphQL fetch wrapper + API config |
| `lib/shopify-cart.ts` | Cart operations (create, add, update, remove) |
| `lib/products.ts` | Hardcoded product catalog |
| `next-i18next.config.js` | i18n configuration (locales, namespaces, paths) |
| `middleware.ts` | Rate limiting on API routes |

---

## Common Pitfalls

1. **Forgetting to wrap context consumers** — components using `useAuth()`, `useCart()`, etc. must be descendants of their provider in `_app.tsx`
2. **Untranslated UI keys** — renders as literal key names; always update `/public/locales` files when adding text
3. **Cart sync without `variantId`** — items won't persist to Shopify; verify variant ID populated from product page query
4. **Rate limit not enforced** — middleware only protects `/api` routes; other endpoints need manual validation
5. **Image optimization misconfigured** — remote images must match `remotePatterns` in `next.config.js` (Shopify CDN + YouTube thumbnails allowed)

---

## Security & Performance Notes

- **Security headers** configured in `next.config.js` (CSP, XSS protection, geolocation denial)
- **Image formats**: AVIF + WebP with fallbacks; responsive device sizes (375–1536px)
- **Auth tokens**: short-lived, revoked on logout; sensitive data in `earasers-*` localStorage keys
- **Rate limiting**: in-memory store per serverless instance; resets on cold start
- **Client secrets**: `NEXT_PUBLIC_*` prefix means visible in browser (Storefront tokens are intentionally public per Shopify design)

---

## Example: Adding a New Feature

**Scenario: Add a "Favorites" context for bookmarking products**

1. Create `context/favorites.tsx` with reducer pattern (like `cart.tsx`)
2. Add `FavoritesProvider` to provider stack in `_app.tsx`
3. Export `useFavorites()` hook
4. Save favorites to `localStorage` on state change
5. Add heart icon button in product component: `onClick={() => useFavorites().toggle(slug)}`
6. Persist across sessions via localStorage rehydration on mount

---

**Last updated: April 2026**

