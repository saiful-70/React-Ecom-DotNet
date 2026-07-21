"use client";

import { useTranslation } from "react-i18next";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/components/shared/ui/sonner";
import type { Bundle, BundleTier } from "@/lib/bundles/types";

/**
 * Adds a selected bundle tier to the cart as ONE line.
 *
 * The line reuses `variant_id` (= tier id) as its cart-identity key so different
 * tiers stay distinct without a reducer change, and carries the composition in
 * `bundle_components` for the future order payload. `price` is the tier's
 * server-authoritative total; `quantity` is 1 (the whole set).
 */
export function useBundleCart() {
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const addBundleTier = (bundle: Bundle, tier: BundleTier) => {
    addToCart({
      id: bundle.id,
      variant_id: tier.id,
      name: `${bundle.title} — ${tier.label}`,
      price: tier.price,
      image: tier.items[0]?.image || bundle.images[0] || "",
      quantity: 1,
      // Bundles are priced as a total; tax stays exclusive/0 until the backend
      // returns a blended tier tax (see the API contract).
      tax: 0,
      tax_type: "exclude",
      bundle_id: bundle.id,
      bundle_tier_id: tier.id,
      bundle_type: bundle.type,
      bundle_components: tier.items.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
      })),
    });

    toast.success(t("bundle.addedToCart"), {
      description: t("bundle.bundleAddedDescription", {
        title: `${bundle.title} — ${tier.label}`,
      }),
    });
  };

  return { addBundleTier };
}
