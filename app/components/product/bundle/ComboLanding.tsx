"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  Clock,
  Gift,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { Button } from "@/components/shared/ui/button";
import { CartLineImage } from "@/components/shared/CartLineImage";
import Price from "@/components/shared/Price";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { cn } from "@/lib/utils/utils";
import { BundleTierList } from "./BundleTierList";
import { BundleUnitPicker } from "./BundleUnitPicker";
import { useBundleCart } from "./use-bundle-cart";
import { useBundleUnits } from "./use-bundle-units";
import { buyNowCheckoutHref } from "@/lib/utils/buy-now";
import type { Bundle, BundleTier } from "@/lib/bundles/types";

interface ComboLandingProps {
  combo: Bundle;
}

/** Backend trust-badge `icon` keys mapped to the fixed client icons. */
const TRUST_ICONS: Record<string, LucideIcon> = {
  original: ShieldCheck,
  delivery: Truck,
  cod: Wallet,
  return: RotateCcw,
};
const FALLBACK_TRUST_ICON = ShieldCheck;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/**
 * Live "offer ends in" countdown, driven by the real `ends_at` timestamp.
 * Renders nothing when there is no end date, the date is invalid, or the
 * offer has already expired. Client-only (mount-guarded) so SSR and the
 * first client paint agree before the timer takes over.
 */
