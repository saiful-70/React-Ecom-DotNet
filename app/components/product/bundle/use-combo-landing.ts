"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RotateCcw,
  ShieldCheck,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { buyNowCheckoutHref } from "@/lib/utils/buy-now";
import { displayItems } from "@/lib/bundles/units";
import type { Bundle, BundleTier } from "@/lib/bundles/types";
import { useBundleCart } from "./use-bundle-cart";
import { useBundleUnits } from "./use-bundle-units";

/** Backend trust-badge `icon` keys mapped to the fixed client icons. */
const TRUST_ICONS: Record<string, LucideIcon> = {
  original: ShieldCheck,
  delivery: Truck,
  cod: Wallet,
  return: RotateCcw,
};
const FALLBACK_TRUST_ICON = ShieldCheck;

export interface ComboTrustBadge {
  Icon: LucideIcon;
  label: string;
}

/**
 * Everything the combo landing page needs, with no markup attached.
 *
 * Each template renders `/combo/[slug]` in its own visual world, so the state
 * machine lives here once and the five ComboLayouts are presentation only.
 * Keeping it headless is what stops a fix to the sold-out rule or the Buy Now
 * scope from having to be made five times.
 */
export function useComboLanding(combo: Bundle) {
  const { t } = useTranslation();
  const router = useRouter();
  const { addBundleTier } = useBundleCart();
  // Per-unit pickers are driven ONLY by the tier items' own `variant_options`
  // / `variants` from the combo API; unusable payloads degrade to the flat
  // card (see docs/api/bundle-per-unit-variant-contract.md).
  const { axesFor, unitsFor, setAxisValue, componentsFor, summaryFor } =
    useBundleUnits({});

  const defaultTier = useMemo(
    () =>
      combo.tiers.find((tier) => tier.is_default && tier.is_available) ??
      combo.tiers.find((tier) => tier.is_available) ??
      combo.tiers[0],
    [combo.tiers]
  );

  const [selectedTierId, setSelectedTierId] = useState<number>(
    defaultTier?.id ?? 0
  );
  const selectedTier =
    combo.tiers.find((tier) => tier.id === selectedTierId) ?? defaultTier;

  // Hero gallery: fall back to the single banner when the backend omits images[].
  const gallery = useMemo(
    () => (combo.images?.length ? combo.images : [combo.banner]),
    [combo.images, combo.banner]
  );
  const [activeImage, setActiveImage] = useState(0);

  const addToCart = (tier: BundleTier) => {
    addBundleTier(combo, tier, {
      components: componentsFor(tier),
      summary: summaryFor(tier),
    });
  };

  // Buy Now: add the selected tier, then go to a checkout scoped to just it
  // (a bundle line's cart identity is bundle id + tier id).
  const buyNow = (tier: BundleTier) => {
    addToCart(tier);
    router.push(buyNowCheckoutHref(combo.id, tier.id));
  };

  // Trust badges: backend-driven (label + is_active) when provided, else the
  // built-in defaults. Icons stay client-side, resolved from the `icon` key.
  const trust: ComboTrustBadge[] = combo.trust_badges?.length
    ? combo.trust_badges
        .filter((badge) => badge.is_active)
        .map((badge) => ({
          Icon: TRUST_ICONS[badge.icon] ?? FALLBACK_TRUST_ICON,
          label: badge.label,
        }))
    : [
        { Icon: ShieldCheck, label: t("bundle.trustOriginal") },
        { Icon: Truck, label: t("bundle.trustFastDelivery") },
        { Icon: Wallet, label: t("bundle.trustCod") },
        { Icon: RotateCcw, label: t("bundle.trustReturn") },
      ];

  // Only the enforced composition, coalesced by product: a tier declaring the
  // same product as several rows reads as ONE entry with a summed qty, and
  // optional add-on rows aren't part of the tier price.
  const includedItems = selectedTier ? displayItems(selectedTier) : [];

  // Blocked when sold out, or when a per-unit choice is missing / out of stock.
  const soldOut = selectedTier
    ? selectedTier.is_available === false || !unitsFor(selectedTier).isReady
    : true;

  return {
    selectedTier,
    selectedTierId,
    selectTier: setSelectedTierId,
    gallery,
    activeImage,
    setActiveImage,
    trust,
    includedItems,
    soldOut,
    addToCart,
    buyNow,
    // Per-unit picker plumbing, passed straight through to BundleUnitPicker.
    axesFor,
    unitsFor,
    setAxisValue,
  };
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Live remainder for the real `ends_at` timestamp, or null when there is no
 * end date, the date is unparseable, or the offer has already run out.
 *
 * Returns null on the server and on the first client paint so SSR and
 * hydration agree before the timer takes over. Every world draws its own
 * countdown from these numbers; none of them may invent one without `ends_at`.
 */
export function useOfferCountdown(
  endsAt: string | null | undefined
): CountdownParts | null {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!endsAt) {
      setRemaining(null);
      return;
    }
    const end = new Date(endsAt).getTime();
    if (Number.isNaN(end)) {
      setRemaining(null);
      return;
    }
    const tick = () => setRemaining(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (remaining === null || remaining <= 0) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** Two-digit pad for countdown figures. */
export const pad2 = (n: number) => n.toString().padStart(2, "0");
