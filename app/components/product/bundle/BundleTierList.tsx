"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Check, Plus } from "lucide-react";
import Price from "@/components/shared/Price";
import { cn } from "@/lib/utils/utils";
import type { Bundle, BundleTier, BundleTierItem } from "@/lib/bundles/types";

interface BundleTierListProps {
  bundle: Bundle;
  selectedTierId: number;
  onSelect: (tierId: number) => void;
  /** Show the per-product composition lines (combo) instead of a single label. */
  showComposition?: boolean;
}

/** Overlapping thumbnails: `min(qty, 3)` per item, a "+" between items. */
function ThumbCluster({ items }: { items: BundleTierItem[] }) {
  return (
    <div className="flex items-center shrink-0">
      {items.map((item, itemIdx) => (
        <div key={`${item.product_id}-${itemIdx}`} className="flex items-center">
          {itemIdx > 0 && (
            <Plus className="size-3.5 mx-0.5 text-muted-foreground shrink-0" />
          )}
          <div className="flex -space-x-3">
            {Array.from({ length: Math.min(item.qty, 3) }).map((_, i) => (
              <div
                key={i}
                className="relative size-11 sm:size-12 rounded-md border-2 border-background bg-muted overflow-hidden shadow-sm"
                style={{ zIndex: 3 - i }}
              >
                <Image
                  src={item.thumbnail_image}
                  alt={item.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BundleTierList({
  bundle,
  selectedTierId,
  onSelect,
  showComposition = false,
}: BundleTierListProps) {
  const { t } = useTranslation();

  // No per-tier badge on the wire — derive from real signals: the default tier
  // is "popular"; the highest-savings tier is "best value".
  const bestValueTierId = useMemo(() => {
    let best: BundleTier | null = null;
    for (const tr of bundle.tiers) {
      if (tr.savings > 0 && (!best || tr.savings > best.savings)) best = tr;
    }
    return best?.id ?? null;
  }, [bundle.tiers]);

  return (
    <div className="space-y-2.5">
      {bundle.tiers.map((tier) => {
        const selected = tier.id === selectedTierId;
        const disabled = tier.is_available === false;
        const isBestValue = tier.id === bestValueTierId;
        const isPopular = !!tier.is_default;
        const badgeText = isPopular
          ? t("bundle.popular")
          : isBestValue
            ? t("bundle.bestValue")
            : null;
        const hasSavings = tier.savings > 0;

        return (
          <button
            key={tier.id}
            type="button"
            onClick={() => !disabled && onSelect(tier.id)}
            aria-pressed={selected}
            disabled={disabled}
            className={cn(
              "relative w-full text-left rounded-xl border p-3 sm:p-3.5 transition-all",
              "flex items-center gap-3",
              disabled && "opacity-50 cursor-not-allowed",
              selected
                ? "border-primary ring-1 ring-primary bg-primary/5"
                : "border-border hover:border-primary/60"
            )}
          >
            {/* Derived badge (Popular / Best Value) */}
            {badgeText && (
              <span
                className={cn(
                  "absolute -top-2 left-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm",
                  isBestValue && !isPopular ? "bg-orange-500" : "bg-primary"
                )}
              >
                {badgeText}
              </span>
            )}

            {/* Radio */}
            <span
              className={cn(
                "grid place-items-center size-5 rounded-full border-2 shrink-0",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/40"
              )}
            >
              {selected && <Check className="size-3" strokeWidth={3} />}
            </span>

            {/* Thumbnails */}
            <ThumbCluster items={tier.items} />

            {/* Labels */}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm sm:text-base leading-tight">
                {tier.name}
              </p>
              {showComposition ? (
                <ul className="mt-0.5 space-y-0.5">
                  {tier.items.map((item, i) => (
                    <li
                      key={`${item.product_id}-${i}`}
                      className="text-xs text-muted-foreground leading-tight"
                    >
                      {item.qty}x {item.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {hasSavings
                    ? t("bundle.save", { amount: tier.savings })
                    : t("bundle.standardPrice")}
                </p>
              )}
              {/* Perks (free delivery / gift) */}
              {tier.perks.length > 0 && (
                <p className="text-[11px] font-medium text-primary mt-1 leading-tight">
                  {tier.perks.map((p) => `+ ${p.label}`).join("  ")}
                </p>
              )}
              {/* Unavailable reason */}
              {disabled && tier.unavailable_reason && (
                <p className="text-[11px] font-medium text-destructive mt-1 leading-tight">
                  {tier.unavailable_reason}
                </p>
              )}
            </div>

            {/* Pricing */}
            <div className="text-right shrink-0">
              <div className="text-base sm:text-lg font-bold text-destructive">
                <Price amount={tier.price} />
              </div>
              {tier.compare_at_price > tier.price && (
                <div className="text-xs text-muted-foreground line-through">
                  <Price amount={tier.compare_at_price} />
                </div>
              )}
            </div>

            {/* Savings ribbon */}
            {hasSavings && (
              <span
                className={cn(
                  "absolute top-0 right-0 rounded-bl-lg rounded-tr-xl px-2 py-1 text-[10px] font-bold text-white leading-none",
                  isBestValue && !isPopular ? "bg-orange-500" : "bg-primary"
                )}
              >
                {t("bundle.save", { amount: tier.savings })}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
