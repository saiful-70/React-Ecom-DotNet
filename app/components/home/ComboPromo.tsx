"use client";

import { useTranslation } from "react-i18next";
import { Gift, ArrowRight } from "lucide-react";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { CartLineImage } from "@/components/shared/CartLineImage";
import { SectionHeader } from "./SectionHeader";
import { trackPromotionClick } from "@/lib/analytics/tracking";
import Price from "@/components/shared/Price";
import { SECTION_Y } from "@/lib/ui/rhythm";
import type { BundleSummary } from "@/lib/bundles/types";

interface ComboPromoProps {
  combos: BundleSummary[];
}

/**
 * One compact combo offer card linking to its landing page. Shared by the
 * home-page promo grid below and the PDP's "this product has a combo" slot.
 */
export function ComboOfferCard({ combo }: { combo: BundleSummary }) {
  const { t } = useTranslation();
  // Real arithmetic on the payload — never a made-up "up to X% off".
  const savings = combo.compare_at_price - combo.price;

  return (
    <Link
      href={`/combo/${combo.slug}`}
      onClick={() =>
        trackPromotionClick({ promotionId: combo.id, code: combo.slug })
      }
      className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-primary/25 bg-card p-3 shadow-warm-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-warm-md"
    >
      {/* Savings ribbon — the loudest thing on the card, because the size of
          the discount is the only reason to open a combo page. */}
      {savings > 0 && (
        <span className="absolute right-0 top-0 rounded-bl-xl bg-bundle-save px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-bundle-save-foreground">
          {t("bundle.saveShort")} <Price amount={savings} />
        </span>
      )}

      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
        <CartLineImage
          src={combo.banner}
          alt={combo.title}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-primary">
          <Gift className="size-3" />
          {t("bundle.comboOffer")}
        </span>
        <h3 className="truncate text-sm font-bold leading-tight sm:text-base">
          {combo.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="text-lg font-bold tabular-nums text-destructive sm:text-xl">
            <Price amount={combo.price} />
          </span>
          {savings > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground line-through">
              <Price amount={combo.compare_at_price} />
            </span>
          )}
        </div>
      </div>

      <ArrowRight className="size-4 shrink-0 self-end text-primary transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/**
 * Home-page "Combo Offer" shelf — a titled section like the product shelves
 * (Top Selling / Featured), with compact cards in a responsive grid. Each
 * card links to its combo landing page. `id="combo-offers"` is the smooth-
 * scroll target of the navigation's "Combo" link.
 */
export function ComboPromo({ combos }: ComboPromoProps) {
  if (!combos.length) return null;

  return (
    <section
      id="combo-offers"
      className={`relative overflow-hidden border-y border-primary/15 bg-primary/[0.06] ${SECTION_Y}`}
    >
      {/* The weave marks this band as merchandising, so the combo shelf reads
          as an event between two plain product shelves rather than a third
          identical grid. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-weave-motif opacity-[0.06]"
      />
      <div className="relative container mx-auto">
        <SectionHeader
          titleKey="bundle.comboOffer"
          descriptionKey="bundle.comboOfferDescription"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {combos.map((combo) => (
            <ComboOfferCard key={combo.id} combo={combo} />
          ))}
        </div>
      </div>
    </section>
  );
}
