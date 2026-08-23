"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import { ChevronRight, Heart, Share2 } from "lucide-react";
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
import { toggleWishlist } from "@/(app-routes)/(auth)/action";
import { useFeature } from "@/components/shared/providers/variant-provider";
import {
	trackUnifiedAddToCart,
	trackUnifiedViewProduct,
} from "@/lib/analytics";
import { trackShare } from "@/lib/analytics/tracking";
import {
	QuantitySelector,
	ProductDetailsTabs,
} from "@/components/product/product-details";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";
import { ComboOfferCard } from "@/components/home/ComboPromo";
import type { Product, ProductVariant } from "@/(app-routes)/products/model";
import type { ProductDetailsLayoutProps } from "@/templates/types";
import { cn } from "@/lib/utils/utils";
import { itemNo } from "../_data/catalogue";
import { GlobalSectionTitle } from "../home/GlobalSectionTitle";
import { GlobalDeliveryInfo } from "./GlobalDeliveryInfo";
import { GlobalImageGallery } from "./GlobalImageGallery";
import { GlobalAvailabilityLine } from "./GlobalAvailabilityLine";
import { GlobalRatingStars } from "./GlobalRatingStars";
import { GlobalProductsGrid } from "./GlobalProductsGrid";
import { GlobalStickyBuyBar } from "./GlobalStickyBuyBar";
import "../global.css";

/**
 * The catalogue plate, full page. Item number and rating printed beside the
 * price; variant choices as buttons; the availability course and the
 * delivery-cost table printed BEFORE the buy actions; guest-first (no
 * sign-in copy in the buy path). A sticky mobile buy bar mirrors the same
 * state once the buy box scrolls away.
 */
