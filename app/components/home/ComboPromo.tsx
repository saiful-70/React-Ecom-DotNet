"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Gift, ArrowRight } from "lucide-react";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import Price from "@/components/shared/Price";
import type { BundleSummary } from "@/lib/bundles/types";

interface ComboPromoProps {
  combo: BundleSummary;
}

/**
 * Home-page marketing banner for a combo offer (driven by the `/combos` list
 * summary shape). The whole card links to the combo landing page.
 */
export function ComboPromo({ combo }: ComboPromoProps) {
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <Link
        href={`/combo/${combo.slug}`}
        className="group relative flex flex-col sm:flex-row items-stretch gap-4 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 transition-colors hover:bg-primary/10"
      >
        {combo.badge && (
          <span className="absolute right-3 top-3 z-10 rounded-md bg-warning px-2 py-1 text-[11px] font-bold text-warning-foreground">
            {combo.badge}
          </span>
        )}

        {/* Image */}
        <div className="relative h-40 w-full sm:h-auto sm:w-56 shrink-0 overflow-hidden rounded-xl bg-muted">
          <Image
            src={combo.banner}
            alt={combo.title}
            fill
            sizes="(min-width: 640px) 224px, 100vw"
            className="object-cover"
          />
          {combo.savings > 0 && (
            <span className="absolute left-2 top-2 grid size-14 place-items-center rounded-full bg-destructive text-center text-[11px] font-bold leading-tight text-white">
              {t("bundle.youSave")}
              <br />
              <Price amount={combo.savings} />
            </span>
          )}
        </div>

        {/* Copy */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <Gift className="size-4" />
            {t("bundle.comboOffer")}
          </span>
          <h3 className="mt-1 text-lg sm:text-xl font-bold leading-tight">
            {combo.title}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl font-bold text-destructive">
              <Price amount={combo.price} />
            </span>
            {combo.compare_at_price > combo.price && (
              <span className="text-sm text-muted-foreground line-through">
                <Price amount={combo.compare_at_price} />
              </span>
            )}
          </div>
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            {t("bundle.viewCombo")}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </section>
  );
}
