# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

DebuggerMind — Next.js 15 (App Router) e-commerce frontend. React 19, TypeScript, Tailwind, shadcn/ui (Radix), Jotai. Talks to an external backend API (the "DotNet" in the repo name); there is no local backend in this repo. Bengali (`bn`) is the primary user-facing language.

## Commands

```bash
npm run dev          # Next dev server on :3000
npm run build        # Production build
npm start            # Start built app
npm run lint         # ESLint (next lint)
npm run lint:fix     # ESLint --fix
npm run type-check   # tsc --noEmit (no test runner is configured)
npm run format       # Prettier on app/**
```

Install with `npm install --legacy-peer-deps` (React 19 peer-dep churn). No test suite is wired up — don't claim tests pass; run `type-check` + `lint` instead.

Required env in `.env.local`: `API_BASE_URL`, `API_BASE_URL_V1`, `NEXT_PUBLIC_SITE_URL`. See `.env.example`. Variant-mode envs (see Variants below): `NEXT_PUBLIC_SHOWCASE=true` to browse the demo gallery locally, or `ACTIVE_VARIANT=<id>` to pin one variant (client-deploy mode). `.claude/settings.json` denies editing `.env*` files except `.env.example` — the user manages `.env.local` themselves.

## Architecture

### Path alias

`@/*` → `app/*` (see `tsconfig.json`). All imports use this alias, e.g. `@/lib/api-client`, `@/components/shared/ui/button`. Don't introduce relative `../../` imports.

### Route triplet convention

Each route folder under `app/(app-routes)/` uses three co-located files:

- `page.tsx` — Server Component (data fetching, SEO, initial render)
- `action.ts` — Server actions (`"use server"`) that call the backend via `ApiClient`
- `model.ts` — TypeScript types/interfaces for that route's responses

When adding a route, follow this triplet. Keep `page.tsx` server-only; isolate interactivity into small client components (e.g. `ProductFilters.tsx`, `ProductToolbar.tsx`) rather than wrapping the whole page in a `*PageClient.tsx`.

### API layer (fluent builder)

All HTTP calls go through `ApiClient` in `app/lib/api-client.ts`:

```ts
const res = await new ApiClient(apiRoutes.products)
  .withMethod("GET")
  .withParams({ per_page: 12 })
  .withCookieHeaders(cookies())   // for authenticated calls
  .execute<ProductsResponse>();
```

- Endpoints live in `app/lib/api-route.ts`; base URL is `API_BASE_URL_V1`.
- `withCookieHeaders` reads `AUTH_TOKEN_COOKIE_NAME` (`__token__`) and runs token-expiry/refresh logic before fetch — preserve that path when editing `execute()`.
- Default `cache: "no-store"`. Use `.withCache(tags, revalidate)` for cached server reads.
- Errors are returned as `ApiResponse<T>`-shaped objects (not thrown). Callers should branch on `success`.

### Multi-website (store identity)

One backend + one database serve several storefronts. `execute()` attaches `X-Website-Key` to **every** call; the backend uses it to filter which products are visible and to stamp the order's source. Never send a website id in a body or query string — it is spoofable and the backend ignores it.

- Keys live in `app/lib/config/website.config.ts`: per-variant (`WEBSITE_KEY_BN_01`, …) with a deployment-wide `WEBSITE_KEY` fallback. Server-only — **no `NEXT_PUBLIC_` prefix** (deliberate deviation from the backend guide, which assumed browser→backend calls). Add a literal line to `VARIANT_WEBSITE_KEYS` for a new variant; a dynamic `process.env[name]` lookup is not inlined by Next and yields `undefined`.
- The variant is read from the `x-variant` header (`PINNED_VARIANT_ID`/`DEFAULT_VARIANT_ID` outside a request scope), so the active variant decides the store.
- `withCache` tags are additionally scoped as `site:<variant>` and `<variant>:<tag>` so one store can be revalidated alone. The differing header already separates Data Cache entries.
- A rejected key (HTTP 401) sets `websiteKeyError` on the response and logs loudly. Detect it with `hasWebsiteKeyError(response)` and render `StoreConfigError` — never a retry, it is a deploy misconfiguration. A product not assigned to this store 404s, which the PDP already handles.

### Payments

Only **COD, Stripe and PayPal** are implemented server-side — bKash / Nagad / SSLCommerz have no API, so don't add them as options. Routes are under `API_ROUTES.PAYMENT_METHOD` (`payments/{stripe,paypal}/...`). The two gateways show at checkout only when the variant's `onlinePayments` flag is on (off for bn-01 / bdbazaronline.com → COD only).

