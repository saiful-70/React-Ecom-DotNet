"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { CartLineImage } from "@/components/shared/CartLineImage";
import Price from "@/components/shared/Price";
import { cn } from "@/lib/utils/utils";
import { displayItems, tierUnitCount, tierUnitPrice } from "@/lib/bundles/units";
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

/**
 * Overlapping thumbnails, capped so a long composition can never squeeze the
 * title/price out of the card on narrow screens: a single-item tier shows
 * `min(qty, 3)` copies; a multi-item tier shows one thumb per item (max 3)
 * with a "+N" chip for the overflow.
 */
function ThumbCluster({ items }: { items: BundleTierItem[] }) {
  if (items.length === 0) return null;

  const single = items.length === 1;
  const thumbs = single
    ? Array.from(
        { length: Math.min(Math.max(items[0].qty || 1, 1), 3) },
        () => items[0]
      )
    : items.slice(0, 3);
  const overflow = single ? 0 : items.length - thumbs.length;

  return (
    <div className="flex shrink-0 items-center">
      <div className="flex -space-x-3">
        {thumbs.map((item, i) => (
          <div
            key={`${item.product_id}-${i}`}
            className="relative size-9 overflow-hidden rounded-md border-2 border-background bg-muted shadow-sm sm:size-11"
            style={{ zIndex: thumbs.length - i }}
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
      {overflow > 0 && (
        <span className="ml-1 flex items-center rounded-md bg-muted px-1 py-0.5 text-[10px] font-bold text-muted-foreground">
          <Plus className="size-2.5" />
          {overflow}
        </span>
      )}
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
  // Only the enforced composition, coalesced by product (duplicate rows of
  // the same product read as one "×N" line) — optional add-on rows are not
  // part of what the shopper gets for the tier price.
  const included = displayItems(tier);

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
          "w-full p-3 text-left sm:p-3.5",
          disabled && "cursor-not-allowed"
        )}
      >
        {/* Header row: radio + thumbs + title + price. The composition list
            renders full-width below so long product names wrap across the
            card instead of squeezing this row on narrow screens. */}
        <div className="flex w-full items-center gap-2.5 sm:gap-3">
          {/* Radio */}
          <span
            className={cn(
              "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
              selected ? "border-primary" : "border-muted-foreground/40"
            )}
          >
            {selected && <span className="size-2.5 rounded-full bg-primary" />}
          </span>

          <ThumbCluster items={included} />

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
          </div>

          {/* Price column */}
          <div className="shrink-0 text-right">
            {tier.compare_at_price > tier.price && (
              <div className="whitespace-nowrap text-xs leading-tight text-muted-foreground line-through">
                <Price amount={tier.compare_at_price} />
              </div>
            )}
            <div className="whitespace-nowrap text-base font-bold leading-tight text-primary sm:text-lg">
              <Price amount={tier.price} />
            </div>
            {unitCount > 1 && (
              <div className="mt-1 inline-block whitespace-nowrap rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Price amount={unitPrice} /> {t("bundle.perEach")}
              </div>
            )}
          </div>
        </div>

        {(showComposition ||
          tier.perks.length > 0 ||
          (disabled && tier.unavailable_reason)) && (
          <div className="mt-2 space-y-1 pl-7 sm:pl-8">
            {showComposition && (
              <ul className="space-y-0.5">
                {included.map((item, i) => (
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
              <p className="text-[11px] font-medium leading-tight text-primary">
                {tier.perks.map((p) => `+ ${p.label}`).join("  ")}
              </p>
            )}

            {disabled && tier.unavailable_reason && (
              <p className="text-[11px] font-medium leading-tight text-destructive">
                {tier.unavailable_reason}
              </p>
            )}
          </div>
        )}
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
