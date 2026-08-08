"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { CartLineImage } from "@/components/shared/CartLineImage";
import Price from "@/components/shared/Price";
import { cn } from "@/lib/utils/utils";
import { tierUnitCount, tierUnitPrice } from "@/lib/bundles/units";
import type { BundleTier, BundleTierItem } from "@/lib/bundles/types";

interface BundleTierCardProps {
  tier: BundleTier;
  selected: boolean;
  onSelect: () => void;
  /** Derived label shown as a corner ribbon ("Best Value" / "Popular"). */
  badge?: string | null;
  /** List the tier's per-product composition — used by multi-product combos. */
  showComposition?: boolean;
  /** The per-unit picker, rendered inside the card while it is selected. */
  children?: ReactNode;
}

/** Overlapping thumbnails: `min(qty, 3)` per item, a "+" between items. */
function ThumbCluster({ items }: { items: BundleTierItem[] }) {
  return (
    <div className="flex shrink-0 items-center">
      {items.map((item, itemIdx) => (
        <div key={`${item.product_id}-${itemIdx}`} className="flex items-center">
          {itemIdx > 0 && (
            <Plus className="mx-0.5 size-3.5 shrink-0 text-muted-foreground" />
          )}
          <div className="flex -space-x-3">
            {Array.from({ length: Math.min(item.qty, 3) }).map((_, i) => (
              <div
                key={i}
                className="relative size-10 overflow-hidden rounded-md border-2 border-background bg-muted shadow-sm sm:size-11"
                style={{ zIndex: 3 - i }}
              >
                <CartLineImage
                  src={item.thumbnail_image}
                  alt={item.name}
                  fill
                  sizes="44px"
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

/**
 * One selectable tier in the bundle list.
 *
 * The whole card is a radio: the header row is a `<button>` so tapping anywhere
 * selects the tier, while the per-unit picker renders as a sibling **outside**
 * that button — nesting the dropdowns inside a button would break both keyboard
 * interaction and HTML validity.
 */
export function BundleTierCard({
  tier,
  selected,
  onSelect,
  badge,
  showComposition = false,
  children,
}: BundleTierCardProps) {
  const { t } = useTranslation();
  const disabled = tier.is_available === false;
  const hasSavings = tier.savings > 0;
  const unitCount = tierUnitCount(tier);
  const unitPrice = tierUnitPrice(tier);

  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 transition-all",
        disabled && "opacity-50",
        selected
          ? "border-primary bg-primary/[0.07] shadow-warm-sm"
          : "border-border bg-card hover:border-primary/50"
      )}
    >
      {badge && (
        <span className="absolute -top-2.5 left-4 z-10 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
          {badge}
        </span>
      )}

      <button
        type="button"
        onClick={() => !disabled && onSelect()}
        aria-pressed={selected}
        disabled={disabled}
        className={cn(
          "flex w-full items-center gap-2.5 p-3 text-left sm:gap-3 sm:p-3.5",
          disabled && "cursor-not-allowed"
        )}
      >
        {/* Radio */}
        <span
          className={cn(
            "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
            selected ? "border-primary" : "border-muted-foreground/40"
          )}
        >
          {selected && <span className="size-2.5 rounded-full bg-primary" />}
        </span>

        <ThumbCluster items={tier.items} />

        {/* Title + savings pill */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug sm:text-base">
            {tier.name}
          </p>

          {hasSavings && (
            <span className="mt-1 inline-block rounded-md bg-bundle-save px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-bundle-save-foreground">
              {t("bundle.saveShort")} <Price amount={tier.savings} />
            </span>
          )}

          {showComposition && (
            <ul className="mt-1 space-y-0.5">
              {tier.items.map((item, i) => (
                <li
                  key={`${item.product_id}-${i}`}
                  className="text-xs leading-tight text-muted-foreground"
                >
                  {item.qty}× {item.name}
                </li>
              ))}
            </ul>
          )}

          {tier.perks.length > 0 && (
            <p className="mt-1 text-[11px] font-medium leading-tight text-primary">
              {tier.perks.map((p) => `+ ${p.label}`).join("  ")}
            </p>
          )}

          {disabled && tier.unavailable_reason && (
            <p className="mt-1 text-[11px] font-medium leading-tight text-destructive">
              {tier.unavailable_reason}
            </p>
          )}
        </div>

        {/* Price column */}
        <div className="shrink-0 text-right">
          {tier.compare_at_price > tier.price && (
            <div className="text-xs leading-tight text-muted-foreground line-through">
              <Price amount={tier.compare_at_price} />
            </div>
          )}
          <div className="text-base font-bold leading-tight text-primary sm:text-lg">
            <Price amount={tier.price} />
          </div>
          {unitCount > 1 && (
            <div className="mt-1 inline-block rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Price amount={unitPrice} /> {t("bundle.perEach")}
            </div>
          )}
        </div>
      </button>

      {/* Per-unit picker — sibling of the radio button, never nested inside it */}
      {selected && children && (
        <div className="px-3 pb-3.5 pt-0 sm:px-3.5">
          <div className="border-t border-primary/20 pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}
