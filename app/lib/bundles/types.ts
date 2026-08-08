/**
 * Bundle / Combo domain types — mirror the delivered backend contract
 * (customer bundle/combo APIs). One entity powers both storefront surfaces:
 *  - the PDP "buy as bundle" selector (`GET /product-bundle`)
 *  - the combo landing page (`GET /combos/{slug}`) + combos list (`GET /combos`)
 *
 * Pricing is server-authoritative: tiers carry `price`/`compare_at_price`/`savings`
 * from the backend, and the final payable amount comes from `POST /checkout/
 * validate-bundle` (never computed or trusted from the client).
 *
 * There is no "type" discriminator on the wire — a bundle whose tiers hold a
 * single product reads as a quantity bundle; multiple products read as a combo.
 * The display style is chosen by the surface, not by a data field.
 */

export interface BundlePerk {
  /** "free_delivery" | "free_gift" | "custom" (open string). */
  type: string;
  label: string;
  /** Present for free_gift perks: the gifted product. */
  product_id?: number | null;
  variant_id?: number | null;
  qty?: number | null;
}

/**
 * One selectable axis of a tier item's per-unit variant picker (a dropdown).
 *
 * `name` and `values[].value` are NEVER localized — they are stable keys, and
 * `value` is matched (case-insensitively) against `TierVariant.combination`.
 * `label` / `values[].label` carry the localized display text.
 */
export interface BundleVariantOption {
  id: number;
  name: string;
  label: string;
  values: {
    id: number;
    value: string;
    label: string;
    is_available: boolean;
  }[];
}

/**
 * Resolves an axis-value tuple to a concrete variant. Mirrors `ProductVariant`
 * on the product-details API so one resolution routine serves both.
 *
 * `combination` is index-aligned with the item's `variant_options`; `price` is
 * informational only (tier pricing is flat — see the bundle API contract).
 */
export interface TierVariant {
  variant_id: number;
  combination: string[];
  sku?: string;
  price?: number;
  stock: number;
  is_available: boolean;
}

/** Whether the shopper picks each unit's variant, or the tier fixes it. */
export type VariantSelectionMode = "fixed" | "customer";

export interface BundleTierItem {
  product_id: number;
  variant_id?: number | null;
  name: string;
  slug?: string | null;
  thumbnail_image: string;
  qty: number;
  /** "required" | "optional". Required rows must be sent to validate. */
  role: string;
  stock?: number;
  is_available: boolean;
  /**
   * "customer" renders one Size/Colour row per unit of `qty`. Absent or
   * "fixed" keeps the legacy flat card, which is why the field is optional.
   */
  variant_selection?: VariantSelectionMode | null;
  /** Variant pre-selected in every unit row. */
  default_variant_id?: number | null;
  /** Dropdown axes, in display order. Required when selection is "customer". */
  variant_options?: BundleVariantOption[] | null;
  /** Axis-tuple → variant_id + stock. Required when selection is "customer". */
  variants?: TierVariant[] | null;
}

export interface BundleTier {
  id: number;
  /** Duplicate of `id` sent by the backend; used as the validate/order key. */
  bundle_tier_id: number;
  name: string;
  sort_order?: number;
  is_default?: boolean;
  price: number;
  compare_at_price: number;
  savings: number;
  is_available: boolean;
  unavailable_reason?: string | null;
  /**
   * Authoritative count of individually-configurable units (the numbered rows).
   * Falls back to the summed `qty` of required items when the backend omits it.
   */
  unit_count?: number | null;
  /** Per-unit price for the "৳X / each" chip. Falls back to price/unit_count. */
  unit_price?: number | null;
  /** Localized per-tier label ("Best Value"). Derived client-side when absent. */
  badge?: string | null;
  items: BundleTierItem[];
  perks: BundlePerk[];
}

export interface BundleTrustBadge {
  /**
   * Icon key mapped to a fixed client icon (e.g. "original" | "delivery" |
   * "cod" | "return"). Unknown keys fall back to a default icon.
   */
  icon: string;
  /** Localized badge text. */
  label: string;
  /** Whether the badge is shown; inactive badges are filtered out. */
  is_active: boolean;
}

export interface Bundle {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  badge?: string | null;
  banner: string;
  /**
   * Optional hero gallery (absolute URLs). Falls back to `[banner]` when the
   * backend omits it, so the landing page degrades to a single image.
   */
  images?: string[] | null;
  /**
   * Optional long-form offer copy (localized) as an **HTML** string, rendered
   * in the "About this offer" block below the hero (sanitized client-side with
   * DOMPurify, styled via Tailwind `prose`). Distinct from the short
   * `description` (used as the hero subtitle). Section is hidden when absent.
   */
  body?: string | null;
  /** Optional localized selling-point bullets shown in the hero. */
  highlights?: string[] | null;
  /**
   * Optional trust/assurance badges shown as a row under the hero. Each badge
   * carries a backend-controlled `label` and `is_active` flag; only active
   * badges render. When the field is absent the client shows built-in defaults.
   */
  trust_badges?: BundleTrustBadge[] | null;
  /** Anchor product for a PDP (quantity) bundle; null for standalone combos. */
  product_id?: number | null;
  is_active: boolean;
  is_default?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  terms?: string | null;
  tiers: BundleTier[];
}

/** Row shape returned by the paginated `GET /combos` list (no tiers/items). */
export interface BundleSummary {
  id: number;
  slug: string;
  title: string;
  badge?: string | null;
  banner: string;
  product_id?: number | null;
  is_default?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  price: number;
  compare_at_price: number;
  savings: number;
  is_available: boolean;
}

/* ------------------------------------------------------------------ */
/* Checkout validate flow (server-authoritative pricing + quote)       */
/* ------------------------------------------------------------------ */

export interface ValidateBundleItem {
  product_id: number;
  variant_id?: number | null;
  qty: number;
}

export interface ValidateBundleRequest {
  bundle_id: number;
  bundle_tier_id: number;
  items: ValidateBundleItem[];
  city_id?: number | null;
  shipping_type?: string;
}

export interface BundlePricing {
  currency: string;
  compare_at_price: number;
  price: number;
  savings: number;
  tax: number;
  shipping: number;
  grand_total: number;
}

export interface ValidatedLineItem {
  product_id: number;
  variant_id?: number | null;
  qty: number;
  allocated_unit_price: number;
  line_total: number;
}

export interface BundleValidationError {
  code: string;
  bundle_tier_id?: number;
  product_id?: number;
  variant_id?: number | null;
  message: string;
}

/** `data` payload of `POST /checkout/validate-bundle`. */
export interface BundleValidationResult {
  bundle_id: number;
  bundle_tier_id: number;
  is_valid: boolean;
  pricing?: BundlePricing;
  items?: ValidatedLineItem[];
  perks_applied?: { type: string; label: string }[];
  server_quote_id?: string;
  expires_at?: string;
  errors?: BundleValidationError[];
}

/** Serializable snapshot of a chosen tier's required lines, kept on the cart line. */
export interface BundleCartComponent {
  product_id: number;
  variant_id?: number | null;
  qty: number;
}

/** Slugs are backend-generated: lowercase alphanumerics and hyphens only. */
export const isValidComboSlug = (slug: string): boolean =>
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
