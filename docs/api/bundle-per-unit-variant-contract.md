# API Contract Change — Per-Unit Variant Selection on Bundle Tiers

**Date:** 2026-08-05
**Status:** Proposed — awaiting backend implementation
**Affects:** `GET /product-bundle`, `GET /combos/{slug}`, `POST /checkout/validate-bundle`, `POST /orders`, admin bundle editor
**Breaking:** No. Every new response field is optional; every new request behaviour is additive.

---

## 1. Why

Today a bundle tier ships a fixed composition: "3 × Compression Tank Top, variant 9001". The shopper cannot say *which* size and colour each of the three units should be, so a 3-pack is only usable when all three units are identical.

For apparel that kills the offer. A shopper buying a 3-pack wants `M/Black + L/Black + XL/Grey`. We need the storefront to render one Size + Colour row per unit of the selected tier, and we need those choices to survive validation, order placement and the warehouse pick list.

The reference behaviour: the tier radio list stays as-is, but the **selected** tier expands inline to show `unit_count` numbered rows, each with its own Size and Colour dropdown.

---

## 2. Response changes — `GET /product-bundle` and `GET /combos/{slug}`

Both endpoints return the same `Bundle` object, so both need these additions. All fields are **optional**; the storefront has a documented fallback for each so it keeps working against the current response.

### 2.1 New fields on `BundleTier`

| Field | Type | Required | Purpose | Storefront fallback when absent |
|---|---|---|---|---|
| `unit_count` | `int` | No | Authoritative number of individually-configurable units in this tier — the count of numbered rows rendered. | Sum of `qty` across items with `role: "required"` |
| `unit_price` | `decimal` | No | The per-unit price shown as a chip ("৳657 / each"). Supplied by the backend so rounding is consistent with invoices. | `round(price / unit_count)` |
| `badge` | `string \| null` | No | Localized per-tier label, e.g. `"Best Value Combo"`, `"Popular"`. | Derived: `is_default` → "Popular"; highest `savings` → "Best Value" |

`unit_count` and `Σ qty` of required items **must agree**. If they disagree the storefront trusts `unit_count` and logs a warning; please treat a mismatch as a data bug.

### 2.2 New fields on `BundleTierItem`

| Field | Type | Required | Purpose |
|---|---|---|---|
| `variant_selection` | `"fixed"` \| `"customer"` | No — **default `"fixed"`** | `"customer"` → the shopper picks a variant for each of the item's `qty` units. `"fixed"` → current behaviour, no dropdowns. This default is what makes the change non-breaking. |
| `default_variant_id` | `int \| null` | No | Variant pre-selected in every unit row. Falls back to the first in-stock entry in `variants`. |
| `variant_options` | `VariantOption[]` | Required **when** `variant_selection = "customer"` | The dropdown axes, in the order they should render. |
| `variants` | `TierVariant[]` | Required **when** `variant_selection = "customer"` | Maps a chosen axis-value tuple to a concrete `variant_id`, with per-variant stock. |

When `variant_selection = "customer"` but `variant_options` or `variants` is empty or absent, the storefront degrades to `"fixed"` and uses the item's existing `variant_id`. It does not error, but the offer silently loses the feature — so please always send both together.

### 2.3 New object — `VariantOption`

One dropdown.

