"use client";

import { useCallback, useMemo, useState } from "react";
import {
  applyAxisChange,
  axesFromProduct,
  itemAxes,
  seedSelections,
  selectionLabel,
  tierUnitCount,
  tierUnitPrice,
  toBundleComponents,
  unitIssues,
  unitSlotsFor,
  type ProductAxesSource,
  type UnitAxes,
  type UnitSelection,
} from "@/lib/bundles/units";
import type {
  BundleCartComponent,
  BundleTier,
  BundleTierItem,
} from "@/lib/bundles/types";

interface UseBundleUnitsArgs {
  /**
   * Anchor product bridge for deriving option axes while the backend does not
   * ship usable `variant_options` / `variants` on tier items. Unused on the
   * combo page: there the combo API must be self-contained.
   */
  product?: ProductAxesSource | null;
}

/**
 * Per-unit variant selection state for a bundle's tiers.
 *
 * Selections are kept per tier so switching between "2 pcs" and "3 pcs" and back
 * does not lose what the shopper already configured. Defaults are computed
 * lazily on read rather than seeded through an effect, so the first render is
 * already correct (no flash of empty dropdowns).
 */
export function useBundleUnits({ product }: UseBundleUnitsArgs) {
  const [edits, setEdits] = useState<
    Record<number, Record<string, UnitSelection>>
  >({});

  const productAxes = useMemo(() => axesFromProduct(product), [product]);

  const axesFor = useCallback(
    (item: BundleTierItem): UnitAxes | null => itemAxes(item, productAxes),
    [productAxes]
  );

  /**
   * Slots + resolved selections + issues for one tier.
   *
   * Uses `unitSlotsFor`: per-unit rows for small packs, or bulk rows (one per
   * item, the choice applied to all its units) when the tier's configurable
   * unit count exceeds MAX_CONFIGURABLE_UNITS.
   */
  const unitsFor = useCallback(
    (tier: BundleTier) => {
      const slots = unitSlotsFor(tier, axesFor);
      const selections = seedSelections(slots, axesFor, edits[tier.id] ?? {});
      const configurable = slots.filter((s) => axesFor(s.item));
      const issues = unitIssues(slots, axesFor, selections);

      return {
        slots: configurable,
        selections,
        issues,
        hasPicker: configurable.length > 0,
        isReady: Object.keys(issues).length === 0,
        unitCount: tierUnitCount(tier),
        unitPrice: tierUnitPrice(tier),
      };
    },
    [axesFor, edits]
  );

  const setAxisValue = useCallback(
    (
      tier: BundleTier,
      slotKey: string,
      item: BundleTierItem,
      optionName: string,
      value: string
    ) => {
      const axes = axesFor(item);
      if (!axes) return;
      setEdits((prev) => {
        const tierEdits = prev[tier.id] ?? {};
        // Base the change on the *seeded* selection, not a bare default — an
        // untouched unit may hold a stock-spread default, and snapping it back
        // to the item default before applying the change would lose that.
        const seeded = seedSelections(
          unitSlotsFor(tier, axesFor),
          axesFor,
          tierEdits
        );
        const current = seeded[slotKey] ?? { axisValues: {}, variantId: null };
        return {
          ...prev,
          [tier.id]: {
            ...tierEdits,
            [slotKey]: applyAxisChange(axes, current, optionName, value),
          },
        };
      });
    },
    [axesFor]
  );

  /** `bundle_components` for a tier, ready for the cart line / validate call. */
  const componentsFor = useCallback(
    (tier: BundleTier): BundleCartComponent[] =>
      toBundleComponents(tier, axesFor, unitsFor(tier).selections),
    [axesFor, unitsFor]
  );

  /** "Black / M" for the first configured unit — used by the sticky bar chip. */
  const summaryFor = useCallback(
    (tier: BundleTier): string => {
      const { slots, selections } = unitsFor(tier);
      const first = slots[0];
      if (!first) return "";
      const axes = axesFor(first.item);
      return axes ? selectionLabel(axes, selections[first.key]) : "";
    },
    [axesFor, unitsFor]
  );

  return { axesFor, unitsFor, setAxisValue, componentsFor, summaryFor };
}