function OfferCountdown({ endsAt }: { endsAt: string }) {
  const { t } = useTranslation();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(endsAt).getTime();
    if (Number.isNaN(end)) return;
    const tick = () => setRemaining(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (remaining === null || remaining <= 0) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const units = [
    { value: days, label: t("bundle.unitLabel_days") },
    { value: hours, label: t("bundle.unitLabel_hours") },
    { value: minutes, label: t("bundle.unitLabel_minutes") },
    { value: seconds, label: t("bundle.unitLabel_seconds") },
  ];

  return (
    <div className="rounded-xl border border-warning/40 bg-warning/10 p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-warning-foreground/80">
        <Clock className="size-3.5 animate-pulse" />
        {t("bundle.offerEndsIn")}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-lg font-bold text-warning">:</span>}
            <div className="flex flex-col items-center">
              <span className="grid min-w-9 place-items-center rounded-md bg-secondary px-1.5 py-1 font-display text-base font-bold tabular-nums text-secondary-foreground">
                {pad(u.value)}
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {u.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Dedicated combo landing page — editorial hero, live deal countdown, and an
 *  in-flow purchase panel (no floating bar) at every breakpoint. */
export function ComboLanding({ combo }: ComboLandingProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { addBundleTier } = useBundleCart();
  // No anchor product here, so per-unit pickers only appear once the backend
  // ships `variant_options` on the tier items.
  const { axesFor, unitsFor, setAxisValue, componentsFor, summaryFor } =
    useBundleUnits({});

  const handleAddToCart = (tier: BundleTier) => {
    addBundleTier(combo, tier, {
      components: componentsFor(tier),
      summary: summaryFor(tier),
    });
  };

  // Buy Now: add the selected tier, then go to a checkout scoped to just it
  // (a bundle line's cart identity is bundle id + tier id).
  const handleBuyNow = (tier: BundleTier) => {
    handleAddToCart(tier);
    router.push(buyNowCheckoutHref(combo.id, tier.id));
  };

  const defaultTier = useMemo(
    () =>
      combo.tiers.find((tr) => tr.is_default && tr.is_available) ??
      combo.tiers.find((tr) => tr.is_available) ??
      combo.tiers[0],
    [combo.tiers]
  );
  const [selectedTierId, setSelectedTierId] = useState<number>(
    defaultTier?.id ?? 0
  );

  const selectedTier =
    combo.tiers.find((tr) => tr.id === selectedTierId) ?? defaultTier;

  // Hero gallery: fall back to the single banner when the backend omits images[].
  const gallery = useMemo(
    () => (combo.images?.length ? combo.images : [combo.banner]),
    [combo.images, combo.banner]
  );
  const [activeImage, setActiveImage] = useState(0);

  // Trust badges: backend-driven (label + is_active) when provided, else the
  // built-in defaults. Icons stay client-side, resolved from the `icon` key.
  const trust: { Icon: LucideIcon; label: string }[] = combo.trust_badges
    ?.length
    ? combo.trust_badges
        .filter((b) => b.is_active)
        .map((b) => ({
          Icon: TRUST_ICONS[b.icon] ?? FALLBACK_TRUST_ICON,
          label: b.label,
        }))
    : [
        { Icon: ShieldCheck, label: t("bundle.trustOriginal") },
        { Icon: Truck, label: t("bundle.trustFastDelivery") },
        { Icon: Wallet, label: t("bundle.trustCod") },
        { Icon: RotateCcw, label: t("bundle.trustReturn") },
      ];

  if (!selectedTier) return null;

  const includedItems = selectedTier.items;
  // Blocked when sold out, or when a per-unit choice is missing / out of stock.
  const soldOut =
    selectedTier.is_available === false || !unitsFor(selectedTier).isReady;

  return (
    <main className="container mx-auto max-w-5xl py-4 sm:py-6 pb-12">
      {/* Eyebrow: offer label + backend badge */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
          <Gift className="size-3.5" />
          {t("bundle.comboOffer")}
        </span>
        {combo.badge && (
          <span className="rounded-full bg-warning px-2.5 py-1 text-[11px] font-bold text-warning-foreground">
            {combo.badge}
          </span>
        )}
      </div>

      {/* Hero: gallery + summary */}
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-warm-sm">
            <CartLineImage
              src={gallery[activeImage] ?? combo.banner}
              alt={combo.title}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
              priority
            />
            {selectedTier.savings > 0 && (
              <span className="absolute right-3 top-3 grid size-16 place-items-center rounded-full bg-destructive text-center text-[11px] font-bold leading-tight text-white shadow-warm">
                {t("bundle.youSave")}
                <br />
                <Price amount={selectedTier.savings} />
              </span>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`${combo.title} ${i + 1}`}
                  aria-pressed={i === activeImage}
                  className={cn(
                    "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition-colors",
                    i === activeImage
                      ? "border-primary"
                      : "border-transparent hover:border-primary/40"
                  )}
                >
                  <CartLineImage
                    src={src}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
              {combo.title}
            </h1>
            {combo.description && (
              <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                {combo.description}
              </p>
            )}
          </div>

          {/* Highlights (optional, backend-provided selling points) */}
          {combo.highlights?.length ? (
            <ul className="space-y-1.5">
              {combo.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {h}
                </li>
              ))}
            </ul>
          ) : null}

          {/* Price block */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-bold text-destructive">
              <Price amount={selectedTier.price} />
            </span>
            {selectedTier.compare_at_price > selectedTier.price && (
              <span className="text-lg text-muted-foreground line-through">
                <Price amount={selectedTier.compare_at_price} />
              </span>
            )}
            {selectedTier.savings > 0 && (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                {t("bundle.youSave")} <Price amount={selectedTier.savings} />
              </span>
            )}
          </div>

          {combo.ends_at && <OfferCountdown endsAt={combo.ends_at} />}
        </div>
      </div>

      {/* Trust row (backend-driven; hidden when no active badges) */}
      {trust.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-around gap-3 rounded-xl border border-border bg-card p-3 shadow-warm-sm">
          {trust.map(({ Icon, label }, i) => (
            <div
              key={`${label}-${i}`}
              className="flex min-w-[120px] flex-1 items-center justify-center gap-2 text-center sm:flex-col sm:gap-1"
            >
              <Icon className="size-5 shrink-0 text-primary" />
              <span className="text-xs leading-tight text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* About this offer (optional long-form HTML, sanitized) */}
      {combo.body && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">{t("bundle.aboutOffer")}</h2>
          <div
            className="prose prose-sm sm:prose max-w-none text-sm leading-relaxed text-muted-foreground [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>ol]:mb-2 [&>p]:mb-2 [&>ul]:mb-2"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(combo.body),
            }}
          />
        </section>
      )}

      {/* What's included */}
      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-1.5 text-lg font-bold">
          <Gift className="size-4 text-primary" />
          {t("bundle.whatsIncluded")}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {includedItems.map((item, i) => (
            <div
              key={`${item.product_id}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 shadow-warm-sm"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                <CartLineImage
                  src={item.thumbnail_image}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground shadow-sm">
                  {item.qty}
                </span>
              </div>
              <p className="min-w-0 flex-1 text-sm font-medium leading-tight">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tier selector */}
      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-1.5 text-lg font-bold">
          <Gift className="size-4 text-primary" />
          {t("bundle.selectCombo")}
        </h2>
        <BundleTierList
          bundle={combo}
          selectedTierId={selectedTierId}
          onSelect={setSelectedTierId}
          showComposition
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
      </section>

      {/* Purchase panel — in-flow at every breakpoint (attached, not floating) */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-warm sm:p-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <div className="text-xs text-muted-foreground">
              {t("bundle.totalPrice")}
            </div>
            <div className="text-2xl font-bold text-destructive">
              <Price amount={selectedTier.price} />
            </div>
          </div>
          {selectedTier.savings > 0 && (
            <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
              {t("bundle.youSaveTotal")}{" "}
              <Price amount={selectedTier.savings} />
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => handleAddToCart(selectedTier)}
            disabled={soldOut}
            className="h-12 flex-1 border-primary text-sm font-bold text-primary hover:bg-primary/10 hover:text-primary sm:text-base"
          >
            <ShoppingCart className="mr-1.5 size-5" />
            {t("bundle.addComboToCart")}
          </Button>
          <Button
            onClick={() => handleBuyNow(selectedTier)}
            disabled={soldOut}
            className="h-12 flex-1 text-sm font-bold sm:text-base"
          >
            <ShoppingBag className="mr-1.5 size-5" />
            {t("bundle.buyNow")}
          </Button>
        </div>

        <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          {t("bundle.secureCheckout")}
        </p>
      </section>

      {/* Terms (optional) */}
      {combo.terms && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold text-muted-foreground">
            {t("bundle.terms")}
          </h2>
          <div className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
            {combo.terms}
          </div>
        </section>
      )}
    </main>
  );
}
