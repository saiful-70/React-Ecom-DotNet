"use client";

import { useTranslation } from "react-i18next";
import { Gift, ArrowRight } from "lucide-react";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { CartLineImage } from "@/components/shared/CartLineImage";
import { trackPromotionClick } from "@/lib/analytics/tracking";
import Price from "@/components/shared/Price";
import type { BundleSummary } from "@/lib/bundles/types";

interface ComboPromoProps {
  combos: BundleSummary[];
}

/**
 * Home-page combo offers — compact cards in a responsive grid so multiple
 * combos append one by one instead of each taking a full-width strip. Each
 * card links to its combo landing page.
 */
export function ComboPromo({ combos }: ComboPromoProps) {
  const { t } = useTranslation();

  if (!combos.length) return null;

  return (
    <section className="container mx-auto py-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {combos.map((combo) => (
          <Link
            key={combo.id}
            href={`/combo/${combo.slug}`}
            onClick={() =>
              trackPromotionClick({ promotionId: combo.id, code: combo.slug })
            }
            className="group flex items-center gap-3 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-2.5 transition-colors hover:bg-primary/10"
          >
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              <CartLineImage
                src={combo.banner}
                alt={combo.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                <Gift className="size-3" />
                {t("bundle.comboOffer")}
              </span>
              <h3 className="truncate text-sm font-bold leading-tight">
                {combo.title}
              </h3>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
                <span className="text-sm font-bold text-destructive">
                  <Price amount={combo.price} />
                </span>
                {combo.compare_at_price > combo.price && (
                  <span className="text-[11px] text-muted-foreground line-through">
                    <Price amount={combo.compare_at_price} />
                  </span>
                )}
              </div>
            </div>

            <ArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </section>
  );
}
