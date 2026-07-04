import { DEFAULT_VARIANT_ID } from "@/lib/config/variant.config";
import type { Market, VariantDescriptor } from "./types";
import bn01 from "./bn-01";
import intl01 from "./intl-01";

/**
 * The variant registry — the single source of truth for every demo/deployment.
 * Add a new demo by adding a descriptor folder and one line here. No branches.
 *
 * This module is plain, serializable data (no server-only APIs), so it is safe
 * to import from edge middleware, server components, and client components.
 */
const VARIANTS: Record<string, VariantDescriptor> = {
  [bn01.id]: bn01,
  [intl01.id]: intl01,
};

/** All registered variant ids. */
export const variantIds = Object.keys(VARIANTS);

/** All variants (unsorted). */
export function listVariants(market?: Market): VariantDescriptor[] {
  const all = Object.values(VARIANTS);
  return market ? all.filter((v) => v.market === market) : all;
}

/** True if `id` maps to a registered variant. */
export function isValidVariantId(id: string | null | undefined): id is string {
  return !!id && Object.prototype.hasOwnProperty.call(VARIANTS, id);
}

/**
 * Resolve a variant by id, falling back to the configured default (and then to
 * the first registered variant) so callers always get a usable descriptor.
 */
export function getVariant(id: string | null | undefined): VariantDescriptor {
  if (isValidVariantId(id)) return VARIANTS[id];
  if (isValidVariantId(DEFAULT_VARIANT_ID)) return VARIANTS[DEFAULT_VARIANT_ID];
  return Object.values(VARIANTS)[0];
}
