"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Gift, ShoppingCart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import Price from "@/components/shared/Price";
import { BundleTierList } from "./BundleTierList";
import { useBundleCart } from "./use-bundle-cart";
import type { Bundle } from "@/lib/bundles/types";

interface ProductBundleSelectorProps {
  bundle: Bundle;
}

/**
 * PDP quantity-bundle selector (mockups 4–5). Replaces the standard quantity +
 * add/buy buttons when the product has an active bundle.
 */
export function ProductBundleSelector({ bundle }: ProductBundleSelectorProps) {
  const { t } = useTranslation();
  const { addBundleTier } = useBundleCart();

  const defaultTier = useMemo(
    () => bundle.tiers.find((tr) => tr.is_default) ?? bundle.tiers[0],
    [bundle.tiers]
  );
  const [selectedTierId, setSelectedTierId] = useState<number>(
    defaultTier?.id ?? 0
  );

  const selectedTier =
    bundle.tiers.find((tr) => tr.id === selectedTierId) ?? defaultTier;

  if (!selectedTier) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
          <Gift className="size-4 text-primary" />
          {t("bundle.selectBundle")}
        </h2>
        <span className="text-xs font-medium text-destructive">
          {t("bundle.mostSaved")}
        </span>
      </div>

      <BundleTierList
        bundle={bundle}
        selectedTierId={selectedTierId}
        onSelect={setSelectedTierId}
      />

      {/* Total savings bar */}
      <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5 text-sm">
        <span className="font-medium text-foreground">
          {t("bundle.youSaveTotal")}:
        </span>
        <span className="font-bold text-primary">
          <Price amount={selectedTier.savings} />
        </span>
      </div>

      {/* CTA */}
      <div className="space-y-1.5">
        <Button
          onClick={() => addBundleTier(bundle, selectedTier)}
          className="w-full h-12 text-base font-bold"
        >
          <ShoppingCart className="size-5 mr-2" />
          {t("bundle.addBundleToCart")}
        </Button>
        <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          {t("bundle.secureCheckout")}
        </p>
      </div>
    </section>
  );
}
