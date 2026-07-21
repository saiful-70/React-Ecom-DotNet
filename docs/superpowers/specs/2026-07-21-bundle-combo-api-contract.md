# API Contract — Bundle & Combo Offers (Bengali storefront)

**Date:** 2026-07-21
**Consumer:** `bn-01` (classic template) — PDP quantity bundle + `/combo/[slug]` landing
**Base URL:** `API_BASE_URL_V1` (same as existing endpoints)
**Status:** Proposal — backend not yet implemented

## Problem

The Bengali storefront needs volume-incentive offers to lift average order value:

- **Quantity bundle** — the *same* product at 1/2/3-unit tiers with progressive savings,
  shown on the product detail page.
- **Combo** — *different* products sold as a set (e.g. Spice Rack + Apron), shown on its own
  landing page.

Today the backend returns nothing for bundles. The frontend UI is built and shipped against a
mock module (`app/lib/bundles/mock.ts`) exposed through stable server actions
(`getProductBundle(id)`, `getCombo(slug)` in `app/(app-routes)/products/action.ts` and
`app/(app-routes)/combo/action.ts`). Replacing the mock with the endpoints below leaves the
component tree untouched.

## Users / personas

- **Shopper** (quality-of-life): sees clear tiered pricing and picks the best-value option.
- **Merchandiser** (back office): configures bundles/tiers/perks and pricing per product/combo.

## Outcomes

- One entity — a **Bundle with tiers** — powers both surfaces; the client never computes tier
  pricing, it renders exactly what the backend sends (server-authoritative pricing).
- Zero change to the existing product/checkout envelopes beyond the additive fields below.

## Conventions

All responses follow the existing envelope: `{ success: boolean, message: string, data: ... }`.
Dates are ISO 8601 (e.g. `2026-07-21`). Prices are numbers in the store's currency (BDT for
`bn-01`). No real customer data in examples (GDPR — synthetic values only).

---

## 1. Data model (shared by both surfaces)

```ts
type BundleType = "quantity" | "combo";

interface Bundle {
  id: number;
  type: BundleType;
  slug: string;               // combo landing route: /combo/<slug>
  product_id: number | null;  // parent product for quantity bundles; null for combos
  title: string;              // localized
  subtitle?: string;          // localized
  badge?: string;             // e.g. "BUNDLE OFFER" | "COMBO OFFER"
  images: string[];           // absolute URLs; combo hero uses these
  is_active: boolean;
  starts_at?: string | null;  // ISO 8601 activation window (inclusive)
  ends_at?: string | null;
  tiers: BundleTier[];
}

interface BundleTier {
  id: number;
  label: string;              // localized, e.g. "২টি কিনুন" / "2 সেট কম্বো"
  badge?: string | null;      // "MOST POPULAR" | "BEST VALUE" | null
  price: number;              // server-authoritative total charged for the tier
  compare_at_price: number;   // struck-through reference (shown when > price)
  savings: number;            // promoted "you save" amount; 0 => no ribbon shown
  is_default?: boolean;       // pre-selected tier (usually MOST POPULAR)
  perks: BundlePerk[];
  items: BundleTierItem[];    // explicit composition of THIS tier
}

interface BundleTierItem {
  product_id: number;
  variant_id?: number;        // 0/absent when the product has no variant
  name: string;               // localized display snapshot
  image: string;
  quantity: number;           // e.g. 2x rack, 1x apron
  unit_price: number;         // display only; charged amount is tier.price
}

interface BundlePerk {
  type: "free_delivery" | "free_gift" | "custom";
  label: string;              // localized
  gift_product_id?: number;   // required when type === "free_gift"
}
```

**Pricing semantics (must match the UI):**

- `compare_at_price` is the struck-through number; render only when `> price`.
- `savings` drives the corner "SAVE ৳X" ribbon and the "you save" footer; set it to **0 on the
  base tier** so no ribbon shows even though `compare_at_price > price`.
- The client never multiplies — every tier declares its own `items`, `price`, and `savings`.

