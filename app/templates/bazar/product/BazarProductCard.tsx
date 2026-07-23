"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { Button } from "@/components/shared/ui/button";
import { toast } from "@/components/shared/ui/sonner";
import Price from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { buyNowCheckoutHref } from "@/lib/utils/buy-now";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { useHydrated } from "@/hooks/use-hydrated";
import { toggleWishlist } from "@/(app-routes)/(auth)/action";
import type { Product } from "@/(app-routes)/products/model";
import { cn } from "@/lib/utils/utils";

const FALLBACK_IMAGE =
	"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&q=80";

/**
 * Bazar product card: stock ribbon, wishlist heart, image, name, price with
 * strike-through + save badge, and always-visible Add to Cart / Buy Now.
 */
export function BazarProductCard({ product }: { product: Product }) {
	const { t } = useTranslation();
	const router = useRouter();
	const { addToCart } = useCart();
	const [userProfile] = useAtom(miniProfileAtom);
	const [wishlistIds, setWishlistIds] = useAtom(wishlistAtom);
	const [isWishlistLoading, setIsWishlistLoading] = useState(false);
	// Wishlist state is localStorage-backed (empty on the server). Gate on
	// hydration so the first client render matches SSR and avoids a mismatch.
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
	const saveAmount = hasDiscount
		? product.price - product.discounted_price
		: 0;

	// Same variant-aware add-to-cart behaviour as ProductCardItem.
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
			image: imageSource,
			variant_id: variant?.id,
			stock,
			tax: product.tax ? parseFloat(product.tax) : 0,
			tax_type: product.tax_type || "exclude",
		});
		return { id: product.id, variant_id: variant?.id };
	};

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		if (doAddToCart()) {
			toast.success(t("bazar.addToCart"), {
				description: `${product.name} ${t("productCard.addedToCart")}`,
			});
		}
	};

	const handleBuyNow = (e: React.MouseEvent) => {
		e.preventDefault();
		const line = doAddToCart();
		if (line) {
			router.push(buyNowCheckoutHref(line.id, line.variant_id));
		}
	};

	const handleToggleWishlist = async (e: React.MouseEvent) => {
		e.preventDefault();
		if (!userProfile) {
			toast.error(t("productCard.loginRequired"));
			router.push(
				`/login?redirect=${encodeURIComponent(
					window.location.pathname
				)}`
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
		<div className="group relative flex h-full flex-col overflow-hidden rounded-md border bg-card shadow-sm transition-shadow hover:shadow-md">
			{/* Stock ribbon */}
			<span
				className={cn(
					"absolute -left-9 top-4 z-10 -rotate-45 px-10 py-1 text-[10px] font-bold uppercase tracking-wider shadow",
					isOutOfStock
						? "bg-destructive text-destructive-foreground"
						: "bg-primary text-primary-foreground"
				)}
			>
				{isOutOfStock ? t("bazar.stockOut") : t("bazar.stockIn")}
			</span>

			{/* Wishlist heart */}
			<button
				type="button"
				onClick={handleToggleWishlist}
				disabled={isWishlistLoading}
				aria-label={t("bazar.wishlist")}
				aria-pressed={isWishlisted}
				className={cn(
					"absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border bg-background/90 transition-colors",
					isWishlisted
						? "text-primary"
						: "text-muted-foreground hover:text-primary"
				)}
			>
				<Heart
					className={cn("h-4 w-4", isWishlisted && "fill-current")}
				/>
			</button>

			<Link
				href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
				className="block bg-white"
			>
				<Image
					src={imageSource}
					alt={product.name}
					width={400}
					height={400}
					className="h-40 w-full object-cover sm:h-56"
					sizes="(max-width: 1024px) 50vw, 20vw"
				/>
			</Link>

			<div className="flex flex-1 flex-col gap-2 p-3">
				<Link href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}>
					<h3 className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary">
						{product.name}
					</h3>
				</Link>
				<div className="mt-auto flex flex-wrap items-center gap-2">
					<span className="text-lg font-bold text-primary tabular-nums">
						<Price amount={product.discounted_price} />
					</span>
					{hasDiscount && (
						<>
							<span className="text-xs text-muted-foreground line-through tabular-nums">
								<Price amount={product.price} />
							</span>
							<span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
								{t("bazar.save")}{" "}
								<Price amount={saveAmount} />
							</span>
						</>
					)}
				</div>
				<div className="grid grid-cols-2 gap-2">
					<Button
						variant="secondary"
						size="sm"
						className="text-[11px] font-bold uppercase"
						onClick={handleAddToCart}
						disabled={isOutOfStock}
					>
						{t("bazar.addToCart")}
					</Button>
					<Button
						size="sm"
						className="text-[11px] font-bold uppercase"
						onClick={handleBuyNow}
						disabled={isOutOfStock}
					>
						{t("bazar.buyNow")}
					</Button>
				</div>
			</div>
		</div>
	);
}
