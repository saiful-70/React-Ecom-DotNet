"use client";

import "../classic.css";

import { useState } from "react";
import { useAtom } from "jotai";
import { Heart, Loader2 } from "lucide-react";
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
import { KhataImage } from "../shared/KhataImage";
import { cn } from "@/lib/utils/utils";

const FALLBACK_IMAGE =
	"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&q=80";

/**
 * A ledger entry: photo matted on page white, the item's name written on the
 * line, current price heavy in stamp red with the old price struck through,
 * and two ≥44px actions. Sold-out entries get their price rule-struck.
 */
export function KhataProductCard({ product }: { product: Product }) {
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
	const imageSource =
		product.thumbnail_image && product.thumbnail_image.trim() !== ""
			? product.thumbnail_image
			: FALLBACK_IMAGE;

	const isOutOfStock = product.stock <= 0;
	const hasDiscount =
		product.price > product.discounted_price &&
		product.discount_type !== "none";

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
			toast.success(t("classic2.addedToBag", "খাতায় লেখা হলো"), {
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
		<div className="group relative flex h-full flex-col rounded-md border bg-card shadow-warm-sm transition-shadow hover:shadow-warm-md">
			{/* Wishlist — a ballpoint tick in the margin. */}
			<button
				type="button"
				onClick={handleToggleWishlist}
				disabled={isWishlistLoading}
				aria-label={t("classic2.wishlist", "পছন্দের তালিকা")}
				aria-pressed={isWishlisted}
				className={cn(
					"ring-warm-focus absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-md border bg-card/95 transition-colors disabled:opacity-60",
					isWishlisted
						? "border-accent text-accent"
						: "text-muted-foreground hover:border-accent hover:text-accent"
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

			{/* Photo matted on page white. */}
			<Link
				href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
				className="ring-warm-focus relative block overflow-hidden rounded-t-md border-b bg-card p-2"
				tabIndex={-1}
				aria-hidden
			>
				{/* Status tag gummed onto the photo mat — never clickable. */}
				<span
					className={cn(
						"khata-tag absolute left-3 top-3 z-10 inline-flex rotate-[-3deg] items-center rounded-sm border bg-card px-2 py-0.5 text-[11px] font-semibold shadow-warm-sm",
						isOutOfStock
							? "border-foreground/30 text-muted-foreground"
							: "border-success/40 text-success"
					)}
				>
					{isOutOfStock
						? t("classic2.stockOut", "স্টক শেষ")
						: t("classic2.stockIn", "স্টকে আছে")}
				</span>
				<KhataImage
					src={product.thumbnail_image}
					alt={product.name}
					fallbackText={product.name}
					width={400}
					height={400}
					className={cn(
						"aspect-square w-full rounded-sm object-cover",
						isOutOfStock && "opacity-60 grayscale-[0.4]"
					)}
					sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
				/>
			</Link>

			<div className="flex flex-1 flex-col gap-1.5 p-3">
				{/* Stock status for assistive tech (the visual tag sits on the
				    photo mat inside an aria-hidden duplicate link). */}
				<span className="sr-only">
					{isOutOfStock
						? t("classic2.stockOut", "স্টক শেষ")
						: t("classic2.stockIn", "স্টকে আছে")}
				</span>

				<Link
					href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
					className="ring-warm-focus rounded-sm"
				>
					<h3 className="line-clamp-2 text-sm font-semibold leading-snug underline-offset-4 hover:underline">
						{product.name}
					</h3>
				</Link>

				<div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
					<span
						className={cn(
							"text-lg font-bold tabular-nums text-primary",
							isOutOfStock && "khata-strike text-muted-foreground"
						)}
					>
						<Price amount={product.discounted_price} />
					</span>
					{hasDiscount && !isOutOfStock && (
						<span className="text-xs tabular-nums text-muted-foreground line-through">
							<Price amount={product.price} />
						</span>
					)}
				</div>

				<div className="grid grid-cols-2 gap-1.5 pt-1">
					<button
						type="button"
						onClick={handleAddToCart}
						disabled={isOutOfStock}
						className="ring-warm-focus min-h-11 rounded-md border border-accent/60 px-2 text-xs font-bold text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
					>
						{t("classic2.addToBag", "ব্যাগে রাখুন")}
					</button>
					<button
						type="button"
						onClick={handleOrderNow}
						disabled={isOutOfStock}
						className="ring-warm-focus min-h-11 rounded-md bg-primary px-2 text-xs font-bold text-primary-foreground shadow-warm-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
					>
						{t("classic2.orderNow", "অর্ডার করুন")}
					</button>
				</div>
			</div>
		</div>
	);
}
