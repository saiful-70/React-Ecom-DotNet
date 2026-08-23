"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { toast } from "@/components/shared/ui/sonner";
import Price from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { useHydrated } from "@/hooks/use-hydrated";
import { toggleWishlist } from "@/(app-routes)/(auth)/action";
import type { Product } from "@/(app-routes)/products/model";
import { cn } from "@/lib/utils/utils";
import { itemNo } from "../_data/catalogue";
import { CatalogueImage } from "./CatalogueImage";
import { GlobalAvailabilityLine } from "./GlobalAvailabilityLine";
import { GlobalRatingStars } from "./GlobalRatingStars";
import "../global.css";

const FALLBACK_IMAGE =
	"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80";

/**
 * The catalogue plate: item number header, product image, name, rating,
 * ink price with the discount figure in sale-red, and the printed
 * availability course. Hairline border, 2px print corner, slide-and-settle
 * lift on hover. Cart/wishlist behavior is unchanged from the previous card.
 */
export function GlobalProductCard({ product }: { product: Product }) {
	const { t } = useTranslation();
	const router = useRouter();
	const { addToCart } = useCart();
	const [userProfile] = useAtom(miniProfileAtom);
	const [wishlistIds, setWishlistIds] = useAtom(wishlistAtom);
	const [isWishlistLoading, setIsWishlistLoading] = useState(false);
	// Wishlist state is localStorage-backed (empty on the server). Gate on
	// hydration so the first client render matches SSR.
	const isHydrated = useHydrated();

	const isWishlisted = isHydrated && wishlistIds.includes(product.id);
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
		<article className="g-lift group relative flex h-full flex-col rounded-sm border border-border bg-card transition-colors hover:border-foreground/50">
			{/* Plate header: item number + discount figure */}
			<div className="flex items-baseline justify-between gap-2 border-b border-border px-3 py-1.5">
				<span className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground tabular-nums">
					{t("global.catalogue.no", "No.")} {itemNo(product.id)}
				</span>
				{discountPercent > 0 && (
					<span className="text-[11px] font-black text-accent tabular-nums">
						−{discountPercent}%
					</span>
				)}
			</div>

			{/* Hover actions */}
			<div className="absolute right-2 top-9 z-10 flex flex-col gap-1.5 opacity-0 transition-opacity duration-300 focus-within:opacity-100 group-hover:opacity-100">
				<button
					type="button"
					onClick={handleToggleWishlist}
					disabled={isWishlistLoading}
					aria-label={t("global.wishlist")}
					aria-pressed={isWishlisted}
					className={cn(
						"ring-warm-focus flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-background/95 transition-colors disabled:opacity-50",
						isWishlisted
							? "text-foreground"
							: "text-muted-foreground hover:border-foreground/50 hover:text-foreground"
					)}
				>
					<Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
				</button>
				<Link
					href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
					aria-label={t("global.quickView")}
					className="ring-warm-focus flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-background/95 text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground"
				>
					<Eye className="h-4 w-4" />
				</Link>
			</div>

			<Link
				href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
				className="ring-warm-focus block bg-background p-3"
				tabIndex={-1}
				aria-hidden="true"
			>
				<CatalogueImage
					src={product.thumbnail_image}
					alt={product.name}
					itemId={product.id}
					width={400}
					height={400}
					className={cn(
						"mx-auto h-32 w-full object-contain sm:h-44",
						isOutOfStock && "opacity-50 grayscale"
					)}
					sizes="(max-width: 1024px) 50vw, 20vw"
				/>
			</Link>

			<div className="flex flex-1 flex-col gap-1.5 border-t border-border px-3 pb-3 pt-2">
				<Link
					href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
					className="ring-warm-focus rounded-sm"
				>
					<h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug hover:underline">
						{product.name}
					</h3>
				</Link>

				<GlobalRatingStars
					rating={product.average_rating}
					count={product.total_reviews}
				/>

				<div className="mt-auto flex flex-wrap items-baseline gap-x-2">
					<span className="text-base font-black tracking-tight tabular-nums">
						<Price amount={product.discounted_price} />
					</span>
					{hasDiscount && (
						<span className="text-xs text-muted-foreground line-through tabular-nums">
							<Price amount={product.price} />
						</span>
					)}
				</div>

				<GlobalAvailabilityLine stock={product.stock} />

				<button
					type="button"
					onClick={handleAddToCart}
					disabled={isOutOfStock}
					className={cn(
						"ring-warm-focus mt-1.5 flex items-center justify-center gap-1.5 rounded-sm border py-2 text-xs font-semibold transition-colors",
						isOutOfStock
							? "cursor-not-allowed border-border bg-muted text-muted-foreground"
							: "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
					)}
				>
					<ShoppingCart className="h-3.5 w-3.5" />
					{isOutOfStock ? t("global.stockOut") : t("global.addToCart")}
				</button>
			</div>
		</article>
	);
}
