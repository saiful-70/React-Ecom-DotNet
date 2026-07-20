# Design: International storefront redesign — `global` template

**Date:** 2026-07-20
**Variant affected:** `intl-01` (International)
**Status:** Approved (design), pending implementation plan

## Problem

The international storefront (`intl-01`) currently renders through the `classic`
template. The stakeholder wants it redesigned to match a 6Valley-style
marketplace layout (provided as reference screenshots): a utility top bar,
department-sidebar hero, flash-deal countdown, category showcases, brand strip,
new-arrivals / best-selling / top-rated blocks, a redesigned product detail
page, and international-ready login/registration with a country-code phone
picker. The redesign must be fully responsive and reuse existing backend APIs
wherever possible.

## Users / personas

- **International shoppers** (English-first) browsing a multi-category catalog.
- **The demo audience** — this repo is a variant showcase; `intl-01` is one
  browsable demo (`/demo/intl-01`) and also a candidate client deployment.

## Outcomes

1. `intl-01` renders a distinct 6Valley-style marketplace paradigm.
2. `classic`, `bazar`, `bn-01`, `bn-02` render byte-identical (zero regression).
3. Login/registration support international phone numbers with a country-code
   picker and per-country validation.
4. Every backend gap is captured in a formal API contract document.
5. Fully responsive (mobile bottom-nav, scrollers, drawers).

## Approach

Add a new template `global` under `app/templates/global/`, following the same
pattern as the existing `bazar` template. Switch `intl-01`'s descriptor from
`template: "classic"` to `template: "global"`. Because templates are code and
variants select one by id (data only), no other variant is touched.

The shared routes (`app/page.tsx`, `products/page.tsx`, `products/[id]/page.tsx`,
`app/layout.tsx`) already resolve the active template via
`getTemplate(variant.template)` and pass serializable props. They require **no
changes** except the auth routes (see "Auth" below), which are not part of the
Template contract.

### Theme

Override `intl-01`'s theme tokens from the current violet system to a 6Valley
blue+orange system, expressed purely as CSS-variable overrides in the descriptor
(`app/variants/intl-01/index.ts`), for both light and dark modes. No hardcoded
colors in components — everything flows through the existing token pipeline.
Approximate primary: royal blue `~221 83% 45%`; accent/CTA: orange for
"Buy now" and discount ribbons. Currency remains USD (`$`) via the existing
`<Price>` component and `intl-01` branding.

## Functional requirements

| # | Requirement | Source | Real / Mock |
|---|---|---|---|
| F1 | Utility top bar: contact phone, currency label (display-only), language switcher | `business-settings`, existing i18n | Real |
| F2 | Header: logo, prominent search, wishlist / account / cart with counts | existing atoms + `HeaderSearch` | Real |
| F3 | Primary navbar: Categories mega-dropdown, Home, Brands, Offers | `categories`, `brands` | Real |
| F4 | Hero: department sidebar + banner carousel | `categories`, `banners` | Real |
| F5 | Flash Deal: countdown timer + horizontal product scroller | `get-today-deal-products` (products) + **timer mock** | Mixed |
| F6 | Featured Products grid | `get-featured-products` | Real |
| F7 | Circular categories strip | `featured-categories` | Real |
| F8 | Featured Deal / promo banner pair | `banners` | Real |
| F9 | Deal of the Day (single highlighted product) | **mock** (highest-discount heuristic) | Mock |
| F10 | Latest products grid | `products?sort=latest` | Real |
| F11 | Brands strip | `brands` | Real |
| F12 | Category showcase rows (Women's, Phone & Gadgets, Health & Beauty, Men's, Kids) | `products?category_id=` per top category | Real |
| F13 | New Arrivals row | `products?sort=latest` | Real |
| F14 | Best Selling / Top Rated two-column split | `top-selling-products` + `products?sort=rating` | Real |
| F15 | Footer: service strip, About/Contact/FAQ/Blog cards, app links, newsletter | static + `subscribe` | Real |
| F16 | Product listing: breadcrumb + filters + `GlobalProductCard` grid | `products`, `categories`, `brands` | Real |
| F17 | Product detail: gallery, color swatches, qty stepper, live total price, buy-now/add-to-cart/wishlist | `product-details`, `CartContext` | Real |
| F18 | Login with country-code phone picker + validation | `auth/login` + bundled country data | Real |
| F19 | Register with country-code phone picker + per-country validation | `auth/register` + bundled country data | Real |
| F20 | Mobile bottom nav, floating actions (chat/WhatsApp + back-to-top) | client state | Real |
| F21 | Multi-vendor nav items (All Vendors, Vendor Zone, Auctions, Publication House) | — | **Hidden in v1** |

### Mock data