**Ordering & localization:**

- `tiers` and each tier's `items` are returned in **display order** (the array order is honoured
  as-is; there is no separate sort field on the wire).
- Localized strings are resolved the **same way as existing endpoints** (request locale — the
  storefront serves `bn`/`en`, default `bn`). No locale suffix in field names.

---

## 2. Read endpoints (needed now)

### 2.1 Quantity bundle on the PDP

**Recommended:** extend the existing product detail response with a nullable `bundle`, so the PDP
needs **no extra round-trip**.

`GET /product-details?id={id}` → add to `data`:

```jsonc
{
  "success": true,
  "message": "OK",
  "data": {
    /* ...existing product fields... */
    "bundle": {
      "id": 9001,
      "type": "quantity",
      "slug": "spice-rack-quantity",
      "product_id": 1,
      "title": "১৮ জার স্পাইস র‍্যাক",
      "subtitle": "বেশি কিনুন, বেশি সেভ করুন!",
      "badge": "BUNDLE OFFER",
      "images": ["https://cdn.example.com/rack.jpg"],
      "is_active": true,
      "starts_at": null,
      "ends_at": null,
      "tiers": [
        { "id": 90011, "label": "১টি কিনুন", "badge": null, "price": 499,
          "compare_at_price": 699, "savings": 0, "perks": [],
          "items": [{ "product_id": 1, "name": "18 Jar Rotating Spice Rack",
                      "image": "https://cdn.example.com/rack.jpg", "quantity": 1, "unit_price": 499 }] },
        { "id": 90012, "label": "২টি কিনুন", "badge": "MOST POPULAR", "price": 899,
          "compare_at_price": 998, "savings": 99, "is_default": true, "perks": [],
          "items": [{ "product_id": 1, "name": "18 Jar Rotating Spice Rack",
                      "image": "https://cdn.example.com/rack.jpg", "quantity": 2, "unit_price": 499 }] },
        { "id": 90013, "label": "৩টি কিনুন", "badge": "BEST VALUE", "price": 1199,
          "compare_at_price": 1498, "savings": 299,
          "perks": [{ "type": "free_delivery", "label": "ফ্রি ডেলিভারি" },
                    { "type": "free_gift", "label": "এক্সট্রা গিফট", "gift_product_id": 9999 }],
          "items": [{ "product_id": 1, "name": "18 Jar Rotating Spice Rack",
                      "image": "https://cdn.example.com/rack.jpg", "quantity": 3, "unit_price": 499 }] }
      ]
    }
  }
}
```

`bundle` is `null` when the product has no active bundle. **Alternative** (if the product payload
must stay lean): a dedicated `GET /product-bundle?product_id={id}` returning `{ success, data: Bundle | null }`.

### 2.2 Combo landing

| Purpose | Endpoint | Response `data` |
|---|---|---|
| Single combo by slug | `GET /combos/{slug}` | `Bundle` (`type: "combo"`) or 404 |
| Active combos list (future index / homepage ribbon) | `GET /combos` | `Bundle[]` |

A combo's tiers each declare their full composition — note the apron stays `1×` while the rack
scales, so tiers are **not** a uniform multiple of the base.

### 2.3 API_ROUTES additions (frontend)

```ts
BUNDLES: {
  COMBOS: "combos",
  COMBO_DETAILS: (slug: string) => `combos/${slug}`,
  // If not inlined on product-details:
  PRODUCT_BUNDLE: (productId: number) => `product-bundle?product_id=${productId}`,
}
```

---

## 3. Order / write path (later iteration — documented, not built now)

Checkout is **out of scope** for the current iteration (bundle lines sit in the client cart only).
When wired, keep the flat `order_items` array and tag bundle lines:

Extend `OrderItem` (`app/(app-routes)/checkout/model.ts`):

```ts
interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  variant_id: number;    // 0 when none
  bundle_id?: number;        // NEW — present on every line of a bundle tier
  bundle_tier_id?: number;   // NEW — groups the tier's component lines
}
```

