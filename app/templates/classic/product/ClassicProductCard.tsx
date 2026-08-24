"use client";

import "../classic.css";

import { useState } from "react";
import { useAtom } from "jotai";
import { Heart, Loader2, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
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
import { ClassicImage } from "../shared/ClassicImage";
import { cn } from "@/lib/utils/utils";

/**
 * Neutral local placeholder for the CART LINE payload only (the cart thumbnail
 * is rendered by shared code that needs a URL string). Display inside this
 * card goes through ClassicImage's own in-world fallback plate — no remote
 * third-party placeholder anywhere.
 */
const CART_LINE_PLACEHOLDER = "/placeholder.svg";

/**
 * The offer card: a 1:1 photograph with nothing over it but the discount
 * chip, the name on two lines, the price as the heaviest thing in the card,
 * and ONE vermilion order action in the thumb zone. Add-to-bag is demoted to
 * a quiet icon beside it, and saving for later sits with the item's meta
 * rather than competing with the buy.
 */
export function ClassicProductCard({ product }: { product: Product }) {
	const { t } = useTranslation();
	const router = useRouter();
	const { addToCart } = useCart();
	const [userProfile] = useAtom(miniProfileAtom);
	const [wishlistIds, setWishlistIds] = useAtom(wishlistAtom);
	const [isWishlistLoading, setIsWishlistLoading] = useState(false);
	// Wishlist state is localStorage-backed (empty on the server); gate on
	// hydration so the first client render matches SSR.
	const isHydrated = useHydrated();

	const isWishlisted = isHydrated && wishlistIds.includes(product.id);
	const cartLineImage =
		product.thumbnail_image && product.thumbnail_image.trim() !== ""
			? product.thumbnail_image
			: CART_LINE_PLACEHOLDER;

	const isOutOfStock = product.stock <= 0;
	const hasDiscount =
		product.price > product.discounted_price &&
		product.discount_type !== "none";
	const discountPercent = hasDiscount
		? Math.round(
				((product.price - product.discounted_price) / product.price) * 100
			)
		: 0;

	// Same variant-aware add-to-cart behaviour as the shared card.
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
			image: cartLineImage,
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
			toast.success(t("classic2.addedToBag", "ব্যাগে যোগ হয়েছে"), {
				description: `${product.name} ${t("productCard.addedToCart")}`,
			});
		}
	};

	const handleOrderNow = (e: React.MouseEvent) => {
		e.preventDefault();
		const line = doAddToCart();
		if (line) {
			router.push(buyNowCheckoutHref(line.id, line.variant_id, 1));
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
		<div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-warm-sm transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-warm-md">
			{/* The photograph, 1:1, with the discount chip and nothing else. It
			    lifts under the card's own hover — the card's single depth/scale
			    device, not a separate effect. */}
			<Link
				href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
				className="ring-warm-focus relative block overflow-hidden bg-muted"
				tabIndex={-1}
				aria-hidden
			>
				{discountPercent > 0 && !isOutOfStock && (
					<span className="classic-price absolute left-2 top-2 z-10 rounded-md bg-primary px-2 py-0.5 text-xs font-extrabold text-primary-foreground">
						−{discountPercent}%
					</span>
				)}
				<ClassicImage
					src={product.thumbnail_image}
					alt={product.name}
					fallbackText={product.name}
					width={400}
					height={400}
					className={cn(
						"aspect-square w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]",
						isOutOfStock && "opacity-60 grayscale"
					)}
					sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
				/>
			</Link>

			<div className="flex flex-1 flex-col gap-1.5 p-3">
				{/* Price leads the card body, directly under the photograph: it is
				    the heaviest thing here, and on a 390px phone this is what
				    keeps it inside the first viewport above the fixed call bar.
				    Saving for later sits with it, quiet, so it never competes
				    with the buy. */}
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0">
						<span className="classic-price block text-xl font-extrabold leading-none text-foreground md:text-2xl">
							<Price amount={product.discounted_price} />
						</span>
						{hasDiscount && (
							<span className="classic-price mt-1 block text-xs text-muted-foreground line-through">
								<Price amount={product.price} />
							</span>
						)}
					</div>
					<button
						type="button"
						onClick={handleToggleWishlist}
						disabled={isWishlistLoading}
						aria-label={t("classic2.wishlist", "পছন্দের তালিকা")}
						aria-pressed={isWishlisted}
						className={cn(
							"ring-warm-focus -mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-60",
							isWishlisted
								? "text-primary"
								: "text-muted-foreground/70 hover:bg-accent hover:text-foreground"
						)}
					>
						{isWishlistLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" aria-hidden />
						) : (
							<Heart
								className={cn("h-4 w-4", isWishlisted && "fill-current")}
								aria-hidden
							/>
						)}
					</button>
				</div>

				<Link
					href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
					className="ring-warm-focus rounded-md"
				>
					<h3 className="line-clamp-2 text-sm font-medium leading-snug text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
						{product.name}
					</h3>
				</Link>

				{/* State is stated once: in stock as a green line, out of stock as
				    the disabled button's own label below. */}
				{!isOutOfStock && (
					<p className="mt-auto text-xs font-semibold text-success">
						{t("classic2.stockIn", "স্টকে আছে")}
					</p>
				)}

				{/* One buy action. Add-to-bag is the quiet icon beside it. */}
				<div className="flex items-stretch gap-1.5 pt-1">
					<button
						type="button"
						onClick={handleOrderNow}
						disabled={isOutOfStock}
						className="ring-warm-focus min-h-12 flex-1 rounded-lg bg-primary px-2 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
					>
						{isOutOfStock
							? t("classic2.stockOut", "স্টক শেষ")
							: t("classic2.orderNow", "অর্ডার করুন")}
					</button>
					<button
						type="button"
						onClick={handleAddToCart}
						disabled={isOutOfStock}
						aria-label={t("classic2.addToBag", "ব্যাগে রাখুন")}
						title={t("classic2.addToBag", "ব্যাগে রাখুন")}
						className="ring-warm-focus flex min-h-12 w-11 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:bg-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
					>
						<ShoppingBag className="h-4 w-4" aria-hidden />
					</button>
				</div>
			</div>
		</div>
	);
}
