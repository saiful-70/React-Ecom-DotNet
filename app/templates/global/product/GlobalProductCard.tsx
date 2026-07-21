"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { toast } from "@/components/shared/ui/sonner";
import Price from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { toggleWishlist } from "@/(app-routes)/(auth)/action";
import type { Product } from "@/(app-routes)/products/model";
import { cn } from "@/lib/utils/utils";
import { GlobalRatingStars } from "./GlobalRatingStars";

const FALLBACK_IMAGE =
	"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80";

/**
 * Global product card: white surface, thin border, hover lift; discount badge,
 * hover wishlist + quick-view, name, price (discounted + strike), rating, and
 * an Add-to-Cart button that reveals on hover (always visible on touch).
 */
export function GlobalProductCard({ product }: { product: Product }) {
	const { t } = useTranslation();
	const router = useRouter();
	const { addToCart } = useCart();
	const [userProfile] = useAtom(miniProfileAtom);
	const [wishlistIds, setWishlistIds] = useAtom(wishlistAtom);
	const [isWishlistLoading, setIsWishlistLoading] = useState(false);

	const isWishlisted = wishlistIds.includes(product.id);
	const imageSource =
		product.thumbnail_image && product.thumbnail_image.trim() !== ""
			? product.thumbnail_image
			: FALLBACK_IMAGE;

	const isOutOfStock = product.stock <= 0;
	const hasDiscount =
		product.price > product.discounted_price &&
		product.discount_type !== "none";
	const discountPercent =
		hasDiscount && product.price > 0
			? Math.round(
					((product.price - product.discounted_price) / product.price) * 100
				)
			: 0;

	const doAddToCart = (): boolean => {
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
			return false;
		}
		addToCart({
			id: product.id,
			name: variant
				? `${product.name} - ${variant.combination_text}`
				: product.name,
			price,
			image: imageSource,
			variant_id: variant?.id,
			stock,
			tax: product.tax ? parseFloat(product.tax) : 0,
			tax_type: product.tax_type || "exclude",
		});
		return true;
	};

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		if (doAddToCart()) {
			toast.success(t("global.addToCart"), {
				description: `${product.name} ${t("productCard.addedToCart")}`,
			});
		}
	};

	const handleToggleWishlist = async (e: React.MouseEvent) => {
		e.preventDefault();
		if (!userProfile) {
			toast.error(t("productCard.loginRequired"));
			router.push(
				`/login?redirect=${encodeURIComponent(window.location.pathname)}`
			);
			return;
		}
		setIsWishlistLoading(true);
		try {
			const response = await toggleWishlist(product.id);
			if (response.success) {
				setWishlistIds(
					isWishlisted
						? wishlistIds.filter((id) => id !== product.id)
						: [...wishlistIds, product.id]
				);
				toast.success(
					isWishlisted
						? t("productCard.wishlistRemoved")
						: t("productCard.wishlistAdded")
				);
			} else {
				toast.error(
					response.message || t("productCard.wishlistUpdateFailed")
				);
			}
		} catch {
			toast.error(t("productCard.wishlistUpdateFailed"));
		} finally {
			setIsWishlistLoading(false);
		}
	};

	return (
		<div className="group relative flex h-full flex-col overflow-hidden rounded-md border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
			{/* Discount badge */}
			{discountPercent > 0 && (
				<span className="absolute left-2 top-2 z-10 rounded bg-primary px-1.5 py-0.5 text-[11px] font-bold text-primary-foreground">
					-{discountPercent}%
				</span>
			)}

			{/* Hover actions */}
			<div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
				<button
					type="button"
					onClick={handleToggleWishlist}
					disabled={isWishlistLoading}
					aria-label={t("global.wishlist")}
					aria-pressed={isWishlisted}
					className={cn(
						"flex h-8 w-8 items-center justify-center rounded-full border bg-background/95 shadow-sm transition-colors",
						isWishlisted
							? "text-primary"
							: "text-muted-foreground hover:text-primary"
					)}
				>
					<Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
				</button>
				<Link
					href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
					aria-label={t("global.quickView")}
					className="flex h-8 w-8 items-center justify-center rounded-full border bg-background/95 text-muted-foreground shadow-sm transition-colors hover:text-primary"
				>
					<Eye className="h-4 w-4" />
				</Link>
			</div>

			<Link
				href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
				className="block bg-white p-3"
			>
				<Image
					src={imageSource}
					alt={product.name}
					width={400}
					height={400}
					className="mx-auto h-32 w-full object-contain transition-transform duration-300 group-hover:scale-105 sm:h-44"
					sizes="(max-width: 1024px) 50vw, 20vw"
				/>
			</Link>

			<div className="flex flex-1 flex-col gap-1.5 p-3 pt-2">
				<Link href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}>
					<h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug hover:text-primary">
						{product.name}
					</h3>
				</Link>

				<GlobalRatingStars
					rating={product.average_rating}
					count={product.total_reviews}
				/>

				<div className="mt-auto flex flex-wrap items-baseline gap-2">
					<span className="text-base font-bold text-primary tabular-nums">
						<Price amount={product.discounted_price} />
					</span>
					{hasDiscount && (
						<span className="text-xs text-muted-foreground line-through tabular-nums">
							<Price amount={product.price} />
						</span>
					)}
				</div>

				<button
					type="button"
					onClick={handleAddToCart}
					disabled={isOutOfStock}
					className={cn(
						"mt-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition-colors",
						isOutOfStock
							? "cursor-not-allowed bg-muted text-muted-foreground"
							: "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
					)}
				>
					<ShoppingCart className="h-3.5 w-3.5" />
					{isOutOfStock ? t("global.stockOut") : t("global.addToCart")}
				</button>
			</div>
		</div>
	);
}
