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

Required env in `.env.local`: `API_BASE_URL`, `API_BASE_URL_V1`, `NEXT_PUBLIC_SITE_URL`. See `.env.example`.

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

### Auth flow

1. JWT in cookie `__token__` (see `app/lib/config/auth.config.ts`).
2. `middleware.ts` gates `/profile` and `/admin`; redirects authed users away from `/login`, `/register`. It also injects `x-pathname` on every response so server components know the current path.
3. `AuthInitializer` (in the global provider) hydrates `miniProfileAtom` from the API on mount.
4. To add a protected route: append it to `protectedRoutes` in `middleware.ts` and use `.withCookieHeaders(cookies())` in its server action.

### State

- **Jotai** for client state (`app/store/*.atom.ts` — mini-profile, wishlist, chat, cookie-consent, ui). Use `atomWithStorage` for cross-navigation persistence.
- **React Context** for the cart (`app/contexts/CartContext.tsx`, reducer + localStorage). Cart math: 10% tax, ৳100 shipping (free over ৳1000).
- **Server actions** for data fetching — no client-side React Query (devtools is installed but unused).

### Provider order (do not reorder)

In `app/components/shared/providers/global-provider.tsx`:

```
JotaiProvider → ThemeProvider → I18nProvider → RTLProvider
  → CartProvider → TooltipProvider → AuthInitializer
```

Reordering breaks auth init and theming.

### i18n

`react-i18next`, locales under `app/i18n/locales/*.json` for `en, es, fr, bn, hi, ar`. Default is `bn`. `RTLProvider` flips layout for `ar`. Page metadata is bilingual (Bengali + English).

### SEO-critical data

Categories must be server-rendered (used in nav). They are cached for 1h via `unstable_cache` in `app/components/shared/actions/categories.ts`; revalidate via `revalidateCategories()`. Don't move categories or product listings to client-only state.

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