export function GlobalProductDetails({
	product,
	combos,
}: ProductDetailsLayoutProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const { items, addToCart } = useCart();
	const [userProfile] = useAtom(miniProfileAtom);
	const [wishlistIds, setWishlistIds] = useAtom(wishlistAtom);
	const [isWishlistLoading, setIsWishlistLoading] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
	const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
		product.variants && product.variants.length > 0 ? product.variants[0] : null
	);
	const reviewsEnabled = useFeature("reviews");

	// Sticky-bar visibility: watch the buy box leave the viewport.
	const buyBoxRef = useRef<HTMLDivElement>(null);
	const [buyBoxVisible, setBuyBoxVisible] = useState(true);
	useEffect(() => {
		const node = buyBoxRef.current;
		if (!node || typeof IntersectionObserver === "undefined") return;
		const observer = new IntersectionObserver(
			(entries) => setBuyBoxVisible(entries[0]?.isIntersecting ?? true),
			{ rootMargin: "-64px 0px 0px 0px" }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	const isWishlisted = wishlistIds.includes(product.id);
	const price = selectedVariant
		? parseFloat(selectedVariant.discount_price.toString())
		: parseFloat(product.discounted_price.toString());
	const originalPrice = selectedVariant
		? parseFloat(selectedVariant.price.toString())
		: parseFloat(product.price.toString());
	const stock = selectedVariant ? selectedVariant.stock : product.stock;
	const saveAmount = originalPrice > price ? originalPrice - price : 0;
	const savePercent =
		saveAmount > 0 && originalPrice > 0
			? Math.round((saveAmount / originalPrice) * 100)
			: 0;

	useEffect(() => {
		trackUnifiedViewProduct(
			product.id.toString(),
			product.name,
			price,
			product.category?.name
		);
		// Track once on mount only.
	}, [product.id]);

	const reservedQuantity = useMemo(
		() =>
			items
				.filter(
					(item) =>
						item.id === product.id &&
						(selectedVariant
							? item.variant_id === selectedVariant.id
							: !item.variant_id)
				)
				.reduce((sum, item) => sum + item.quantity, 0),
		[items, product.id, selectedVariant]
	);
	const availableStock = Math.max(stock - reservedQuantity, 0);
	const totalPrice = price * quantity;

	const fallbackImage =
		"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80";
	const mainImage =
		(product.gallery_images && product.gallery_images[0]) ||
		product.thumbnail_image ||
		fallbackImage;

	const doAddToCart = (): { id: number; variant_id?: number } | null => {
		if (availableStock <= 0 || quantity > availableStock) {
			toast.error(t("products.outOfStock"));
			return null;
		}
		addToCart({
			id: product.id,
			name: selectedVariant
				? `${product.name} - ${selectedVariant.combination_text}`
				: product.name,
			price,
			image: mainImage,
			variant_id: selectedVariant?.id,
			stock,
			quantity,
			tax: product.tax ? parseFloat(product.tax) : 0,
			tax_type: product.tax_type || "exclude",
		});
		trackUnifiedAddToCart(product.id.toString(), product.name, price, quantity);
		return { id: product.id, variant_id: selectedVariant?.id };
	};

	const handleAddToCart = () => {
		if (doAddToCart()) {
			toast.success(t("global.addToCart"), {
				description: `${product.name} ${t("productCard.addedToCart")}`,
			});
		}
	};

	const handleBuyNow = () => {
		const line = doAddToCart();
		if (line) {
			// Pass the Buy Now quantity so checkout can display/charge just that
			// amount even if it merged into a pre-existing cart line.
			router.push(buyNowCheckoutHref(line.id, line.variant_id, quantity));
		}
	};

	const handleToggleWishlist = async () => {
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
				toast.error(response.message || t("productCard.wishlistUpdateFailed"));
			}
		} catch {
			toast.error(t("productCard.wishlistUpdateFailed"));
		} finally {
			setIsWishlistLoading(false);
		}
	};

	const handleShare = async () => {
		const url = typeof window !== "undefined" ? window.location.href : "";
		try {
			if (navigator.share) {
				await navigator.share({ title: product.name, url });
				// Only after the sheet resolves — a dismissal throws and must not
				// count as a share.
				void trackShare("web-share", url);
			} else {
				await navigator.clipboard.writeText(url);
				void trackShare("clipboard", url);
				toast.success(t("global.linkCopied"));
			}
		} catch {
			/* user dismissed the share sheet — no action needed */
		}
	};

	const colorImage = selectedColorId
		? product.colors_image?.find((ci) => ci.id === selectedColorId)?.photo
		: undefined;

	const squareIconButton = (pressed?: boolean) =>
		cn(
			"ring-warm-focus flex h-12 w-12 items-center justify-center rounded-sm border transition-colors disabled:opacity-50",
			pressed
				? "border-foreground bg-foreground text-background"
				: "border-border text-foreground hover:border-foreground"
		);

	return (
		/* Constant bottom padding reserves room for the sticky bar — no CLS. */
		<main className="container mx-auto pb-28 pt-6 md:pb-6">
			<nav
				className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground"
				aria-label="Breadcrumb"
			>
				<Link
					href="/"
					className="ring-warm-focus rounded-sm hover:text-foreground hover:underline"
				>
					{t("global.nav.home")}
				</Link>
				<ChevronRight className="h-4 w-4" aria-hidden="true" />
				{product.category?.name && (
					<>
						<Link
							href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(product.category.id)}
							className="ring-warm-focus rounded-sm hover:text-foreground hover:underline"
						>
							{product.category.name}
						</Link>
						<ChevronRight className="h-4 w-4" aria-hidden="true" />
					</>
				)}
				<span className="line-clamp-1 font-medium text-foreground">
					{product.name}
				</span>
			</nav>

			<div className="grid gap-8 border-y border-border py-6 md:py-8 lg:grid-cols-2 lg:gap-12">
				<GlobalImageGallery
					productId={product.id}
					productName={product.name}
					thumbnailImage={product.thumbnail_image}
					galleryImages={product.gallery_images}
					colorImage={colorImage}
				/>

				<div className="space-y-5">
					{/* The plate header line */}
					<div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs uppercase tracking-[0.08em] text-muted-foreground">
						<span className="tabular-nums">
							{t("global.catalogue.no", "No.")} {itemNo(product.id)}
						</span>
						{product.sku && (
							<span className="tabular-nums">
								{t("global.sku")}: {product.sku}
							</span>
						)}
					</div>

					<h1 className="font-display text-3xl font-black leading-tight tracking-tight text-balance md:text-4xl">
						{product.name}
					</h1>

					{/* Price with the rating summary printed beside it */}
					<div className="space-y-1.5 border-b border-border pb-4">
						<div className="flex flex-wrap items-baseline gap-3">
							<span className="text-3xl font-black tabular-nums">
								<Price amount={price} />
							</span>
							{saveAmount > 0 && (
								<>
									<span className="text-muted-foreground line-through tabular-nums">
										<Price amount={originalPrice} />
									</span>
									<span className="text-sm font-black text-accent tabular-nums">
										−{savePercent}% · {t("global.save")}{" "}
										<Price amount={saveAmount} />
									</span>
								</>
							)}
						</div>
						{reviewsEnabled && (
							<GlobalRatingStars
								rating={product.average_rating}
								count={product.total_reviews}
							/>
						)}
					</div>

					{/* Variant choices — buttons, never dropdowns */}
					{product.variants && product.variants.length > 0 && (
						<ProductVariantSelector
							product={product}
							onVariantChange={(variant) => {
								setSelectedVariant(variant);
								setQuantity(1);
							}}
							onColorChange={(_color, colorId) => {
								setSelectedColorId(colorId || null);
							}}
						/>
					)}

					{/* Combo offers anchored to this product — link to /combo/[slug] */}
					{combos && combos.length > 0 && (
						<div className="space-y-2">
							{combos.map((combo) => (
								<ComboOfferCard key={combo.id} combo={combo} />
							))}
						</div>
					)}

					{/* Printed availability course */}
					<GlobalAvailabilityLine
						stock={availableStock}
						className="text-sm [&>span:first-child]:text-sm"
					/>

					{/* Delivery costs printed BEFORE the buy actions */}
					<GlobalDeliveryInfo />

					<div ref={buyBoxRef} className="space-y-4">
						<div className="flex flex-wrap items-center gap-4">
							<QuantitySelector
								quantity={quantity}
								onQuantityChange={setQuantity}
								stock={availableStock}
							/>
							<p className="text-sm text-muted-foreground">
								{t("global.totalPrice")}:{" "}
								<span className="text-lg font-black text-foreground tabular-nums">
									<Price amount={totalPrice} />
								</span>
							</p>
						</div>

						<div className="flex flex-wrap items-center gap-3">
							<button
								type="button"
								onClick={handleBuyNow}
								disabled={availableStock <= 0}
								className="ring-warm-focus rounded-sm bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
							>
								{t("global.buyNow")}
							</button>
							<button
								type="button"
								onClick={handleAddToCart}
								disabled={availableStock <= 0}
								className="ring-warm-focus rounded-sm border border-primary px-8 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
							>
								{t("global.addToCart")}
							</button>
							<button
								type="button"
								onClick={handleToggleWishlist}
								disabled={isWishlistLoading}
								aria-label={t("global.wishlist")}
								aria-pressed={isWishlisted}
								className={squareIconButton(isWishlisted)}
							>
								<Heart
									className={cn("h-5 w-5", isWishlisted && "fill-current")}
								/>
							</button>
							<button
								type="button"
								onClick={handleShare}
								aria-label={t("global.share")}
								className={squareIconButton()}
							>
								<Share2 className="h-5 w-5" />
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-8">
				<ProductDetailsTabs product={product} />
			</div>

			{product.related_products && product.related_products.length > 0 && (
				<section className="mt-12">
					<GlobalSectionTitle title={t("global.relatedProducts")} />
					<GlobalProductsGrid
						products={product.related_products as Product[]}
					/>
				</section>
			)}

			<GlobalStickyBuyBar
				visible={!buyBoxVisible}
				productName={product.name}
				variantText={selectedVariant?.combination_text ?? null}
				price={price}
				inStock={availableStock > 0}
				onAddToCart={handleAddToCart}
			/>
		</main>
	);
}
