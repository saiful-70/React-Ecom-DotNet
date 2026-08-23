"use client";

import { useTranslation } from "react-i18next";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { toast } from "@/components/shared/ui/sonner";
import { useCart } from "@/contexts/CartContext";
import { buyNowCheckoutHref } from "@/lib/utils/buy-now";
import type { Product } from "@/(app-routes)/products/model";

const FALLBACK_IMAGE =
	"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&q=80";

export function productImage(product: Product): string {
	return product.thumbnail_image && product.thumbnail_image.trim() !== ""
		? product.thumbnail_image
		: FALLBACK_IMAGE;
}

/**
 * One-tap add/buy used by both the tariff-board rows and the product tiles.
 * Same variant-aware behaviour as the shared ProductCardItem: first variant
 * wins, stock guarded, tax fields forwarded to the cart reducer.
 */
export function useQuickAdd(product: Product) {
	const { t } = useTranslation();
	const router = useRouter();
	const { addToCart } = useCart();

	const doAddToCart = (): { id: number; variant_id?: number } | null => {
		const variant =
			product.variants && product.variants.length > 0
				? product.variants[0]
				: null;
		const price = variant
			? parseFloat(variant.discount_price.toString())
			: parseFloat(product.discounted_price.toString());
		const stock = variant ? variant.stock : product.stock;

		if (stock <= 0) {
			toast.error(t("products.outOfStock"));
			return null;
		}
		addToCart({
			id: product.id,
			name: variant
				? `${product.name} - ${variant.combination_text}`
				: product.name,
			price,
			image: productImage(product),
			variant_id: variant?.id,
			stock,
			tax: product.tax ? parseFloat(product.tax) : 0,
			tax_type: product.tax_type || "exclude",
		});
		return { id: product.id, variant_id: variant?.id };
	};

	const handleAddToCart = (e?: React.MouseEvent) => {
		e?.preventDefault();
		if (doAddToCart()) {
			toast.success(t("bazar.addToCart"), {
				description: `${product.name} ${t("productCard.addedToCart")}`,
			});
		}
	};

	const handleBuyNow = (e?: React.MouseEvent) => {
		e?.preventDefault();
		const line = doAddToCart();
		if (line) {
			router.push(buyNowCheckoutHref(line.id, line.variant_id, 1));
		}
	};

	return { handleAddToCart, handleBuyNow };
}
