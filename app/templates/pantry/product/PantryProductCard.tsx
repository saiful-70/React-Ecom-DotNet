"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import {
	ChevronRight,
	Heart,
	Loader2,
	Package,
	ShoppingBag,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { useFeature } from "@/components/shared/providers/variant-provider";
import { toast } from "@/components/shared/ui/sonner";
import Price from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { useHydrated } from "@/hooks/use-hydrated";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { toggleWishlist } from "@/(app-routes)/(auth)/action";
import type { Product } from "@/(app-routes)/products/model";
import { cn } from "@/lib/utils/utils";
import { PantryImage } from "../shared/PantryImage";
import {
	discountPercent,
	packOptions,
	primaryImage,
	sellingPrice,
	stockLine,
} from "../lib";
import "../pantry.css";

/**
 * Neutral local placeholder for the CART LINE payload only — the cart drawer is
 * shared code that needs a URL string. Everything rendered inside this card
 * goes through PantryImage's own stone plate, so no remote placeholder service
 * is ever contacted.
 */
const CART_LINE_PLACEHOLDER = "/placeholder.svg";

/**
 * A good on the shelf.
 *
 * The photograph is the whole argument in this world, so it takes the top of
 * the tile edge to edge in a fixed square and carries at most ONE mark: the
 * honey-amber discount chip, and only when the backend returned a real
 * reduction. No "new", no rating, no badge wall — amber means money off here
 * and nothing else.
 *
 * Under it: the name in the pantry serif (single weight, so emphasis is size),
 * the pack-size count when the good is sold in several weights, the price as
 * the heaviest thing in the tile, and the real stock number when the backend
 * gives one. Out of stock is printed ON the goods as the world's diagonal
 * hatch rather than greyed away, and the action disables.
 *
 * The tile is one link target (a stretched overlay anchor) to the product page
 * — which is where this world's cash-on-delivery order form lives. The single
 * thumb-sized action sits above that overlay, never nested inside it.
 */
