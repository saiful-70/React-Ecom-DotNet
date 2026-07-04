# Template Layer for Paradigm-Shift Variants + bn-02 "Bazar" Implementation

**Date:** 2026-07-04
**Status:** Approved

## Problem

The variant system (`app/variants/`) expresses a variant as theme tokens + branding +
feature flags + language. That covers palette-level differences, but client versions
can be a full paradigm shift: entirely different chrome, page composition, product
cards, and mobile navigation. Today the chrome (`Header`, `Navigation`, `Footer`) and
every page layout are single shared implementations, so a paradigm-shift variant is
impossible without forking — the exact maintainability trap the variant system was
built to avoid.

Concrete driver: bn-02 must become a real second Bengali storefront in the style of
the "theme-1" reference (ecom.prodevs.com.bd/theme-1): topbar with contact info,
logo + search + cart header, department sidebar + hero home, "STOCK IN" ribbon
product cards with Add to Cart / Buy Now, breadcrumb listing, a different PDP, a
mobile bottom nav (CATEGORY / CALL / HOME / CART / LOGIN), and a floating call
button. bn-02 currently only swaps the palette.

## Decision

Add a **template layer**: a template is a reusable paradigm (layout + chrome + page
composition + interaction patterns). A client variant is then:

```
client = template × theme × branding × feature flags × language
```

Chosen model: **few templates, many clients**. 100 clients ≈ a handful of templates;
onboarding a client is writing one `VariantDescriptor` file, no code. Rejected
alternatives:

- *Route tree per template* — duplicates every `page.tsx`, metadata, and route
  wiring; the fork problem returns at the route level.
- *JSON page-builder sections* — can reorder/toggle sections but cannot express a
  paradigm shift (different chrome/interaction model) without the components
  existing anyway; viable later evolution on top of templates, not a substitute.
- *Per-client bespoke UI* — 100 clients = 100 UI surfaces to maintain.

## Architecture

### Template contract — `app/templates/types.ts`

Typed, page-level slots. Templates are **presentation only**; all data fetching
stays in shared routes/actions.

```ts
type TemplateId = "classic" | "bazar";

interface Template {
  id: TemplateId;
  chrome: {
    Header: ComponentType<{ categories: Category[] }>;
    Navigation: ComponentType | null;   // classic: nav bar; bazar: null
    Footer: ComponentType;
    MobileNav: ComponentType | null;    // bazar: bottom bar
    FloatingActions: ComponentType | null; // bazar: floating call FAB
  };
  HomeLayout: ComponentType<HomeLayoutProps>;          // banners, featuredCategories, features
  ProductListingLayout: ComponentType<ListingProps>;   // products, filter state, pagination
  ProductDetailsLayout: ComponentType<DetailsProps>;   // product, related data
}
```

- `app/templates/classic/index.ts` — re-exports the EXISTING components unchanged
  (zero rewrite, zero regression risk).
- `app/templates/bazar/` — new theme-1 paradigm components.
- `app/templates/registry.ts` — `getTemplate(id)`; static imports of both templates
  (fine at this template count; unused client components are not downloaded unless
  rendered).

### Descriptor change — `app/variants/types.ts`

`VariantDescriptor` gains a required `template: TemplateId`. Existing variants:
`bn-01` and `intl-01` → `"classic"` (must remain pixel-identical); `bn-02` →
`"bazar"` (keeps its existing lime/coral theme tokens and "Leaf Market BD"
placeholder branding).

### Integration points (the only shared-route edits)

`app/layout.tsx`, `app/page.tsx`, `app/(app-routes)/products/page.tsx`, and
`app/(app-routes)/products/[id]/page.tsx` resolve `getTemplate(variant.template)`
and render through the template's slots instead of hardcoded component imports.
Metadata generation, SEO schemas, structured data, server actions, and models are
untouched. Feature-flag gating of homepage sections continues to apply inside any
`HomeLayout`.

## The bazar template

- **Chrome:** topbar (email · phone · welcome text · track order · login), main
  header (logo, large search, wishlist + cart icons, cart total), footer (logo +
  address block, useful links, newsletter subscribe). All content comes from
  `businessSettings` / variant branding — nothing hardcoded. The reference site's
  ProDevs contact details are visual reference only.
- **Home:** department sidebar (categories) + hero banner row → Categories card
  grid → Featured Product grid → promo banner pair → Show More. Sections gated by
  the same feature flags as today.
- **Product card:** "STOCK IN" corner ribbon, title, ৳ price + struck old price +
  "Save ৳X" badge, ADD TO CART / BUY NOW buttons wired to the existing
  `CartContext` and checkout flow.
- **Listing:** breadcrumb (Home > Category) + card grid; existing server data flow
  (search params, filters, pagination) keeps working.
- **PDP:** left gallery with thumbnails; right column: title, SKU, price + save
  badge, quantity stepper, stock count, Add to Cart / Buy Now / wishlist, delivery
  + return info rows, share icons; tabs (Description / Return Policy / Terms /
  Shipping Info). Reuses existing PDP subcomponents where they fit.
- **Mobile:** bottom nav CATEGORY / CALL (tel: from settings) / HOME / CART / LOGIN
  with raised center Home button; floating call FAB; header collapses to logo +
  track/wishlist/search.
- **i18n:** all new labels via `react-i18next` keys — bn + en translated properly;
  es/fr/hi/ar receive the English values.
- **Out-of-scope routes** (cart, checkout, auth, profile, campaigns) keep the
  classic UI, re-skinned by bn-02's theme tokens.

## What stays shared (the 100-client guarantee)

Server actions, `ApiClient`, models, middleware/variant resolution, showcase mode
(`/demo/bn-02` shows the new paradigm), `VariantLink` / `useVariantRouter`,
cart/auth/i18n state. A fix in any of these lands for every client automatically.

**Risk / counterargument:** the maintenance budget is the template count, not the
client count. Every new template adds a full UI surface that must track shared-
contract changes. Adding a template must be a deliberate product decision; per-
client tweaks belong in theme/branding/flags, not new templates.

## Out of scope

- Re-skinning cart/checkout/auth/profile in the bazar paradigm.
- Per-variant component overrides on top of templates (possible later evolution).
- JSON section-composition configuration.
- Any backend/API changes.

## Verification

No test runner is configured. Verification is:

1. `npm run type-check` and `npm run lint` pass.
2. Showcase mode (`NEXT_PUBLIC_SHOWCASE=true`): `/demo/bn-01` and `/demo/intl-01`
   are pixel-identical to today; `/demo/bn-02` shows the bazar paradigm on home,
   listing, and PDP.
3. Manual pass at desktop and mobile widths (bottom nav, floating call, collapsed
   header on mobile).
4. Client-deploy mode (`ACTIVE_VARIANT=bn-02`) serves the bazar UI at `/` with no
   demo prefix.

## Open questions

None — resolved during brainstorming (template model: few-templates-many-clients;
scope: home + listing + PDP + mobile nav; integration: component registry).
