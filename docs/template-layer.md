# Template Layer — What Is Implemented & Further Discussion

**Status:** Implemented on `feature/template-layer-bazar` (PR #1) · 2026-07-04
**Deep dives:** spec `docs/superpowers/specs/2026-07-04-template-layer-bn02-bazar-design.md`, plan `docs/superpowers/plans/2026-07-04-template-layer-bn02-bazar.md`

## The problem it solves

Client versions are not just theme changes — they can be full paradigm shifts
(different chrome, page composition, interaction patterns). Before this, the
variant system could only express theme tokens + branding + feature flags +
language, so a paradigm shift would have forced a code fork per client.

## The model

A **template** is a reusable layout paradigm. A client deployment is:

```
client = template × theme × branding × feature flags × language
```

100 clients ≈ a handful of templates. Onboarding a client = writing one
`VariantDescriptor` file under `app/variants/<id>/` — no code, no branch.

## What is implemented

### Architecture

| Piece | Where | Notes |
|---|---|---|
| Template contract | `app/templates/types.ts` | Typed slots: chrome (`Header`, `Navigation`, `Footer`, `MobileNav`, `FloatingActions` — nullable where a paradigm has none) + `HomeLayout`, `ProductListingLayout`, `ProductDetailsLayout` |
| Registry | `app/templates/registry.ts` | `getTemplate(id)`, falls back to `classic` |
| Variant hook-in | `app/variants/types.ts` | `template: "classic" \| "bazar"` (required). The union lives in the variant layer so `app/variants/*` never imports template runtime code — **edge-middleware safety** |
| Route integration | `app/layout.tsx`, `app/page.tsx`, `app/(app-routes)/products/page.tsx`, `products/[id]/page.tsx` | The only shared-route edits. Metadata, SEO schemas, server actions, models untouched |

Templates are presentation-only. Page data is fetched by the shared routes and
passed as serializable props; page-level layouts may additionally be async
Server Components calling the shared cached actions (as `BazarHome` does).

### Templates

- **`classic`** — wraps the pre-existing components verbatim. `bn-01` and
  `intl-01` render identically to before (smoke-verified).
- **`bazar`** (used by `bn-02`) — the theme-1-style paradigm: contact top bar,
  logo/search/cart-total header, department sidebar + hero home, category
  grid, featured products with STOCK-IN ribbon cards (Add to Cart / Buy Now),
  promo banners, breadcrumb listing, new PDP (SKU, save badge, quantity/stock,
  delivery rows, share, tabs, related products), mobile bottom nav
  (CATEGORY / CALL / raised HOME / CART / LOGIN) and a floating call FAB
  (bottom-left, to avoid colliding with the chat widget and back-to-top on
  the right). All content comes from business settings + `bazar.*` i18n keys
  (Bengali translated; English fallback).

### Shared infrastructure gained

- `ProductsGrid` / `ProductsInfiniteList`: optional `CardComponent` prop
  (defaults to `ProductCardItem`; pass only from client components — component
  functions cannot cross the server→client boundary).
- `BackToTopButton`: optional `className` so templates with a bottom nav can
  lift it clear (classic behavior unchanged when the prop is absent).

### What is NOT re-skinned (deliberate)

Cart, checkout, auth, profile, campaigns keep the classic UI, re-themed by the
variant's CSS tokens. They look coherent on bn-02 because the palette matches.

## How to add things

- **New client, existing paradigm:** add `app/variants/<id>/index.ts`
  (template + theme tokens + branding + flags + language), register it in
  `app/variants/registry.ts`. Done.
- **New paradigm:** add `app/templates/<id>/` implementing the `Template`
  contract, register in `app/templates/registry.ts`, extend the `TemplateId`
  union in `app/variants/types.ts`. **This is the expensive path — see below.**

## Verification performed

No test runner exists in this repo. Bar: `type-check`, `lint`, `next build`
(all clean) + dev-server smoke tests in showcase mode (`/demo/bn-02` serves
the bazar paradigm with prefixed links; `/demo/bn-01` unchanged) + a final
whole-branch code review ("ready to merge"). Caveat: the backend returned no
products in the dev environment, so product-card and PDP flows are statically
verified only — do a visual pass against a data-filled backend.

## Further discussion

### Risks / trade-offs accepted

- **The maintenance budget is the template count, not the client count.**
  Every template is a full UI surface that must track contract changes.
  Adding one should be a deliberate product decision; per-client tweaks belong
  in theme/branding/flags. Rough rule: if a request can be expressed as
  tokens + flags, it is not a new template.
- **Contained duplication over shared abstraction.** `BazarProductCard` and
  `BazarProductDetails` duplicate cart/wishlist handler logic from the classic
  components instead of refactoring them (protects classic variants from
  regressions). If a third template repeats this, extract shared hooks
  (e.g. `useProductPurchase`, `useWishlistToggle`) then — not before.
- **Both templates ship in the build.** Fine at 2–5 templates; unused client
  components aren't downloaded unless rendered. Revisit with per-template
  dynamic imports only if build size becomes a real problem.

### Open questions (decide when they become real)

1. **Per-client component overrides on top of templates** (hybrid model): a
   variant overriding just one slot (e.g. only the product card). Adds
   resolution complexity — deferred until a client actually needs it.
2. **Section-composition config** (JSON page-builder on top of a template):
   good for reorder/toggle within a paradigm; not a substitute for templates.
3. **Extending the contract:** cart/checkout/auth slots if a client demands a
   paradigm-shifted checkout. Each new slot must be added to every template —
   keep the contract as small as possible for as long as possible.
4. **Client environments:** each client deploy is `ACTIVE_VARIANT=<id>` +
   their own `API_BASE_URL*`. Per-client backend differences (feature
   availability, payment providers) are currently expressible only via feature
   flags — a future `capabilities` block on the descriptor may be needed.

### Known follow-ups (minor, from review)

- Centralize the Unsplash `FALLBACK_IMAGE` URL (now in 3 files).
- Use `ABSOLUTE_ROUTES.HOME` consistently in bazar chrome (raw `"/"` in a few places).
- `app/templates/types.ts` uses 2-space indent vs repo tabs.
- CLAUDE.md still claims six locales; only `en`/`bn` exist and are loaded by `app/i18n/index.ts`.
- Shared `meta ?? {…}` fallback object duplicated in both listing layouts.
