"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { toast } from "@/components/shared/ui/sonner";
import Price from "@/components/shared/Price";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { useHydrated } from "@/hooks/use-hydrated";
import { toggleWishlist } from "@/(app-routes)/(auth)/action";
import type { Product } from "@/(app-routes)/products/model";
import { cn } from "@/lib/utils/utils";
import { useQuickAdd } from "./use-quick-add";
import { BazarImage } from "../BazarImage";
import "../bazar.css";

/**
 * Product tile in the chart-row grammar: laminated chip corners, stock state
 * PRINTED as a chart tag (never hidden), heavy tabular current price over a
 * struck original, offer-red save tag, and two ≥48px order keys that depress
 * like a keypad.
 */
export function BazarProductCard({ product }: { product: Product }) {
	const { t } = useTranslation();
	const router = useRouter();
	const { handleAddToCart, handleBuyNow } = useQuickAdd(product);
	const [userProfile] = useAtom(miniProfileAtom);
	const [wishlistIds, setWishlistIds] = useAtom(wishlistAtom);
	const [isWishlistLoading, setIsWishlistLoading] = useState(false);
	// Wishlist state is localStorage-backed (empty on the server). Gate on
	// hydration so the first client render matches SSR and avoids a mismatch.
	const isHydrated = useHydrated();

	const isWishlisted = isHydrated && wishlistIds.includes(product.id);

	const isOutOfStock = product.stock <= 0;
	const hasDiscount =
		product.price > product.discounted_price &&
		product.discount_type !== "none";
	const saveAmount = hasDiscount ? product.price - product.discounted_price : 0;

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
		<div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-warm-sm transition-shadow duration-200 hover:shadow-warm">
			{/* Wishlist key */}
			<button
				type="button"
				onClick={handleToggleWishlist}
				disabled={isWishlistLoading}
				aria-label={t("bazar.wishlist")}
				aria-pressed={isWishlisted}
				className={cn(
					"bz-key ring-warm-focus absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/95 shadow-warm-sm disabled:opacity-60",
					isWishlisted
						? "text-accent"
						: "text-muted-foreground hover:text-accent"
				)}
			>
				<Heart
					className={cn("h-4 w-4", isWishlisted && "fill-current")}
					aria-hidden="true"
				/>
			</button>

			<Link
				href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
				className="ring-warm-focus block bg-background"
				tabIndex={-1}
				aria-hidden="true"
			>
				<BazarImage
					src={product.thumbnail_image}
					alt={product.name}
					width={400}
					height={400}
					className={cn(
						"h-40 w-full object-cover sm:h-52",
						isOutOfStock && "opacity-60 grayscale-[40%]"
					)}
					plateClassName="h-40 w-full text-4xl sm:h-52"
					sizes="(max-width: 1024px) 50vw, 20vw"
				/>
			</Link>

			<div className="flex flex-1 flex-col gap-2 border-t border-dashed border-border p-3">
				{/* Stock state — always printed, chart-tag style. */}
				<p
					className={cn(
						"text-xs font-bold",
						isOutOfStock ? "text-destructive" : "text-success"
					)}
				>
					{isOutOfStock
						? t("bazar.stockSoldOut", "স্টক শেষ")
						: t("bazar.stockIn")}
				</p>

				<Link
					href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
					className="ring-warm-focus rounded-md"
				>
					<h3 className="line-clamp-2 text-sm font-bold leading-snug hover:text-primary">
						{product.name}
					</h3>
				</Link>

				<div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1">
					<span className="bz-num font-display text-xl font-bold text-primary">
						<Price amount={product.discounted_price} />
					</span>
					{hasDiscount && (
						<>
							<span className="bz-num text-xs text-muted-foreground line-through">
								<Price amount={product.price} />
							</span>
							<span className="bz-num rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-bold text-accent-foreground">
								{t("bazar.save")} <Price amount={saveAmount} />
							</span>
						</>
					)}
				</div>

				<div className="grid grid-cols-2 gap-1.5 sm:gap-2">
					<button
						type="button"
						onClick={handleAddToCart}
						disabled={isOutOfStock}
						className="bz-key ring-warm-focus min-h-12 whitespace-normal rounded-lg bg-secondary px-2 py-1.5 text-xs font-bold leading-tight text-secondary-foreground shadow-warm-sm disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
					>
						{t("bazar.addToCart")}
					</button>
					<button
						type="button"
						onClick={handleBuyNow}
						disabled={isOutOfStock}
						className="bz-key ring-warm-focus min-h-12 whitespace-normal rounded-lg bg-primary px-2 py-1.5 text-xs font-bold leading-tight text-primary-foreground shadow-warm-sm disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
					>
						{t("bazar.buyNow")}
					</button>
				</div>
			</div>
		</div>
	);
}