- COD completes in `createPurchaseOrder`. The two gateways create the order first (unpaid), then `initiateGatewayPayment(method, orderId)` returns a URL the browser is sent to with `window.location.assign` (external URL — not a router push).
- The cart is **not** cleared on hand-off; an abandoned gateway leaves a payable order at `/profile/orders/<id>`, where "Pay Now" retries either gateway.
- PayPal only *authorises* on approval. `/paypal-return` must run `capturePaypalPayment` or the money is never taken — the backend's PayPal `return_url` has to point there. Ids survive the redirect via `app/lib/utils/paypal-handoff.ts` (sessionStorage), which also carries the purchased cart lines so a Buy Now order clears only its own line.

### Auth flow

1. JWT in cookie `__token__` (see `app/lib/config/auth.config.ts`).
2. `middleware.ts` gates `/profile` and `/admin`; redirects authed users away from `/login`, `/register`. It also injects `x-pathname` on every response so server components know the current path.
3. `AuthInitializer` (in the global provider) hydrates `miniProfileAtom` from the API on mount.
4. To add a protected route: append it to `protectedRoutes` in `middleware.ts` and use `.withCookieHeaders(cookies())` in its server action.

### Variants (multi-tenant demos, data not branches)

This repo is a **demo showcase**, not one fixed storefront. Each client demo is a `VariantDescriptor` (theme CSS-var overrides + branding + feature flags + template + default language) — **data, not a git branch**. Descriptors live in `app/variants/<id>/index.ts` and are registered in `app/variants/registry.ts`. Current: `bn-01`, `bn-02`, `intl-01`. Onboard a client by adding one descriptor file + one registry line — no fork.

Two run modes, selected by env only:

- **Showcase** (`NEXT_PUBLIC_SHOWCASE=true`): every variant browsable at `/demo/<id>/...`. `middleware.ts` strips the `/demo/<id>` prefix, sets the `x-variant` header, and rewrites to the real `app/(app-routes)` route (which stays prefix-unaware). Gallery at `/demo`.
- **Client deploy** (default): one variant pinned via `ACTIVE_VARIANT=<id>`, served at `/...` with no prefix or switcher.

Config constants (`DEMO_PREFIX`, `VARIANT_HEADER`, `SHOWCASE_MODE`, `PINNED_VARIANT_ID`, `DEFAULT_VARIANT_ID`) are in `app/lib/config/variant.config.ts`.

- **Server:** read the active variant with `getActiveVariant()` (`app/variants/server.ts`, reads `x-variant`).
- **Client:** `useVariant()` / `useFeature(flag)` from `variant-provider.tsx`.
- **Navigation:** in showcase mode internal links must keep the `/demo/<id>` prefix — use `VariantLink` (`app/components/shared/ui/variant-link.tsx`) and `useVariantRouter` (`app/hooks/use-variant-router.ts`) instead of next/link + useRouter; both delegate to `variantHref()` (`app/lib/utils/variant-href.ts`).
- **Branding** merges as: globals/defaults → `variant.branding` → backend API data.
- The variant layer must stay **edge-middleware safe** — `app/variants/*` is plain serializable data and must never import template runtime code (see below) or server-only APIs.

### Template layer (layout paradigms)

`client = template × theme × branding × feature flags × language`. A **template** is a reusable layout *paradigm* (different chrome + page composition), not just a theme. Templates are code under `app/templates/<id>/`; a variant selects one via `VariantDescriptor.template` (`TemplateId = "classic" | "bazar" | "global"`). The union lives in `app/variants/types.ts` so variants reference templates by id only — never by import.

- **Contract:** `app/templates/types.ts` — chrome slots (`Header`, `Navigation`, `Footer`, `MobileNav`, `FloatingActions` — nullable where a paradigm has none) plus `HomeLayout`, `ProductListingLayout`, `ProductDetailsLayout`, `ComboLayout`.
- **Registry:** `getTemplate(id)` in `app/templates/registry.ts`, falls back to `classic`. Never import this from `app/variants/*` or middleware (it pulls in the whole component tree).
- **`classic`** re-exports the pre-existing components verbatim (used by bn-01; see the revert note below). **`bazar`** (used by bn-02) is a distinct paradigm (contact top bar, department-sidebar home, stock ribbon cards, breadcrumb listing, new PDP, mobile bottom nav + floating call FAB). **`global`** (used by intl-01) is a 6Valley-style international marketplace paradigm (utility top bar, category mega-menu, department-rail hero, flash-deal countdown, mobile bottom nav, WhatsApp FAB).
- **`classic` was reverted to its pre-redesign form (2026-09-04, product-owner call).** It re-exports the shared chrome (`HeaderWrapper`, `Navigation`, `FooterWrapper`, `ProductDetails`, `ComboLanding`) and owns only `ClassicHome` / `ClassicProductListing`. Its tokens are the `:root` green "Leaf & Forest" palette in `globals.css`, which is also the fallback other worlds inherit `--font-inter` from. The "Open Shopfront" world it replaced (white field, vermilion, `classic.css`, `Classic*` chrome, the banner carousel) is gone from the tree; recover it from commit `e51a4ab` if it is ever wanted back. Because those shared layout components are live again, `app/components/layout/*` is no longer orphaned.
- **Combo landing (`/combo/[slug]`)** is template-scoped too. All the state (tier choice, gallery, per-unit picks, sold-out rule, cart/buy-now) lives once in `useComboLanding` (`app/components/product/bundle/use-combo-landing.ts`); the four world-specific `ComboLayout`s are presentation only, so a behaviour fix is made once rather than four times. Classic uses the shared `ComboLanding` instead. `useOfferCountdown` returns raw numbers and each world decides how to print them — bazar ticks, global prints one course line, premium and pantry print a date instead because a ticking clock is off-world there. The pantry combo deliberately uses buy-now checkout rather than its on-page COD order form: a bundle needs a server-validated tier quote that `placePantryOrder` cannot carry.
- **Data stays shared:** the shared routes (`app/layout.tsx`, `app/page.tsx`, `products/page.tsx`, `products/[id]/page.tsx`, `combo/[slug]/page.tsx`) fetch data and resolve the template via `getTemplate(variant.template)`, passing serializable props. Page-level template layouts may themselves be async Server Components calling the shared cached actions (as `BazarHome` does). SEO/metadata/actions/models are untouched by templates.
- Shared `ProductsGrid` / `ProductsInfiniteList` accept an optional `CardComponent` prop (defaults to `ProductCardItem`; a component function can only be passed from a client component, not across the server→client boundary). `BackToTopButton` takes an optional `className` so bottom-nav templates can lift it clear.

