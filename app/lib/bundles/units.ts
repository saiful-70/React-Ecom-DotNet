/**
 * Per-unit variant selection for bundle tiers — pure logic, no React.
 *
 * A tier declares its composition as items with a `qty`. When an item sets
 * `variant_selection: "customer"`, each of those `qty` units becomes an
 * independently configurable "slot": the shopper picks Size/Colour per slot, so
 * a 3-pack can be M/Black + L/Black + XL/Grey.
 *
 * Everything here is deliberately free of React and of the product-route types,
 * so pricing/stock/expansion can be reasoned about (and later unit-tested) in
 * isolation. The option data normally arrives on the wire
 * (`BundleTierItem.variant_options` / `variants`); `axesFromProduct()` is a
 * temporary bridge that derives the same shape from the PDP's anchor product
 * while the backend contract is being implemented.
 */

import type {
  BundleCartComponent,
  BundleTier,
  BundleTierItem,
  BundleVariantOption,
  TierVariant,
} from "./types";

/** One individually-configurable unit of a tier. */
export interface UnitSlot {
  /** Stable React key / state key: `<itemIndex>-<unitIndexWithinItem>`. */
  key: string;
  /** 0-based position across the whole tier; displayed as `index + 1`. */
  index: number;
  item: BundleTierItem;
  itemIndex: number;
}

/** The option axes + variant table backing one tier item's unit rows. */
export interface UnitAxes {
  options: BundleVariantOption[];
  variants: TierVariant[];
}

/** A shopper's choice for one unit. `variantId` is null until resolvable. */
export interface UnitSelection {
  /** Chosen value per axis, keyed by the axis's un-localized `name`. */
  axisValues: Record<string, string>;
  variantId: number | null;
}

/** Minimal structural view of the PDP anchor product, for the fallback bridge. */
export interface ProductAxesSource {
  colors?: { id: number; value: string }[];
  attributes?: { id: number; name: string; values: string[] }[];
  variants?: {
    id: number;
    combination: string[];
    sku?: string;
    price?: number;
    stock: number;
  }[];
}

