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
  items: BundleTierItem[];
  perks: BundlePerk[];
}

export interface Bundle {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  badge?: string | null;
  banner: string;
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
