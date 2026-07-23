"use client";

import { useTranslation } from "react-i18next";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/components/shared/ui/sonner";
import type { Bundle, BundleTier } from "@/lib/bundles/types";

/**
 * Adds a selected bundle tier to the cart as ONE line.
 *
 * The line reuses `variant_id` (= tier id) as its cart-identity key so different
 * tiers stay distinct without a reducer change, and carries the required-item
 * composition in `bundle_components` so checkout can re-validate it. `price` is
 * the tier's server-read total; the FINAL payable amount is re-confirmed by
 * `validate-bundle` at checkout.
 */
export function useBundleCart() {
  const { t } = useTranslation();
  const { items, addToCart, removeFromCart } = useCart();

  const addBundleTier = (bundle: Bundle, tier: BundleTier) => {
    // Only "required" rows are part of the enforced composition.
    const requiredItems = tier.items.filter((i) => i.role === "required");

    // One combo per order: a different existing bundle line is replaced
    // rather than added alongside (the order payload carries a single
    // top-level server_quote_id, so two quoted combos can't coexist).
    // A re-add of the SAME tier (id + variant_id match) is left alone —
    // the reducer already merges it to quantity 1 with no toast.
    const existingBundleLine = items.find((i) => i.bundle_tier_id != null);
    if (
      existingBundleLine &&
      (existingBundleLine.id !== bundle.id ||
        existingBundleLine.variant_id !== tier.id)
    ) {
      removeFromCart(
        existingBundleLine.id,
        existingBundleLine.variant_id,
        existingBundleLine.bundle_tier_id
      );
      toast.info(t("bundle.replacedExisting"));
    }

    addToCart({
      id: bundle.id,
      variant_id: tier.id,
      name: `${bundle.title} — ${tier.name}`,
      price: tier.price,
      image:
        requiredItems.find((i) => i.thumbnail_image?.trim())
          ?.thumbnail_image ||
        bundle.banner ||
        "",
      quantity: 1,
      tax: 0,
      tax_type: "exclude",
      bundle_id: bundle.id,
      bundle_tier_id: tier.bundle_tier_id ?? tier.id,
      bundle_slug: bundle.slug,
      bundle_components: requiredItems.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id ?? null,
        qty: item.qty,
      })),
    });

    toast.success(t("bundle.addedToCart"), {
      description: t("bundle.bundleAddedDescription", {
        title: `${bundle.title} — ${tier.name}`,
      }),
    });
  };

  return { addBundleTier };
}
