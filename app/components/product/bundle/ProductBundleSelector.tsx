"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Gift, ShieldCheck, ShoppingBag } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import Price from "@/components/shared/Price";
import { StickyProductBar } from "@/components/product/StickyProductBar";
import { useVariantRouter } from "@/hooks/use-variant-router";
import { buyNowCheckoutHref } from "@/lib/utils/buy-now";
import { BundleTierList } from "./BundleTierList";
import { BundleUnitPicker } from "./BundleUnitPicker";
import { useBundleCart } from "./use-bundle-cart";
import { useBundleUnits } from "./use-bundle-units";
import type { Bundle, BundleTier } from "@/lib/bundles/types";
import type { Product } from "@/(app-routes)/products/model";

interface ProductBundleSelectorProps {
  bundle: Bundle;
  /**
   * PDP anchor product. Supplies the sticky bar's identity and — until the
   * backend ships `variant_options` on tier items — the fallback option axes
   * for the per-unit pickers.
   */
  product?: Product | null;
}

/**
 * PDP bundle selector: a tier radio list where the selected tier expands to let
 * the shopper configure each unit's variant independently, plus the in-flow
 * "Add to Cart / Order Now" pair and a persistent bottom purchase bar.
 *
 * Replaces the standard quantity + add/buy controls when the product has an
 * active bundle. Each unit row owns its own size/colour, so the caller
 * suppresses the page-level variant selector.
 */
export function ProductBundleSelector({
  bundle,
  product,
}: ProductBundleSelectorProps) {
  const { t } = useTranslation();
  const router = useVariantRouter();
  const { addBundleTier } = useBundleCart();
  const { axesFor, unitsFor, setAxisValue, componentsFor, summaryFor } =
    useBundleUnits({ product });

  const defaultTier = useMemo(
    () =>
      bundle.tiers.find((tr) => tr.is_default && tr.is_available) ??
      bundle.tiers.find((tr) => tr.is_available) ??
      bundle.tiers[0],
    [bundle.tiers]
  );
  const [selectedTierId, setSelectedTierId] = useState<number>(
    defaultTier?.id ?? 0
  );

  const selectedTier =
    bundle.tiers.find((tr) => tr.id === selectedTierId) ?? defaultTier;

  // The sticky bar stays out of the way while the in-flow CTAs are on screen,
  // so the shopper never sees two competing primary actions at once.
  const actionsRef = useRef<HTMLDivElement>(null);
  const [actionsVisible, setActionsVisible] = useState(true);

  useEffect(() => {
    const node = actionsRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setActionsVisible(entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!selectedTier) return null;

  const units = unitsFor(selectedTier);
  const soldOut = selectedTier.is_available === false;
  const blocked = soldOut || !units.isReady;

  const handleAddToCart = (tier: BundleTier) => {
    addBundleTier(bundle, tier, {
      components: componentsFor(tier),
      summary: summaryFor(tier),
    });
  };

  const handleOrderNow = (tier: BundleTier) => {
    handleAddToCart(tier);
    router.push(buyNowCheckoutHref(bundle.id, tier.id));
  };

  const stickySummary = [
    selectedTier.name,
    units.hasPicker ? summaryFor(selectedTier) : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-bold sm:text-base">
            <Gift className="size-4 text-primary" />
            {t("bundle.selectBundle")}
          </h2>
          {selectedTier.savings > 0 && (
            <span className="text-xs font-semibold text-bundle-save">
              {t("bundle.youSaveTotal")} <Price amount={selectedTier.savings} />
            </span>
          )}
        </div>

        <BundleTierList
          bundle={bundle}
          selectedTierId={selectedTierId}
          onSelect={setSelectedTierId}
          renderUnits={(tier) => {
            const tierUnits = unitsFor(tier);
            if (!tierUnits.hasPicker) return null;
            return (
              <BundleUnitPicker
                slots={tierUnits.slots}
                selections={tierUnits.selections}
                issues={tierUnits.issues}
                axesFor={axesFor}
                onAxisChange={(slotKey, item, optionName, value) =>
                  setAxisValue(tier, slotKey, item, optionName, value)
                }
                showItemName={tier.items.length > 1}
              />
            );
          }}
        />

        {/* Action pair */}
        <div ref={actionsRef} className="flex items-stretch gap-2.5 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAddToCart(selectedTier)}
            disabled={blocked}
            className="h-12 flex-1 text-sm font-bold sm:text-base"
          >
            <ShoppingBag className="mr-1.5 size-4 sm:size-5" />
            {t("bundle.addToCart")}
          </Button>
          <Button
            type="button"
            onClick={() => handleOrderNow(selectedTier)}
            disabled={blocked}
            className="h-12 flex-[1.35] text-sm font-bold sm:text-base"
          >
            {t("bundle.orderNow")}
            <ArrowRight className="ml-1.5 size-4 sm:size-5" />
          </Button>
        </div>

        <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          {t("bundle.secureCheckout")}
        </p>
      </section>

      <StickyProductBar
        name={product?.name ?? bundle.title}
        image={
          product?.thumbnail_image ||
          selectedTier.items.find((i) => i.thumbnail_image?.trim())
            ?.thumbnail_image ||
          bundle.banner ||
          ""
        }
        price={selectedTier.price}
        summary={stickySummary}
        onAddToCart={() => handleAddToCart(selectedTier)}
        onOrderNow={() => handleOrderNow(selectedTier)}
        disabled={blocked}
        visible={!actionsVisible}
      />
    </>
  );
}
