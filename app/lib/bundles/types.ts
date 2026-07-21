/**
 * Bundle / Combo domain types.
 *
 * A "bundle" is a single entity that powers BOTH storefront surfaces:
 *  - `type: "quantity"` — the SAME product at 1/2/3-unit tiers (shown on the PDP).
 *  - `type: "combo"`    — DIFFERENT products sold as a set (its own landing page).
 *
 * Each tier lists its explicit component items (e.g. `1×rack`, or `2×rack + 1×apron`),
 * a server-authoritative total `price`, a `compare_at_price`, and perks. The UI never
 * derives tier pricing by multiplication — it renders exactly what the backend sends.
 *
 * This module is plain serializable data (no server-only APIs), so it is safe to import
 * from server actions, client components, and the mock module alike. It mirrors the
 * backend contract in docs/superpowers/specs/2026-07-21-bundle-combo-api-contract.md.
 */

export type BundleType = "quantity" | "combo";

export type BundlePerkType = "free_delivery" | "free_gift" | "custom";

export interface BundlePerk {
  type: BundlePerkType;
  /** Localized display label, e.g. "ফ্রি ডেলিভারি" / "Free Delivery". */
  label: string;
  /** Present when `type === "free_gift"`: the product handed out for free. */
  gift_product_id?: number;
}

/** One concrete product line inside a tier's composition. */
export interface BundleTierItem {
  product_id: number;
  /** 0/absent when the product has no variant. */
  variant_id?: number;
  /** Display snapshot (backend returns localized name). */
  name: string;
  image: string;
  /** How many of this product the tier contains (e.g. 2× rack, 1× apron). */
  quantity: number;
  /** Per-unit price, for display only — the charged amount is the tier `price`. */
  unit_price: number;
}

export interface BundleTier {
  id: number;
  /** Localized tier label, e.g. "২টি কিনুন" / "2 সেট কম্বো". */
  label: string;
  /** Optional highlight, e.g. "MOST POPULAR" | "BEST VALUE" | null. */
  badge?: string | null;
  /** Server-authoritative total charged for the whole tier. */
  price: number;
  /** Struck-through reference total (sum of component list prices). */
  compare_at_price: number;
  /** `compare_at_price - price`; sent by the backend so the UI never recomputes. */
  savings: number;
  /** Pre-selected tier (typically the "MOST POPULAR" one). */
  is_default?: boolean;
  perks: BundlePerk[];
  items: BundleTierItem[];
}

export interface Bundle {
  id: number;
  type: BundleType;
  /** URL slug for the combo landing route (`/combo/<slug>`). */
  slug: string;
  /** Parent product this bundle attaches to on the PDP (quantity bundles). */
  product_id?: number | null;
  /** Localized display title. */
  title: string;
  /** Localized supporting line, e.g. "বেশি কিনুন, বেশি সেভ করুন!". */
  subtitle?: string;
  /** Ribbon label, e.g. "BUNDLE OFFER" | "COMBO OFFER". */
  badge?: string;
  /** Hero/banner images (combo landing uses these). */
  images: string[];
  is_active: boolean;
  /** ISO 8601 activation window (inclusive). */
  starts_at?: string | null;
  ends_at?: string | null;
  tiers: BundleTier[];
}

/** Serializable snapshot of the component lines a chosen tier adds to the cart. */
export interface BundleCartComponent {
  product_id: number;
  variant_id?: number;
  quantity: number;
}
