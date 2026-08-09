"use client";

import { useTranslation } from "react-i18next";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { CartLineImage } from "@/components/shared/CartLineImage";
import Price from "@/components/shared/Price";
import { useVariant } from "@/components/shared/providers/variant-provider";
import { cn } from "@/lib/utils/utils";

interface StickyProductBarProps {
  name: string;
  image: string;
  price: number;
  /** Compact summary of the current choice, e.g. "৩ পিস · Black / M". */
  summary?: string;
  onAddToCart: () => void;
  onOrderNow: () => void;
  disabled?: boolean;
  /** Slide out of view while the in-flow action buttons are on screen. */
  visible?: boolean;
}

/** Templates whose chrome already occupies the bottom edge with a mobile nav. */
const TEMPLATES_WITH_BOTTOM_NAV = new Set(["bazar", "global"]);

/**
 * Persistent bottom purchase bar for bundle PDPs — keeps the price and the
 * primary CTA reachable while the shopper reads the description.
 *
 * Sits above the mobile bottom nav on templates that have one, so the two never
 * overlap. Hidden while the in-flow buttons are visible to avoid two competing
 * CTAs on the same screen.
 */
export function StickyProductBar({
  name,
  image,
  price,
  summary,
  onAddToCart,
  onOrderNow,
  disabled = false,
  visible = true,
}: StickyProductBarProps) {
  const { t } = useTranslation();
  const { template } = useVariant();
  const hasBottomNav = TEMPLATES_WITH_BOTTOM_NAV.has(template);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur transition-transform duration-300",
        "shadow-[0_-2px_12px_-4px_hsl(var(--shadow-warm)/0.25)]",
        hasBottomNav ? "bottom-16 md:bottom-0" : "bottom-0",
        visible ? "translate-y-0" : "translate-y-full",
        !visible && "pointer-events-none"
      )}
    >
      <div className="container mx-auto flex items-center gap-2.5 py-2.5 sm:gap-3">
        {/* Product identity */}
        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:size-12">
          <CartLineImage
            src={image}
            alt={name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>

        <div className="hidden min-w-0 flex-1 sm:block">
          <p className="truncate text-sm font-semibold leading-tight">{name}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-sm font-bold text-primary">
              <Price amount={price} />
            </span>
            {summary && (
              <span className="truncate rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {summary}
              </span>
            )}
          </div>
        </div>

        {/* On phones the name is dropped so both CTAs stay comfortably tappable */}
        <div className="min-w-0 flex-1 sm:hidden">
          <span className="block text-base font-bold leading-tight text-primary">
            <Price amount={price} />
          </span>
          {summary && (
            <span className="block truncate text-[11px] font-medium text-muted-foreground">
              {summary}
            </span>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onAddToCart}
          disabled={disabled}
          aria-label={t("bundle.addToCart")}
          className="size-11 shrink-0"
        >
          <ShoppingBag className="size-5" />
        </Button>

        <Button
          type="button"
          onClick={onOrderNow}
          disabled={disabled}
          className="h-11 shrink-0 px-4 text-sm font-bold sm:px-6"
        >
          {t("bundle.orderNow")}
          <ArrowRight className="ml-1.5 size-4" />
        </Button>
      </div>
    </div>
  );
}
