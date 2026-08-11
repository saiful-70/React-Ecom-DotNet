/**
 * Server-side sanitation for bundle/combo API payloads, shared by
 * `getProductBundle` (PDP) and `getCombo` (combo landing) so both surfaces
 * apply identical rules:
 *
 *  - numeric money fields are coerced (the .NET serializer can emit decimals
 *    as strings depending on converter config) so `tier.price > 0` checks and
 *    `<Price>` rendering never see `"0.00"`-style strings or `undefined`;
 *  - `items` / `perks` are always arrays, so junk admin data with omitted
 *    collections can't crash the tier card;
 *  - tiers that cannot be sold (price ≤ 0 — unfinished/test data) are dropped,
 *    because rendering a "0.00tk" buy button is worse than hiding the offer.
 */

import type { Bundle, BundleSummary, BundleTier } from "./types";

const toNumber = (value: unknown, fallback = 0): number => {
  const n =
    typeof value === "string" && value.trim() !== ""
      ? Number(value)
      : (value as number);
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
};

const normalizeTier = (tier: BundleTier): BundleTier => ({
  ...tier,
  price: toNumber(tier.price),
  compare_at_price: toNumber(tier.compare_at_price),
  savings: toNumber(tier.savings),
  unit_count: tier.unit_count == null ? tier.unit_count : toNumber(tier.unit_count),
  unit_price: tier.unit_price == null ? tier.unit_price : toNumber(tier.unit_price),
  items: tier.items ?? [],
  perks: tier.perks ?? [],
});

/** Coerce wire types and drop unsellable tiers. `tiers` may end up empty. */
export function normalizeBundle(bundle: Bundle): Bundle {
  const tiers = (bundle.tiers ?? [])
    .map(normalizeTier)
    .filter((tier) => tier.price > 0);
  return { ...bundle, tiers };
}

/** Same sellability rule for the paginated combos list (grid / promo rows). */
export function sellableSummaries(rows: BundleSummary[]): BundleSummary[] {
  return rows
    .map((row) => ({
      ...row,
      price: toNumber(row.price),
      compare_at_price: toNumber(row.compare_at_price),
      savings: toNumber(row.savings),
    }))
    .filter((row) => row.price > 0 && row.is_available !== false);
}