### State

- **Jotai** for client state (`app/store/*.atom.ts` — mini-profile, wishlist, chat, cookie-consent, ui). Use `atomWithStorage` for cross-navigation persistence.
- **React Context** for the cart (`app/contexts/CartContext.tsx`, reducer + localStorage). Cart math: tax is per-item percent, applied in "include" or "exclude" mode per product (`app/lib/utils/tax-calculator.ts`). BD shipping (classic/bazar templates) is ৳80 inside Dhaka / ৳130 outside (`app/lib/constants/delivery.ts`), waived above the business-settings `free_shipping_on_over` threshold (default ৳1200) applied at checkout. The `global` template (intl variants) uses a flat rate instead: 10 (store currency units), free over 100 (`INTL_SHIPPING` in the same file).
- **Server actions** for data fetching — no client-side React Query (devtools is installed but unused).

### Provider order (do not reorder)

In `app/components/shared/providers/global-provider.tsx`:

```
VariantProvider → JotaiProvider → ThemeProvider → I18nProvider
  → CartProvider → TooltipProvider → (AuthInitializer + WishlistSyncProvider) → Sonner
```

`VariantProvider` must stay outermost — theme/branding/feature flags feed everything below it. Reordering breaks auth init and theming.

### i18n

`react-i18next`. Only **`en` and `bn`** are wired (`app/i18n/index.ts` imports just these two, `app/i18n/locales/{en,bn}.json`). Default and fallback are `bn`. There is no RTL support (no `ar`). `I18nProvider` initializes with the server-resolved language so SSR/CSR markup matches, then applies the saved language after mount. Page metadata is bilingual (Bengali + English). Template-specific strings live under a namespace prefix (e.g. `bazar.*`).

### SEO-critical data

Categories must be server-rendered (used in nav). They are cached via `ApiClient.withCache(["categories"], CACHE_TIMES.VERY_SHORT_TIME)` in `app/components/shared/actions/categories.ts` (Next.js `fetch` cache, not `unstable_cache`) — there is no separate revalidate helper; the tag expires naturally. Every cached read in the app currently uses `VERY_SHORT_TIME` (1s), so admin edits show up almost immediately at the cost of near-zero cache benefit. Don't move categories or product listings to client-only state.

### Reusable product UI

`ProductCardItem`, `ProductsGrid`, `ProductFilters`, `ProductToolbar`, `ProductPagination` (under `app/components/product/` and related). Reuse these on any product-displaying page rather than rebuilding.

### Special navigation

Featured / Today's Deals / Top Selling links smooth-scroll to homepage section IDs (`featured-products`, `today-deals`, `top-selling`) when on `/`, and navigate to `/products?...` filters elsewhere. `NavigationClient` reads the `x-pathname` header (set by middleware) to decide.

## Conventions

- Server Component by default; add `"use client"` only when needed (state, effects, browser APIs).
- Forms: `react-hook-form` + `zod` v4. Server actions return `ApiResponse<T>`.
- Toasts: `sonner`. Theme: `next-themes`. Icons: `lucide-react`.
- Images: always Next `<Image>`; remote patterns are wildcard in `next.config.js`.
- Currency is BDT (৳). Don't hardcode USD anywhere.

## Docker

`docker-compose.dev.yml` (hot reload) and `docker-compose.yml` (prod) are present; they auto-load `.env.local` / `.env.production`. `Dockerfile` is a standard Next standalone build.
