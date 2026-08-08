"use client";

import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { BundleTierCard } from "./BundleTierCard";
import type { Bundle, BundleTier } from "@/lib/bundles/types";

interface BundleTierListProps {
  bundle: Bundle;
  selectedTierId: number;
  onSelect: (tierId: number) => void;
  /** Show the per-product composition lines (combo) instead of a single label. */
  showComposition?: boolean;
  /**
   * Per-unit picker for a tier. Rendered inside the selected card only, so the
   * list behaves as a single-open accordion.
   */
  renderUnits?: (tier: BundleTier) => ReactNode;
}

/**
 * The tier radio list. Each tier is a `BundleTierCard`; the selected card
 * expands to reveal its per-unit configuration rows.
 */
export function BundleTierList({
  bundle,
  selectedTierId,
  onSelect,
  showComposition = false,
  renderUnits,
}: BundleTierListProps) {
  const { t } = useTranslation();

  // `BundleTier.badge` is authoritative when the backend sends it. Otherwise
  // derive from real signals: the default tier is "popular", the highest-savings
  // tier is "best value".
  const bestValueTierId = useMemo(() => {
    let best: BundleTier | null = null;
    for (const tier of bundle.tiers) {
      if (tier.savings > 0 && (!best || tier.savings > best.savings)) {
        best = tier;
      }
    }
    return best?.id ?? null;
  }, [bundle.tiers]);

  const badgeFor = (tier: BundleTier): string | null => {
    if (tier.badge) return tier.badge;
    if (tier.is_default) return t("bundle.popular");
    if (tier.id === bestValueTierId) return t("bundle.bestValue");
    return null;
  };

  return (
    <div className="space-y-3.5">
      {bundle.tiers.map((tier) => {
        const selected = tier.id === selectedTierId;
        return (
          <BundleTierCard
            key={tier.id}
            tier={tier}
            selected={selected}
            onSelect={() => onSelect(tier.id)}
            badge={badgeFor(tier)}
            showComposition={showComposition}
          >
            {selected ? renderUnits?.(tier) : null}
          </BundleTierCard>
        );
      })}
    </div>
  );
}