```jsonc
{
  "id": 12,
  "name": "Size",              // stable, English, NOT localized — used as a state key
  "label": "Select Size",      // localized per ?lang= — this is what the shopper reads
  "values": [
    { "id": 101, "value": "M",   "label": "M (55-70) KG",    "is_available": true  },
    { "id": 102, "value": "L",   "label": "L (71-82) KG",    "is_available": true  },
    { "id": 103, "value": "XXL", "label": "XXL (99-120) KG", "is_available": false }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | `int` | Attribute/option id |
| `name` | `string` | **Never localized.** The storefront uses it as a stable key and to match against `TierVariant.combination`. Changing it between `lang=bn` and `lang=en` breaks variant resolution. |
| `label` | `string` | Localized display label for the dropdown |
| `values[].id` | `int` | Option-value id |
| `values[].value` | `string` | **Never localized.** Must match the corresponding entry in `TierVariant.combination` exactly (case-insensitive comparison is applied client-side). |
| `values[].label` | `string` | Localized display text for the dropdown row |
| `values[].is_available` | `bool` | `false` → rendered but disabled. Values are never hidden, so shoppers can see the full size run. |

### 2.4 New object — `TierVariant`

Deliberately mirrors `ProductVariant` from the existing product-details API so the storefront reuses one resolution routine.

```jsonc
{
  "variant_id": 9001,
  "combination": ["Black", "M"],   // index-aligned to variant_options
  "sku": "CTT-BLK-M",
  "price": 790,                    // informational only — see §3.2
  "stock": 14,
  "is_available": true
}
```

| Field | Type | Notes |
|---|---|---|
| `variant_id` | `int` | Sent back in `validate-bundle` and the order payload |
| `combination` | `string[]` | **Index-aligned with `variant_options`.** `combination[0]` is a value of `variant_options[0]`, and so on. Same length as `variant_options`. |
| `sku` | `string` | Shown in the unit row on wide viewports |
| `price` | `decimal` | Single-unit list price. Informational only — the tier price governs. |
| `stock` | `int` | Per-variant stock. The storefront blocks selecting the same variant more times than `stock` allows across units of one tier. |
| `is_available` | `bool` | `false` → all combinations resolving to this variant are disabled |

> **Critical invariant:** `combination` must be index-aligned with `variant_options`. If the arrays are ordered independently the storefront cannot resolve a `variant_id` and the tier becomes unpurchasable.

### 2.5 Full example response

`GET /product-bundle?product_id=41&lang=bn`

```jsonc
{
  "success": true,
  "data": {
    "id": 7,
    "slug": "compression-tank-top-combo",
    "title": "Compression Tank Top",
    "product_id": 41,
    "is_active": true,
    "banner": "https://cdn.example.com/bundles/7/banner.jpg",
    "tiers": [
      {
        "id": 21, "bundle_tier_id": 21,
        "name": "১ পিস",
        "sort_order": 1, "is_default": true,
        "price": 790, "compare_at_price": 790, "savings": 0,
        "unit_count": 1, "unit_price": 790,
        "badge": null,
        "is_available": true,
        "items": [
          {
            "product_id": 41, "variant_id": null,
            "name": "Compression Tank Top",
            "slug": "compression-tank-top",
            "thumbnail_image": "https://cdn.example.com/p/41/thumb.jpg",
            "qty": 1, "role": "required", "is_available": true,
            "variant_selection": "customer",
            "default_variant_id": 9001,
            "variant_options": [
              { "id": 5, "name": "Color", "label": "Select Color",
                "values": [
                  { "id": 51, "value": "Black", "label": "Black", "is_available": true },
                  { "id": 52, "value": "Grey",  "label": "Grey",  "is_available": true }
                ] },
              { "id": 12, "name": "Size", "label": "Select Size",
                "values": [
                  { "id": 101, "value": "M",   "label": "M (55-70) KG",    "is_available": true },
                  { "id": 102, "value": "L",   "label": "L (71-82) KG",    "is_available": true },
                  { "id": 103, "value": "XL",  "label": "XL (83-98) KG",   "is_available": true },
                  { "id": 104, "value": "XXL", "label": "XXL (99-120) KG", "is_available": false }
                ] }
            ],
            "variants": [
              { "variant_id": 9001, "combination": ["Black", "M"],  "sku": "CTT-BLK-M",  "price": 790, "stock": 14, "is_available": true },
              { "variant_id": 9002, "combination": ["Black", "L"],  "sku": "CTT-BLK-L",  "price": 790, "stock": 9,  "is_available": true },
              { "variant_id": 9003, "combination": ["Black", "XL"], "sku": "CTT-BLK-XL", "price": 790, "stock": 0,  "is_available": false },
              { "variant_id": 9010, "combination": ["Grey",  "M"],  "sku": "CTT-GRY-M",  "price": 790, "stock": 4,  "is_available": true }
            ]
          }
        ],
        "perks": []
      },
      {
        "id": 22, "bundle_tier_id": 22,
        "name": "২ পিস Combo",
        "sort_order": 2, "is_default": false,
        "price": 1380, "compare_at_price": 1580, "savings": 200,
        "unit_count": 2, "unit_price": 690,
        "badge": null,
        "is_available": true,
        "items": [ { "product_id": 41, "qty": 2, "role": "required", "variant_selection": "customer", "...": "same option/variant payload as above" } ],
        "perks": []
      },
      {
        "id": 23, "bundle_tier_id": 23,
        "name": "৩ পিস Best Value Combo",
        "sort_order": 3, "is_default": false,
        "price": 1970, "compare_at_price": 2370, "savings": 400,
        "unit_count": 3, "unit_price": 657,
        "badge": "Best Value",
        "is_available": true,
        "items": [ { "product_id": 41, "qty": 3, "role": "required", "variant_selection": "customer", "...": "same option/variant payload as above" } ],
        "perks": [ { "type": "free_delivery", "label": "ফ্রি ডেলিভারি" } ]
      }
    ]
  }
}
```

Repeating the full `variant_options` / `variants` payload on every tier is verbose but intentional — it keeps each tier item self-contained, which the combo landing page needs (it has no anchor product to read options from). If payload size becomes a problem, propose a `$ref`-style shared-options block and we will adopt it; do not silently send options on only the first tier.

---

## 3. `POST /checkout/validate-bundle` — behaviour change, no shape change

The request shape is **unchanged**. `items` is already `[{ product_id, variant_id, qty }]`. What changes is what the storefront sends and what the backend must accept.

### 3.1 The storefront expands qty into one row per unit

A tier item of `{ product_id: 41, qty: 3, variant_selection: "customer" }` is sent as three rows of `qty: 1` carrying the shopper's three distinct choices:

```jsonc
POST /checkout/validate-bundle?lang=bn
{
  "bundle_id": 7,
  "bundle_tier_id": 23,
  "items": [
    { "product_id": 41, "variant_id": 9001, "qty": 1 },
    { "product_id": 41, "variant_id": 9002, "qty": 1 },
    { "product_id": 41, "variant_id": 9010, "qty": 1 }
  ],
  "city_id": 1,
  "shipping_type": "inside_dhaka"
}
```

Three backend requirements:

1. **Do not reject repeated `product_id`s.** Three rows for product 41 is now valid input, not a duplicate-key error.
2. **Validate on summed quantity, not row count.** The invariant is: for each required `product_id` in the tier, `Σ qty` across the submitted rows **equals** the tier item's declared `qty`. Row count is irrelevant — a shopper choosing `M, M, L` may legitimately arrive as `{9001, qty: 2}` + `{9002, qty: 1}` (the storefront coalesces identical selections).
3. **Check stock per submitted `variant_id`**, against the summed quantity for that variant.

When `variant_selection = "fixed"`, nothing changes: one row, `qty` as declared.

### 3.2 Pricing stays flat per tier

`pricing.price` **must** be the tier's price regardless of which variants were chosen. A shopper picking XXL must not be charged more than one picking M.

> **Open decision for the business:** is a per-variant surcharge ever needed (e.g. XXL costs more)? The storefront currently assumes **no**, and treats `TierVariant.price` as informational. If a surcharge is required, tell us — `TierVariant` needs a `variant_surcharge` field and the flat-tier-price assumption has to be revisited on both sides.

`items[]` in the **response** should echo one `ValidatedLineItem` per submitted row, so `allocated_unit_price` distributes the tier total across the chosen variants. The existing allocation rule is unchanged; it just now runs over more rows.

### 3.3 New error codes in `errors[]`

Returned with HTTP 200 and `is_valid: false`, matching current behaviour.

| `code` | Must carry | Meaning | Storefront behaviour |
|---|---|---|---|
| `VARIANT_REQUIRED` | `product_id` | A unit was submitted without a `variant_id` for a `"customer"` item | Highlights unresolved unit rows, disables the CTA |
| `VARIANT_OUT_OF_STOCK` | `product_id`, `variant_id` | Chosen variant lacks stock for the submitted quantity | Marks the matching unit row(s) in error, disables the CTA |
| `UNIT_COUNT_MISMATCH` | `bundle_tier_id` | `Σ qty` ≠ the tier item's declared `qty` | Generic tier-level error; forces re-selection |

`message` must be localized per `?lang=`; the storefront displays it verbatim.

---

## 4. `POST /orders` — persistence

The request shape is **unchanged**. Each bundle cart line already carries:

```jsonc
{
  "bundle_id": 7,
  "bundle_tier_id": 23,
  "server_quote_id": "...",
  "bundle_components": [
    { "product_id": 41, "variant_id": 9001, "qty": 1 },
    { "product_id": 41, "variant_id": 9002, "qty": 1 },
    { "product_id": 41, "variant_id": 9010, "qty": 1 }
  ]
}
```

Requirements:

1. **Persist each component row separately**, keyed by `variant_id`. Do not collapse to `3 × product 41` — the pick list must read `1 × M/Black, 1 × L/Black, 1 × M/Grey` or the warehouse ships the wrong sizes. This is the single highest-risk item in this change.
2. **Decrement stock per variant**, not per product.
3. **Echo components back** on the order-detail endpoint (`items[].bundle_components`) including a resolved variant label (e.g. `"Black / M"`), so customer support and the invoice can show what was ordered without a second lookup.
4. **Re-verify against `server_quote_id`.** The quote already pins the validated composition; the order's components must match it, otherwise reject. This is what stops a tampered client from swapping in a more expensive variant set after validation.

---

## 5. Admin

The bundle-tier-item editor needs:

- A **"Customer chooses variant per unit"** toggle, writing `variant_selection`.
- When enabled, a **default variant** picker writing `default_variant_id`.
- Optional per-tier **badge** text field, writing `BundleTier.badge`.

Without the toggle no tier can opt in and the storefront feature stays dark, so this is required for launch, not a follow-up.

---

## 6. Summary — backend checklist

| # | Item | Endpoint / area |
|---|---|---|
| 1 | Add `unit_count`, `unit_price`, `badge` to `BundleTier` | `product-bundle`, `combos/{slug}` |
| 2 | Add `variant_selection`, `default_variant_id`, `variant_options`, `variants` to `BundleTierItem` | `product-bundle`, `combos/{slug}` |
| 3 | Guarantee `combination` is index-aligned with `variant_options` | both read endpoints |
| 4 | Keep `name` / `value` un-localized across `lang` values | both read endpoints |
| 5 | Accept repeated `product_id` rows; validate on `Σ qty`, not row count | `validate-bundle` |
| 6 | Per-variant stock check on summed quantity | `validate-bundle` |
| 7 | Keep tier pricing flat regardless of chosen variants | `validate-bundle` |
| 8 | Return one `ValidatedLineItem` per submitted row | `validate-bundle` |
| 9 | Add `VARIANT_REQUIRED`, `VARIANT_OUT_OF_STOCK`, `UNIT_COUNT_MISMATCH` | `validate-bundle` |
| 10 | Persist each `bundle_components` row separately, keyed by variant | `orders` |
| 11 | Decrement stock per variant | `orders` |
| 12 | Echo `bundle_components` + variant label on order detail | order detail |
| 13 | Re-verify components against `server_quote_id` | `orders` |
| 14 | "Customer chooses variant per unit" toggle + default variant + tier badge | admin |

Items 5–7 and 10 are launch blockers. Items 1 and 3 have storefront fallbacks and can follow.

---

## 7. Open questions for backend

1. **Per-variant surcharge** — needed, or is flat tier pricing correct? (§3.2)
2. **Payload size** — is repeating `variant_options` / `variants` on every tier acceptable, or should we design a shared-options block?
3. **Multi-product combos** — for a tier containing two *different* products both set to `"customer"`, confirm the same expansion rules apply per product independently.
4. **Stock reservation** — does `server_quote_id` reserve the chosen variants for its `expires_at` window, or is stock only checked again at order time? This changes how aggressively the storefront needs to re-validate.