Mock sections (F5 timer, F9 deal-of-the-day) are served from
`app/templates/global/_data/mock.ts`, clearly commented as synthetic and
GDPR-safe. Each mock is listed in the API contract doc so the backend can
replace it. No real customer data is used anywhere.

## Component structure

```
app/templates/global/
  index.ts
  chrome/
    GlobalTopBar.tsx
    GlobalHeader.tsx
    GlobalNavbar.tsx
    GlobalFooter.tsx
    GlobalMobileNav.tsx
    GlobalFloatingActions.tsx
  home/
    GlobalHome.tsx                # async Server Component orchestrator
    HeroSection.tsx
    FlashDealSection.tsx          # client (countdown)
    FeaturedProductsSection.tsx
    CategoriesStrip.tsx
    FeaturedDealSection.tsx
    DealOfDayLatest.tsx
    BrandsStrip.tsx
    CategoryShowcaseSection.tsx   # generic, reused per category
    NewArrivalsSection.tsx
    BestSellingTopRated.tsx
    GlobalSectionTitle.tsx        # shared heading + "View All"
  product/
    GlobalProductCard.tsx
    GlobalProductsGrid.tsx
    GlobalProductListing.tsx
    GlobalProductDetails.tsx
  _data/
    mock.ts
```

Chrome slots and `GlobalHome` may be async Server Components calling the shared
cached actions (same pattern as `BazarHome`). Interactive pieces (carousel,
countdown, mega-dropdown, mobile nav, quick-view) are small client components.
Reuse shared product UI (`ProductFilters`, `ProductToolbar`,
`ProductPagination`, `BackToTopButton`) rather than rebuilding. `ProductsGrid`
accepts the optional `CardComponent` prop for `GlobalProductCard`.

## Auth

Auth routes are not part of the Template contract. Branch at the route level:

- `app/(app-routes)/(auth)/login/page.tsx` and `register/page.tsx` read
  `getActiveVariant().template`. When it equals `"global"`, render new
  `GlobalLoginPage` / `GlobalRegisterPage`; otherwise the existing pages.
- New reusable **`PhoneCountryInput`** component: searchable country dropdown
  (flag emoji + name + dial code) sourced from a **bundled static dataset**
  `app/lib/data/countries.ts` (ISO alpha-2, name, dial code, flag). No network.
- Phone validated with **`libphonenumber-js`** for the selected country;
  submitted in E.164 form.
- `RegisterUserSchema` extended with optional `country_code` (ISO alpha-2). The
  server action payload is unchanged except the phone is normalized to E.164;
  if the backend rejects unknown fields, `country_code` is stripped before send
  (confirm during implementation).

**Audit / compliance note:** auth is an authentication surface. Changing the
registration payload or phone normalization can affect account identity and
downstream order/contact records. The change must preserve the existing
`auth/register` and `auth/login` request contracts (only phone formatting
changes); flag to backend before shipping.

## Data model changes

None in this repo (frontend only). The bundled `countries.ts` is static
reference data, not a persisted model.

## API contract deliverable

`docs/superpowers/specs/2026-07-20-global-storefront-api-contract.md` documents
each backend gap with endpoint, method, request params, response shape, and the
consuming section:

- `GET /flash-deal` → `{ ends_at, products[] }` (drives F5 timer).
- `GET /deal-of-the-day` → single product + discount (drives F9).
- `GET /currencies` (+ rates) → multi-currency switcher (deferred; top bar
  currency is display-only in v1).
- Deferred multi-vendor set (for later nav activation): `GET /vendors`,
  `GET /vendors/{id}`, vendor-zone summary, `GET /auctions`,
  `GET /publications`.

## i18n

New strings under a `global.*` namespace in `app/i18n/locales/en.json` and
`bn.json`. English-first (intl-01 default language is `en`); Bengali provided
for parity. No new locales, no RTL.

## Responsive strategy

Mobile-first. Bottom `GlobalMobileNav` (Home, Categories, Cart, Wishlist,
Account); header search collapses to an icon/drawer; department sidebar becomes
a drawer on mobile; product rows are horizontal scrollers; grids are 2-col on
phones, scaling up. Matches the provided mobile screenshot.

## Out of scope (v1)

- Functional multi-vendor pages, vendor zone, real auctions, publication house
  (nav items hidden; documented in contract for later).
- Real multi-currency conversion (top-bar currency is display-only).
- Backend changes (captured in the contract doc, not implemented here).

## Testing / verification

No test runner is configured. Verify with:

1. `npm run type-check`
2. `npm run lint`
3. Manual: run with `NEXT_PUBLIC_SHOWCASE=true`, drive `/demo/intl-01`,
   `/demo/intl-01/products`, a product detail page, and login/register; confirm
   other variants (`/demo/bn-01`, `/demo/bn-02`) are unchanged.

## Open questions

None outstanding. Multi-vendor nav resolved: hidden in v1.
