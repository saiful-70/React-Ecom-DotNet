# PDP Combo Selector — Per-Unit Variant Selection

**Date:** 2026-08-05
**Status:** Approved, in implementation
**Backend contract:** [`docs/api/bundle-per-unit-variant-contract.md`](../../api/bundle-per-unit-variant-contract.md)

## Problem

The PDP bundle selector (`ProductBundleSelector` → `BundleTierList`) renders a flat radio list of tiers. A 3-pack tier ships one fixed variant for all three units, so the shopper cannot buy `M/Black + L/Black + XL/Grey`. For apparel that removes the main reason to buy a multi-pack.

The current visual treatment also differs from the reference: no per-unit configuration, no "৳X / each" chip, a single "Add bundle to cart" button, and no sticky action bar.

## Users

Bengali-market storefront shoppers on mobile (bn-01, bn-02) and the international marketplace variant (intl-01). Primary surface is a phone in portrait.

## Outcomes

- A shopper selecting a multi-unit tier configures each unit's size and colour independently.
- Per-unit choices survive `validate-bundle` and land on the order as distinct components, so the warehouse picks the right sizes.
- The tier list reads as the reference does: expand-on-select, savings pill, per-unit price chip, outline/solid action pair, sticky bar.

## Scope

| In | Out |
|---|---|
| All three PDP templates (classic, bazar, global) — via the shared `ProductBundleSelector` | Non-bundle PDPs (keep `QuantitySelector` + `ProductActionButtons`, no sticky bar) |
| Per-unit independent variant selection | One shared variant for all units |
| "Add to Cart" + "Order Now" pair inside the bundle block | Redesigning wishlist/share affordances |
| Sticky bottom action bar on bundle PDPs only | Sticky bar on the combo landing page (its purchase panel is already in-flow) |
| Suppressing the top-level `ProductVariantSelector` when a bundle is present | Changing `ProductVariantSelector` itself |
| "৳X / each" unit-price chip | Per-variant price surcharges (assumed absent — see contract §3.2) |
| Hiding the site footer chrome on `/combo/*` | Hiding header / mobile nav / floating actions on `/combo/*` |
| Per-unit selection on the combo landing page (once backend ships options) | — |

## Approach

Option data is sourced from `BundleTierItem.variant_options` / `variants` on the wire (see contract §2.2), with a **runtime fallback** that derives options from the anchor `Product` already fetched by the PDP.

The fallback exists so the frontend is shippable and demoable before the .NET side lands. It only works on the PDP (the combo landing page has no anchor product). It is a temporary bridge, not a permanent second code path, and should be deleted once the backend ships — its risk is silent drift from backend truth, e.g. a variant disabled in admin still appearing selectable.

## Architecture

```
app/lib/bundles/
  types.ts          edit  — new optional wire fields (contract §2)
  units.ts          NEW   — pure helpers, no React:
                            deriveUnitOptions, expandTierToUnits, unitCount,
                            unitPrice, resolveVariantId, toValidateItems,
                            optionsFromProduct (the fallback)
app/components/product/bundle/
  ProductBundleSelector.tsx  rewrite — orchestrator; owns selected tier + unit state
  BundleTierCard.tsx         NEW     — one radio card: thumb cluster, title,
                                       SAVE pill, price column, /each chip
  BundleUnitPicker.tsx       NEW     — numbered rows of axis <Select>s
  use-bundle-units.ts        NEW     — per-unit state, variant resolution, stock guard
  use-bundle-cart.ts         edit    — accept resolved per-unit components
  BundleTierList.tsx         rewrite — single-open accordion over BundleTierCard
  ComboLanding.tsx           edit    — reuse the same card + unit picker
app/components/product/
  StickyProductBar.tsx       NEW     — bundle PDPs only
app/layout.tsx               edit    — hideFooterChrome for /combo/*
app/i18n/locales/{en,bn}.json edit   — new bundle.* keys
app/globals.css              edit    — --bundle-save token
```

`units.ts` holds all pricing, stock and expansion logic as pure functions so it can be reasoned about — and later tested — without React. That is where the bugs will be.

## Data flow

`products/[id]/page.tsx` (server) fetches `product` + `bundle` → template `ProductDetailsLayout` → `ProductBundleSelector({ product, bundle })`.

`ProductBundleSelector` holds:

```ts
selectedTierId: number
units: Record<tierId, UnitSelection[]>   // one entry per unit
UnitSelection = { axisValues: Record<axisName, string>; variantId: number | null }
```

On Add to Cart / Order Now, `toValidateItems()` coalesces identical selections and produces `bundle_components`. Checkout's existing `validate-bundle` call needs no changes.

## Interaction

- Selecting a tier expands its unit picker and collapses the previous one (single-open accordion).
- Units default to `default_variant_id`, else the first in-stock combination.
- Unavailable option values render **disabled, not hidden**, so the full size run stays visible.
- Selecting a variant more times than its `stock` allows across the tier's units is blocked.
- Unresolvable combinations (no matching `TierVariant`) disable the CTA with an inline reason.

## Visual treatment

Built entirely on theme tokens, so each variant renders in its own brand — the default `--primary` is forest green, not the reference's blue. Structure matches the reference; hues do not.

One new token, `--bundle-save`, for the savings pill (coral by default, falling back to `--destructive`), since "savings" is a distinct semantic from "error".

## Error handling

| Condition | Treatment |
|---|---|
| Unit with no resolvable variant | Row marked, CTA disabled, inline reason |
| Chosen variant out of stock | Row marked, CTA disabled |
| Tier `is_available: false` | Card dimmed and unselectable, `unavailable_reason` shown |
| Backend omits `variant_options` | Degrade to `"fixed"`; render today's flat card |
| `validate-bundle` error at checkout | Matched back to the unit row by `variant_id` from the error payload |

## Testing

No test runner is configured in this repo, so verification is `npm run type-check` + `npm run lint` plus a manual pass across the three templates and the combo page. `units.ts` is written pure specifically so Vitest can be added later without restructuring.

## Assumptions

1. Tier pricing is flat — chosen variants never change the price (contract §3.2). If the business needs an XXL surcharge this design changes on both sides.
2. `validate-bundle` will accept repeated `product_id` rows. Until the backend ships item 5 of the contract checklist, per-unit selection will fail at checkout even though the UI works.
3. `x-pathname` for the `/combo/*` footer check behaves the same way `/campaigns` already does; the demo-prefix case is verified during implementation.

## Out of scope / follow-ups

- Vitest coverage for `units.ts`.
- Deleting the `Product`-derived fallback once the backend ships.
- A shared-options payload block if per-tier repetition proves too large.