**Frontend behaviour:** expand the chosen tier's `items[]` into flat `order_items[]`, each tagged
with the same `bundle_id` + `bundle_tier_id`.

**Backend behaviour (authoritative):**
1. Group order items by `bundle_tier_id`.
2. Validate the grouped composition **exactly matches** the tier definition (products + quantities).
3. Charge the server-side `tier.price` for the group; **ignore the client per-line `price`** (prevents
   price tampering — the same guarantee the current `checkout-data` re-pricing gives single products).
4. Apply perks: waive shipping for a `free_delivery` tier; auto-append the `free_gift` line at ৳0.

**Re-pricing:** extend `checkout-data` to accept an optional `bundle_tier_id` per item and return the
validated tier total, so `prepareOrderItems` (`checkout/helpers/checkout-helpers.ts`) stays
server-authoritative for bundles too.

---

## 4. Functional requirements

| # | Requirement | Notes |
|---|---|---|
| FR-1 | Return the active quantity bundle for a product (inline on `product-details` or dedicated endpoint). | `null` when none active. |
| FR-2 | Return a combo by slug and a list of active combos. | 404 for unknown/inactive slug. |
| FR-3 | Each tier carries explicit `items`, `price`, `compare_at_price`, `savings`, `perks`. | UI renders verbatim. |
| FR-4 | Exactly one tier per bundle may be `is_default: true`. | Pre-selected in the UI. |
| FR-5 | Honour the `starts_at`/`ends_at` window; only active bundles are returned. | Server clock. |
| FR-6 | Localize `title`/`subtitle`/`label`/perk `label`/item `name` per request locale. | `bn` primary. |
| FR-7 | (Order path) validate tier composition and charge server-side `tier.price`. | Prevents tampering. |
| FR-8 | (Order path) apply `free_delivery` / `free_gift` perks server-side. | Not client-trusted. |

## 5. Suggested backend tables

- `bundles` — id, type, slug, product_id (nullable), title/subtitle/badge (localized), images (json),
  is_active, starts_at, ends_at.
- `bundle_tiers` — id, bundle_id, label, badge, price, compare_at_price, savings, is_default, sort_order.
- `bundle_tier_items` — id, tier_id, product_id, variant_id (nullable), quantity, unit_price.
- `bundle_perks` — id, tier_id, type, label, gift_product_id (nullable).

## 6. Validation rules

- Active window (`starts_at`/`ends_at`) enforced server-side.
- Stock checked across **every** component item of the selected tier before order acceptance.
- Tier composition integrity: order-time group must match the stored tier definition.
- Price authority: `tier.price` is the single source of truth for the amount charged.

## 7. Out of scope

- Checkout redesign and bKash/Nagad **advance payment** (COD only today) — separate work item.
- Homepage / nav entry points to combos (a "COMBO OFFER" ribbon).
- Per-component tax blending — the current cart line model carries one tax rate per line; decide
  whether a bundle carries a blended rate or the backend itemizes tax at order time.

## 8. Open questions

1. Inline `bundle` on `product-details`, or a dedicated `product-bundle` endpoint? (Recommend inline.)
2. May a product have **multiple** concurrent bundles? (Contract allows a list; the PDP shows one.)
3. Tax treatment for bundle lines (blended vs per-component).
4. Which product(s) get a quantity bundle — backend-driven per product. (The mock anchors the
   demo to `DEMO_BUNDLE_PRODUCT_ID` in `app/lib/bundles/mock.ts`; this vanishes once the API
   returns bundles inline on `product-details`.)
5. **Out-of-stock behaviour for read endpoints:** when a tier's component is out of stock, should
   the tier be omitted, or returned with an `is_available: false` flag so the UI can disable it?
   (The current UI renders every returned tier as selectable; decide before launch.)

---

> **Audit note (org compliance):** the order-path changes touch pricing and order composition. When
> implemented, ensure the server-authoritative pricing and perk application are covered by the order
> audit trail (who configured the bundle, effective window, price charged) for traceability.
