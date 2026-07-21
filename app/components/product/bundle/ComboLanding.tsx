"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  Gift,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import Price from "@/components/shared/Price";
import { cn } from "@/lib/utils/utils";
import { BundleTierList } from "./BundleTierList";
import { useBundleCart } from "./use-bundle-cart";
import type { Bundle } from "@/lib/bundles/types";

interface ComboLandingProps {
  combo: Bundle;
}

/** Dedicated combo landing page (mockup 6). Mobile-first, widened for desktop. */
export function ComboLanding({ combo }: ComboLandingProps) {
  const { t } = useTranslation();
  const { addBundleTier } = useBundleCart();

  const defaultTier = useMemo(
    () => combo.tiers.find((tr) => tr.is_default) ?? combo.tiers[0],
    [combo.tiers]
  );
  const [selectedTierId, setSelectedTierId] = useState<number>(
    defaultTier?.id ?? 0
  );
  const [activeImage, setActiveImage] = useState(0);

  const selectedTier =
    combo.tiers.find((tr) => tr.id === selectedTierId) ?? defaultTier;

  // Distinct products in the combo (from the entry tier) for the hero checklist.
  const heroItems = combo.tiers[0]?.items ?? [];
  const heroSave = combo.tiers[0]
    ? combo.tiers[0].compare_at_price - combo.tiers[0].price
    : 0;

  const trust = [
    { icon: ShieldCheck, label: t("bundle.trustOriginal") },
    { icon: Truck, label: t("bundle.trustFastDelivery") },
    { icon: Wallet, label: t("bundle.trustCod") },
    { icon: RotateCcw, label: t("bundle.trustReturn") },
  ];

  if (!selectedTier) return null;

  return (
    <main className="container mx-auto max-w-3xl px-3 sm:px-4 py-3 sm:py-6 pb-28 lg:pb-8">
      {/* Offer ribbon */}
      <div className="flex items-center justify-between gap-2 rounded-lg bg-primary/10 px-3 py-2 mb-3">
        <span className="flex items-center gap-1.5 text-sm font-bold text-primary">
          <Gift className="size-4" />
          {combo.subtitle}
        </span>
        {combo.badge && (
          <span className="rounded-md bg-warning px-2 py-1 text-[11px] font-bold text-warning-foreground">
            {combo.badge}
          </span>
        )}
      </div>

      {/* Hero */}
      <div className="grid gap-4 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
            <Image
              src={combo.images[activeImage] || combo.images[0]}
              alt={combo.title}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
              priority
            />
            {combo.tiers.some((tr) => (tr.badge || "").includes("BEST")) && (
              <span className="absolute left-3 top-3 rounded-md bg-primary px-2 py-1 text-[11px] font-bold text-primary-foreground">
                BEST VALUE
              </span>
            )}
            {heroSave > 0 && (
              <span className="absolute right-3 top-3 grid size-14 place-items-center rounded-full bg-destructive text-center text-[11px] font-bold leading-tight text-white">
                {t("bundle.youSave")}
                <br />
                <Price amount={heroSave} />
              </span>
            )}
          </div>
          {combo.images.length > 1 && (
            <div className="mt-2 flex justify-center gap-1.5">
              {combo.images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`image ${i + 1}`}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "size-2 rounded-full transition-colors",
                    i === activeImage ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold leading-tight mb-3">
            {combo.title}
          </h1>
          <ul className="space-y-1.5">
            {heroItems.map((item, i) => (
              <li
                key={`${item.product_id}-${i}`}
                className="flex items-center gap-2 text-sm"
              >
                <Check className="size-4 text-primary shrink-0" />
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Trust row */}
      <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl border border-border bg-card p-3">
        {trust.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 text-center"
          >
            <Icon className="size-5 text-primary" />
            <span className="text-[10px] sm:text-xs leading-tight text-muted-foreground">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Tier selector */}
      <div className="mt-5">
        <h2 className="flex items-center gap-1.5 font-bold text-base mb-3">
          <Gift className="size-4 text-primary" />
          {t("bundle.selectCombo")}
        </h2>
        <BundleTierList
          bundle={combo}
          selectedTierId={selectedTierId}
          onSelect={setSelectedTierId}
          showComposition
        />
      </div>

      {/* Total savings bar */}
      <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5 text-sm">
        <span className="font-medium">{t("bundle.youSaveTotal")}:</span>
        <span className="font-bold text-primary">
          <Price amount={selectedTier.savings} />
        </span>
      </div>

      {/* Social proof */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-card p-3 text-sm">
        <span className="font-semibold">
          10,000+ <span className="font-normal text-muted-foreground">
            {t("bundle.happyCustomers")}
          </span>
        </span>
        <span className="flex items-center gap-1 font-semibold">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          4.8/5
        </span>
      </div>

      {/* Sticky action bar (mobile) → inline (desktop) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background p-3 lg:static lg:mt-5 lg:rounded-xl lg:border lg:p-4">
        <div className="container mx-auto max-w-3xl flex items-center gap-3 px-0">
          <div className="shrink-0">
            <div className="text-[11px] text-muted-foreground leading-none">
              {t("bundle.totalPrice")}
            </div>
            <div className="text-lg font-bold text-destructive">
              <Price amount={selectedTier.price} />
            </div>
            {selectedTier.savings > 0 && (
              <div className="text-[11px] font-medium text-primary leading-none">
                {t("bundle.youSave")} <Price amount={selectedTier.savings} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <Button
              onClick={() => addBundleTier(combo, selectedTier)}
              className="w-full h-12 text-base font-bold"
            >
              <ShoppingCart className="size-5 mr-2" />
              {t("bundle.addComboToCart")}
            </Button>
            <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3" />
              {t("bundle.secureCheckout")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