const eq = (a: string | undefined, b: string | undefined): boolean =>
  (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();

/* ------------------------------------------------------------------ */
/* Tier shape                                                          */
/* ------------------------------------------------------------------ */

/** Items that form the enforced composition (the only rows sent to validate). */
export const requiredItems = (tier: BundleTier): BundleTierItem[] =>
  tier.items.filter((i) => i.role === "required");

/**
 * Number of numbered unit rows. Trusts the backend's `unit_count`; falls back to
 * the summed `qty` of required items. A disagreement between the two is a data
 * bug on the backend side — `unit_count` wins.
 */
export function tierUnitCount(tier: BundleTier): number {
  if (tier.unit_count != null && tier.unit_count > 0) return tier.unit_count;
  const summed = requiredItems(tier).reduce((n, i) => n + (i.qty || 0), 0);
  return summed > 0 ? summed : 1;
}

/** Per-unit price for the "৳X / each" chip. */
export function tierUnitPrice(tier: BundleTier): number {
  if (tier.unit_price != null && tier.unit_price > 0) return tier.unit_price;
  const count = tierUnitCount(tier);
  return count > 1 ? Math.round(tier.price / count) : tier.price;
}

/** Whether any required item lets the shopper choose variants per unit. */
export const tierHasUnitPicker = (tier: BundleTier): boolean =>
  requiredItems(tier).some((i) => i.variant_selection === "customer");

/**
 * Ceiling on individually-configurable units per tier. The per-unit picker is
 * designed for small packs (a 2-5 piece combo); a tier declaring dozens of
 * units — in practice unfinished admin data, e.g. qty 22 — would render an
 * unusable wall of dropdowns. Past this cap the tier degrades to the flat
 * fixed card (composition falls back to each item's default variant).
 */
export const MAX_CONFIGURABLE_UNITS = 8;

/**
 * Effective axes accessor for one tier: the given `axesFor`, unless the tier's
 * configurable unit count exceeds `MAX_CONFIGURABLE_UNITS`, in which case every
 * item reads as fixed. Both the picker UI and the cart-composition builder must
 * use this same accessor so what the shopper sees is exactly what is ordered.
 */
export function tierAxesFor(
  tier: BundleTier,
  axesFor: (item: BundleTierItem) => UnitAxes | null
): (item: BundleTierItem) => UnitAxes | null {
  const configurable = buildUnitSlots(tier).filter((s) =>
    axesFor(s.item)
  ).length;
  return configurable > MAX_CONFIGURABLE_UNITS ? () => null : axesFor;
}

/**
 * Expand required items into one slot per unit, so a `qty: 3` item yields three
 * independently configurable rows. Multi-product combos interleave naturally:
 * item order is preserved, units within an item are consecutive.
 */
export function buildUnitSlots(tier: BundleTier): UnitSlot[] {
  const slots: UnitSlot[] = [];
  requiredItems(tier).forEach((item, itemIndex) => {
    const qty = Math.max(1, item.qty || 1);
    for (let u = 0; u < qty; u++) {
      slots.push({
        key: `${itemIndex}-${u}`,
        index: slots.length,
        item,
        itemIndex,
      });
    }
  });
  return slots;
}

/* ------------------------------------------------------------------ */
/* Axes                                                                */
/* ------------------------------------------------------------------ */

/**
 * Validate that an option/variant payload is actually usable for per-unit
 * selection: every axis must offer at least one value, and at least one
 * variant's `combination` must be index-aligned with the axes (same length) —
 * otherwise no tuple can ever resolve to a `variant_id` and the dropdowns
 * would render empty and unfixable. Misaligned variants are dropped rather
 * than kept as dead entries.
 */
function usableAxes(
  options: BundleVariantOption[],
  variants: TierVariant[]
): UnitAxes | null {
  if (options.length === 0 || variants.length === 0) return null;
  if (options.some((o) => !o.values?.length)) return null;
  const aligned = variants.filter(
    (v) => (v.combination?.length ?? 0) === options.length
  );
  if (aligned.length === 0) return null;
  return { options, variants: aligned };
}

/**
 * Axes for a tier item, or `null` when the unit is not shopper-configurable.
 *
 * Returns null for `"fixed"` items, and also when the backend claims
 * `"customer"` but ships no usable options/variants (empty, valueless axes,
 * or combinations that can't align to the axes) — the UI then degrades to the
 * legacy flat card rather than rendering empty dropdowns.
 */
export function itemAxes(
  item: BundleTierItem,
  fallback?: UnitAxes | null
): UnitAxes | null {
  if (item.variant_selection !== "customer") return null;

  const wire = usableAxes(item.variant_options ?? [], item.variants ?? []);
  if (wire) return wire;

  // Backend hasn't shipped a usable option payload — use the PDP-derived bridge.
  if (fallback) {
    return usableAxes(fallback.options, fallback.variants);
  }
  return null;
}

/**
 * Derive `UnitAxes` from the PDP's anchor product.
 *
 * TEMPORARY: delete once `BundleTierItem.variant_options` / `variants` ship.
 * Axis order mirrors `ProductVariantSelector`'s assumption — colour first (when
 * the product has colours), then attributes in declaration order — because that
 * is the order `ProductVariant.combination` is index-aligned to.
 */
export function axesFromProduct(
  product: ProductAxesSource | null | undefined
): UnitAxes | null {
  if (!product?.variants?.length) return null;

  const options: BundleVariantOption[] = [];
  if (product.colors?.length) {
    options.push({
      id: -1,
      name: "Color",
      // Empty label: the component substitutes a localized "Select {axis}".
      label: "",
      values: product.colors.map((c) => ({
        id: c.id,
        value: c.value,
        label: c.value,
        is_available: true,
      })),
    });
  }
  product.attributes?.forEach((attr) => {
    options.push({
      id: attr.id,
      name: attr.name,
      label: "",
      values: (attr.values ?? []).map((v, i) => ({
        id: i,
        value: v,
        label: v,
        is_available: true,
      })),
    });
  });
  if (options.length === 0) return null;

  const variants: TierVariant[] = product.variants.map((v) => ({
    variant_id: v.id,
    combination: v.combination ?? [],
    sku: v.sku,
    price: v.price,
    stock: v.stock ?? 0,
    is_available: (v.stock ?? 0) > 0,
  }));

  return { options, variants };
}

/* ------------------------------------------------------------------ */
/* Resolution                                                          */
/* ------------------------------------------------------------------ */

export const variantById = (
  axes: UnitAxes,
  variantId: number | null | undefined
): TierVariant | null =>
  variantId == null
    ? null
    : (axes.variants.find((v) => v.variant_id === variantId) ?? null);

/**
 * Resolve a full axis-value tuple to a variant id. Matching is positional:
 * `combination[i]` corresponds to `options[i]`, per the backend contract.
 * Returns null when any axis is unset or no variant matches the tuple.
 */
export function resolveVariantId(
  axes: UnitAxes,
  axisValues: Record<string, string>
): number | null {
  if (axes.options.some((o) => !axisValues[o.name])) return null;
  const match = axes.variants.find((v) =>
    axes.options.every((o, i) => eq(v.combination[i], axisValues[o.name]))
  );
  return match?.variant_id ?? null;
}

/** Axis tuple of a known variant, keyed by axis name. */
export function axisValuesFromVariant(
  axes: UnitAxes,
  variant: TierVariant
): Record<string, string> {
  const values: Record<string, string> = {};
  axes.options.forEach((o, i) => {
    const raw = variant.combination[i];
    // Prefer the canonical casing from the option list over the variant's.
    const canonical = o.values.find((val) => eq(val.value, raw))?.value;
    if (canonical ?? raw) values[o.name] = canonical ?? raw;
  });
  return values;
}

const hasHeadroom = (
  variant: TierVariant | null,
  committed: Map<number, number>
): boolean =>
  !!variant &&
  variant.is_available &&
  variant.stock > (committed.get(variant.variant_id) ?? 0);

/**
 * Starting selection for a unit: the item's `default_variant_id` when it still
 * has stock headroom, else the first variant that does, else the preferred
 * variant regardless (so the dropdowns are never blank and the shopper always
 * has something to adjust).
 *
 * `committed` tracks how many units already claim each variant, so a 3-pack
 * whose default variant has only one left spreads across variants instead of
 * seeding three copies of it and disabling the CTA before the shopper touches
 * anything.
 */
export function defaultSelection(
  axes: UnitAxes,
  item: BundleTierItem,
  committed: Map<number, number> = new Map()
): UnitSelection {
  const declared =
    variantById(axes, item.default_variant_id) ??
    variantById(axes, item.variant_id);

  const chosen =
    (hasHeadroom(declared, committed) ? declared : null) ??
    axes.variants.find((v) => hasHeadroom(v, committed)) ??
    declared ??
    axes.variants.find((v) => v.is_available && v.stock > 0) ??
    axes.variants[0];

  if (!chosen) return { axisValues: {}, variantId: null };
  return {
    axisValues: axisValuesFromVariant(axes, chosen),
    variantId: chosen.variant_id,
  };
}

/**
 * Full selection map for a tier: the shopper's explicit edits, with stock-aware
 * defaults filled in for units they have not touched.
 *
 * Edits are counted against stock first, so generated defaults never squeeze out
 * a choice the shopper actually made.
 */
export function seedSelections(
  slots: UnitSlot[],
  axesFor: (item: BundleTierItem) => UnitAxes | null,
  edits: Record<string, UnitSelection>
): Record<string, UnitSelection> {
  const selections: Record<string, UnitSelection> = {};
  const committed = new Map<number, number>();

  const commit = (variantId: number | null) => {
    if (variantId != null) {
      committed.set(variantId, (committed.get(variantId) ?? 0) + 1);
    }
  };

  for (const slot of slots) {
    if (!axesFor(slot.item)) continue;
    if (edits[slot.key]) commit(edits[slot.key].variantId);
  }

  for (const slot of slots) {
    const axes = axesFor(slot.item);
    if (!axes) continue;
    const edit = edits[slot.key];
    if (edit) {
      selections[slot.key] = edit;
      continue;
    }
    const seeded = defaultSelection(axes, slot.item, committed);
    selections[slot.key] = seeded;
    commit(seeded.variantId);
  }

  return selections;
}

/**
 * Apply one axis change, keeping the other axes where possible.
 *
 * If the resulting tuple has no matching variant, the *other* axes are relaxed
 * to the first combination that honours the axis the shopper just touched —
 * their explicit choice is never silently reverted.
 */
export function applyAxisChange(
  axes: UnitAxes,
  current: UnitSelection,
  optionName: string,
  value: string
): UnitSelection {
  const next = { ...current.axisValues, [optionName]: value };
  const direct = resolveVariantId(axes, next);
  if (direct != null) return { axisValues: next, variantId: direct };

  const changedIndex = axes.options.findIndex((o) => o.name === optionName);
  const relaxed =
    axes.variants.find(
      (v) => eq(v.combination[changedIndex], value) && v.is_available
    ) ?? axes.variants.find((v) => eq(v.combination[changedIndex], value));

  if (!relaxed) return { axisValues: next, variantId: null };
  return {
    axisValues: axisValuesFromVariant(axes, relaxed),
    variantId: relaxed.variant_id,
  };
}

/**
 * Whether an option value is reachable at all — i.e. some available variant
 * carries it on this axis.
 *
 * Deliberately ignores the unit's *other* axis choices. Filtering on those would
 * create dead ends: with Size=XL chosen and Grey stocked only in M, Grey would
 * be disabled and the shopper could never switch colour. Instead every reachable
 * value stays clickable and `applyAxisChange` relaxes the other axes to honour
 * the choice just made. Genuinely unavailable values stay visible but disabled,
 * so the full size run is still legible.
 */
export function isValueSelectable(
  axes: UnitAxes,
  optionName: string,
  value: string
): boolean {
  const axisIndex = axes.options.findIndex((o) => o.name === optionName);
  if (axisIndex < 0) return false;
  return axes.variants.some(
    (v) => v.is_available && eq(v.combination[axisIndex], value)
  );
}

/* ------------------------------------------------------------------ */
/* Validation + payload                                                */
/* ------------------------------------------------------------------ */

export type UnitIssue = "unselected" | "unresolved" | "out_of_stock";

/**
 * Per-unit problems, keyed by slot key. Stock is checked on the *summed* demand
 * for each variant across the tier: picking the same M/Black three times when
 * only two remain is an error even though each individual pick looks fine.
 */
export function unitIssues(
  slots: UnitSlot[],
  axesFor: (item: BundleTierItem) => UnitAxes | null,
  selections: Record<string, UnitSelection>
): Record<string, UnitIssue> {
  const issues: Record<string, UnitIssue> = {};
  const demand = new Map<number, number>();

  for (const slot of slots) {
    const axes = axesFor(slot.item);
    if (!axes) continue;
    const sel = selections[slot.key];
    if (!sel || axes.options.some((o) => !sel.axisValues[o.name])) {
      issues[slot.key] = "unselected";
      continue;
    }
    if (sel.variantId == null) {
      issues[slot.key] = "unresolved";
      continue;
    }
    demand.set(sel.variantId, (demand.get(sel.variantId) ?? 0) + 1);
  }

  for (const slot of slots) {
    if (issues[slot.key]) continue;
    const axes = axesFor(slot.item);
    const sel = selections[slot.key];
    if (!axes || !sel?.variantId) continue;
    const variant = variantById(axes, sel.variantId);
    if (!variant) {
      issues[slot.key] = "unresolved";
      continue;
    }
    if (!variant.is_available || variant.stock < (demand.get(variant.variant_id) ?? 0)) {
      issues[slot.key] = "out_of_stock";
    }
  }

  return issues;
}

/**
 * Build the `bundle_components` payload from the shopper's selections.
 *
 * Configurable units expand to one row per unit, then identical selections are
 * coalesced by (product_id, variant_id) with summed qty — the backend validates
 * on summed quantity per product, not row count, so both forms are accepted.
 * Fixed items pass through with their declared variant and qty.
 */
export function toBundleComponents(
  tier: BundleTier,
  axesFor: (item: BundleTierItem) => UnitAxes | null,
  selections: Record<string, UnitSelection>
): BundleCartComponent[] {
  const rows = new Map<string, BundleCartComponent>();

  const push = (
    product_id: number,
    variant_id: number | null,
    qty: number
  ) => {
    const key = `${product_id}:${variant_id ?? ""}`;
    const existing = rows.get(key);
    if (existing) existing.qty += qty;
    else rows.set(key, { product_id, variant_id, qty });
  };

  const configurable = new Set<BundleTierItem>();
  for (const slot of buildUnitSlots(tier)) {
    if (!axesFor(slot.item)) continue;
    configurable.add(slot.item);
    push(slot.item.product_id, selections[slot.key]?.variantId ?? null, 1);
  }

  for (const item of requiredItems(tier)) {
    if (configurable.has(item)) continue;
    // Fixed rows fall back to the item's default variant so a degraded
    // "customer" item (unusable options / over the unit cap) still resolves
    // to a purchasable variant instead of `null`.
    push(
      item.product_id,
      item.variant_id ?? item.default_variant_id ?? null,
      item.qty
    );
  }

  return [...rows.values()];
}

/** Human-readable summary of a unit's choice, e.g. "Black / M". */
export function selectionLabel(
  axes: UnitAxes,
  selection: UnitSelection | undefined
): string {
  if (!selection) return "";
  return axes.options
    .map((o) => {
      const value = selection.axisValues[o.name];
      return o.values.find((v) => eq(v.value, value))?.label ?? value;
    })
    .filter(Boolean)
    .join(" / ");
}