export function PantryProductCard({ product }: { product: Product }) {
	const { t } = useTranslation();
	const router = useRouter();
	const { addToCart } = useCart();
	const wishlistEnabled = useFeature("wishlist");

	const [userProfile] = useAtom(miniProfileAtom);
	const [wishlistIds, setWishlistIds] = useAtom(wishlistAtom);
	const [isWishlistLoading, setIsWishlistLoading] = useState(false);
	// Wishlist ids are localStorage-backed and empty on the server; hold the
	// server value until mount so the first client render matches SSR.
	const isHydrated = useHydrated();
	const isWishlisted = isHydrated && wishlistIds.includes(product.id);

	const href = ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id);
	const off = discountPercent(product);
	const now = sellingPrice(product);
	const packs = packOptions(product);
	const stock = stockLine(product);
	const isOutOfStock = !(product.stock > 0);

	const cartLineImage =
		product.thumbnail_image && product.thumbnail_image.trim() !== ""
			? product.thumbnail_image
			: CART_LINE_PLACEHOLDER;

	/**
	 * A multi-weight good cannot honestly be added blind from a shelf: 500g and
	 * 1kg are different orders at different prices. Those tiles send the shopper
	 * to the product page to pick a pack; single-pack goods go straight in the
	 * bag from here.
	 */
	const handlePrimaryAction = () => {
		if (isOutOfStock) return;

		if (packs.length > 0) {
			router.push(href);
			return;
		}

		// Exactly zero or one variant here (packOptions() collapses below two).
		const variant = product.variants?.length === 1 ? product.variants[0] : null;
		const price = variant ? sellingPriceOfVariant(variant) : now;
		const stockForLine = variant ? variant.stock : product.stock;

		if (stockForLine <= 0) {
			toast.error(t("products.outOfStock"));
			return;
		}

		addToCart({
			id: product.id,
			name: variant
				? `${product.name} - ${variant.combination_text}`
				: product.name,
			price,
			image: cartLineImage,
			variant_id: variant?.id,
			stock: stockForLine,
			tax: product.tax ? parseFloat(product.tax) : 0,
			tax_type: product.tax_type || "exclude",
		});
		toast.success(t("pantry.addedToBag", "ব্যাগে যোগ হয়েছে"), {
			description: product.name,
		});
	};

	const handleToggleWishlist = async () => {
		if (!userProfile) {
			toast.error(t("productCard.loginRequired"));
			router.push(
				`/login?redirect=${encodeURIComponent(window.location.pathname)}`,
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
						: [...wishlistIds, product.id],
				);
				toast.success(
					isWishlisted
						? t("productCard.wishlistRemoved")
						: t("productCard.wishlistAdded"),
				);
			} else {
				toast.error(response.message || t("productCard.wishlistUpdateFailed"));
			}
		} catch {
			toast.error(t("productCard.wishlistUpdateFailed"));
		} finally {
			setIsWishlistLoading(false);
		}
	};

	return (
		<article className="group relative flex h-full flex-col">
			{/* The whole tile is the link. It carries the accessible name, so the
			    heading below stays plain text and the action button is a sibling
			    rather than a control nested in an anchor. */}
			<Link
				href={href}
				className="ring-warm-focus absolute inset-0 z-10 rounded-lg"
			>
				<span className="sr-only">{product.name}</span>
			</Link>

			{/* The photograph. Fixed square so a shelf of jars lines up, and the
			    stone plate takes the same box when a photograph is missing. */}
			<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-warm-sm">
				<PantryImage
					src={primaryImage(product)}
					alt={product.name}
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
					className={cn(
						"object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]",
						isOutOfStock && "opacity-90",
					)}
				/>

				{/* Out of stock is printed on the goods, in the world's material —
				    the hatch and nothing else. The words are announced once, on the
				    disabled action below; a filled green plate over the photograph
				    would read as a call to action on a shelf of unavailable goods. */}
				{isOutOfStock && (
					<span className="pn-hatch absolute inset-0" aria-hidden="true" />
				)}

				{/* The only mark allowed over a photograph, and only for a real,
				    backend-backed reduction. */}
				{off !== null && !isOutOfStock && (
					<span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold tabular-nums text-accent-foreground">
						{t("pantry.percentOff", "{{pct}}% ছাড়", { pct: off })}
					</span>
				)}

				{wishlistEnabled && (
					<button
						type="button"
						onClick={handleToggleWishlist}
						disabled={isWishlistLoading}
						aria-label={t("pantry.wishlist", "পছন্দের তালিকা")}
						aria-pressed={isWishlisted}
						className={cn(
							"ring-warm-focus absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-lg bg-background/95 shadow-warm-sm transition-colors disabled:opacity-60",
							isWishlisted
								? "text-primary"
								: "text-muted-foreground hover:text-primary",
						)}
					>
						{isWishlistLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
						) : (
							<Heart
								className={cn("h-4 w-4", isWishlisted && "fill-current")}
								aria-hidden="true"
							/>
						)}
					</button>
				)}
			</div>

			<div className="flex flex-1 flex-col gap-1.5 pt-3">
				{/* Tiro Bangla has one weight — never bold, scale carries it. */}
				<h3 className="line-clamp-2 break-words font-display text-base leading-snug text-foreground transition-colors group-hover:text-primary md:text-lg">
					{product.name}
				</h3>

				{/* The choice exists before you tap: say how many weights there are. */}
				{packs.length > 0 && (
					<p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
						<Package className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
						{t("pantry.packCount", {
							defaultValue: "{{count}}টি প্যাক সাইজ",
							count: packs.length,
						})}
					</p>
				)}

				<div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
					<span className="text-lg font-bold tabular-nums text-primary md:text-xl">
						<Price amount={now} />
					</span>
					{off !== null && (
						<span className="text-sm text-muted-foreground line-through tabular-nums">
							<Price amount={product.price} />
						</span>
					)}
				</div>

				{/* A real number from the backend, or nothing at all. */}
				{stock && (
					<p
						className={cn(
							"text-xs tabular-nums",
							stock.low
								? "font-semibold text-foreground"
								: "text-muted-foreground",
						)}
					>
						{stock.low
							? t("pantry.stockLeft", {
									defaultValue: "মাত্র {{count}}টি বাকি",
									count: stock.count,
								})
							: t("pantry.stockCount", {
									defaultValue: "স্টকে {{count}}টি আছে",
									count: stock.count,
								})}
					</p>
				)}

				{/* One action, thumb-sized, above the tile's link overlay. */}
				<div className="mt-auto pt-3">
					<button
						type="button"
						onClick={handlePrimaryAction}
						disabled={isOutOfStock}
						className="pn-pack ring-warm-focus relative z-20 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
					>
						{isOutOfStock ? (
							t("pantry.stockFinished", "স্টক শেষ")
						) : packs.length > 0 ? (
							<>
								{t("pantry.choosePack", "প্যাক বেছে নিন")}
								<ChevronRight className="h-4 w-4" aria-hidden="true" />
							</>
						) : (
							<>
								<ShoppingBag className="h-4 w-4" aria-hidden="true" />
								{t("pantry.addToBag", "ব্যাগে রাখুন")}
							</>
						)}
					</button>
				</div>
			</div>
		</article>
	);
}

/** The price a single variant actually charges today. */
function sellingPriceOfVariant(variant: {
	price: number;
	discount_price: number;
}): number {
	return variant.discount_price > 0 && variant.discount_price < variant.price
		? variant.discount_price
		: variant.price;
}
