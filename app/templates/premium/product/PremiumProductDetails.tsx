"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import { Heart, Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import Price from "@/components/shared/Price";
import { toast } from "@/components/shared/ui/sonner";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/shared/ui/accordion";
import { useFeature } from "@/components/shared/providers/variant-provider";
import { ProductReviews } from "@/components/product/product-details";
import { ComboOfferCard } from "@/components/home/ComboPromo";
import { useCart } from "@/contexts/CartContext";
import { buyNowCheckoutHref } from "@/lib/utils/buy-now";
import { INTL_SHIPPING } from "@/lib/constants/delivery";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { toggleWishlist } from "@/(app-routes)/(auth)/action";
import {
	trackUnifiedAddToCart,
	trackUnifiedViewProduct,
} from "@/lib/analytics";
import { cn } from "@/lib/utils/utils";
import type { Product, ProductVariant } from "@/(app-routes)/products/model";
import type { ProductDetailsLayoutProps } from "@/templates/types";
import {
	deriveSpecs,
	estimatedDeliveryDate,
	lotLine,
	SHIPPING_WINDOW_DAYS,
} from "../lib";
import { PremiumGallery } from "./PremiumGallery";
import { PremiumVariantKeys } from "./PremiumVariantKeys";
import { PremiumProductCard } from "./PremiumProductCard";
import "../premium.css";

/**
 * Premium PDP — the boxed specimen. Gallery with exploded callouts on the
 * left; ONE pristine label panel (the clean ticket on the art) sticky on the
 * right, complete within the first desktop viewport: name, LOT provenance
 * line, price, pressed variant keys, delivery transparency, and one gold
 * add-to-cart with the seal press. Accordion blocks below the fold; a sticky
 * mobile buy bar takes over when the panel scrolls away.
 */
export function PremiumProductDetails({
	product,
	combos,
}: ProductDetailsLayoutProps) {
	const { t, i18n } = useTranslation();
	const router = useRouter();
	const { items, addToCart } = useCart();
	const reviewsEnabled = useFeature("reviews");
	const wishlistEnabled = useFeature("wishlist");
	const [userProfile] = useAtom(miniProfileAtom);
	const [wishlistIds, setWishlistIds] = useAtom(wishlistAtom);
	const [isWishlistLoading, setIsWishlistLoading] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
	const [selectedVariant, setSelectedVariant] =
		useState<ProductVariant | null>(
			product.variants && product.variants.length > 0
				? product.variants[0]
				: null
		);
	// The seal press: one authored moment on add-to-cart.
	const [sealed, setSealed] = useState(false);
	const sealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	// Sticky mobile bar appears when the label panel leaves the viewport.
	const panelRef = useRef<HTMLDivElement>(null);
	const [panelVisible, setPanelVisible] = useState(true);

	const isWishlisted = wishlistIds.includes(product.id);
	const price = selectedVariant
		? Number(selectedVariant.discount_price)
		: Number(product.discounted_price);
	const originalPrice = selectedVariant
		? Number(selectedVariant.price)
		: Number(product.price);
	const stock = selectedVariant ? selectedVariant.stock : product.stock;

	useEffect(() => {
		trackUnifiedViewProduct(
			product.id.toString(),
			product.name,
			price,
			product.category?.name
		);
		// Track once on mount only.
	}, [product.id]);

	useEffect(() => {
		const node = panelRef.current;
		if (!node) return;
		const observer = new IntersectionObserver(
			(entries) => setPanelVisible(entries[0]?.isIntersecting ?? true),
			{ threshold: 0 }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	useEffect(
		() => () => {
			if (sealTimer.current) clearTimeout(sealTimer.current);
		},
		[]
	);

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
	const soldOut = availableStock <= 0;

	const specs = useMemo(() => deriveSpecs(product), [product]);
	const colorImage = selectedColorId
		? product.colors_image?.find((ci) => ci.id === selectedColorId)?.photo
		: undefined;
	const mainImage =
		(product.gallery_images && product.gallery_images[0]) ||
		product.thumbnail_image ||
		"";

	const doAddToCart = (): { id: number; variant_id?: number } | null => {
		if (soldOut || quantity > availableStock) {
			toast.error(t("premium.outOfStock", "This lot is sold out"));
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
		if (!doAddToCart()) return;
		setSealed(false);
		// Restart the seal flash even on rapid re-presses.
		requestAnimationFrame(() => setSealed(true));
		if (sealTimer.current) clearTimeout(sealTimer.current);
		sealTimer.current = setTimeout(() => setSealed(false), 600);
		toast.success(t("premium.addedToCart", "Added to your order"), {
			description: product.name,
		});
	};

	const handleBuyNow = () => {
		const line = doAddToCart();
		if (line) {
			router.push(buyNowCheckoutHref(line.id, line.variant_id, quantity));
		}
	};

	const handleToggleWishlist = async () => {
		if (!userProfile) {
			toast.error(t("premium.loginRequired", "Sign in to keep a wishlist"));
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
						? t("premium.wishlistRemoved", "Removed from wishlist")
						: t("premium.wishlistAdded", "Saved to wishlist")
				);
			} else {
				toast.error(
					response.message ||
						t("premium.wishlistFailed", "Could not update wishlist")
				);
			}
		} catch {
			toast.error(t("premium.wishlistFailed", "Could not update wishlist"));
		} finally {
			setIsWishlistLoading(false);
		}
	};

	const estimated = estimatedDeliveryDate(i18n.language);

	const ctaLabel = soldOut
		? t("premium.soldOut", "Sold out")
		: t("premium.addToCart", "Add to cart");

	return (
		// Reserved bottom padding keeps the sticky mobile bar from causing CLS.
		<main className="bg-background pb-24 text-foreground lg:pb-0">
			<div className="container mx-auto py-8 lg:py-12">
				<div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
					{/* Specimen: photography + exploded callouts + numbered specs */}
					<div className="lg:col-span-7">
						<PremiumGallery
							productName={product.name}
							thumbnailImage={product.thumbnail_image}
							galleryImages={product.gallery_images}
							colorImage={colorImage}
							specs={specs}
						/>
						{specs.length > 0 && (
							<ol
								className="mt-6 space-y-2"
								aria-label={t("premium.specs", "Specifications")}
							>
								{specs.map((spec, index) => (
									<li
										key={spec.label}
										className="flex items-baseline gap-3 border-b border-border/30 pb-2 text-sm"
									>
										<span className="w-5 shrink-0 text-muted-foreground tabular-nums">
											{index + 1}
										</span>
										<span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
											{spec.label}
										</span>
										<span className="ml-auto text-right text-foreground">
											{spec.value}
										</span>
									</li>
								))}
							</ol>
						)}
					</div>

					{/* The label panel — one pristine ticket on the art. */}
					<div className="lg:col-span-5">
						<div
							ref={panelRef}
							className="premium-panel-rise shadow-warm-lg lg:sticky lg:top-6 bg-card p-6 text-card-foreground md:p-8"
						>
							<h1 className="font-display text-3xl leading-[1.05] tracking-tight md:text-4xl">
								{product.name}
							</h1>
							<p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-card-foreground/70">
								{lotLine(product)}
							</p>

							<div className="mt-5 flex items-baseline gap-3">
								<span className="text-2xl tabular-nums">
									<Price amount={price} />
								</span>
								{originalPrice > price && (
									<span className="text-sm text-card-foreground/60 line-through tabular-nums">
										<Price amount={originalPrice} />
									</span>
								)}
							</div>

							{product.variants && product.variants.length > 0 && (
								<div className="mt-6">
									<PremiumVariantKeys
										product={product}
										onVariantChange={(variant) => {
											setSelectedVariant(variant);
											setQuantity(1);
										}}
										onColorChange={(_color, colorId) =>
											setSelectedColorId(colorId ?? null)
										}
									/>
								</div>
							)}

							{/* Quantity keys */}
							<div className="mt-6 flex items-center gap-3">
								<span className="text-[11px] uppercase tracking-[0.16em] text-card-foreground/70">
									{t("premium.quantity", "Quantity")}
								</span>
								<div className="flex items-center">
									<button
										type="button"
										onClick={() => setQuantity((q) => Math.max(1, q - 1))}
										disabled={quantity <= 1}
										className="premium-key ring-warm-focus flex h-9 w-9 items-center justify-center"
										aria-label={t("premium.decrease", "Decrease quantity")}
									>
										<Minus className="h-3.5 w-3.5" />
									</button>
									<span
										className="w-10 text-center text-sm tabular-nums"
										aria-live="polite"
									>
										{quantity}
									</span>
									<button
										type="button"
										onClick={() =>
											setQuantity((q) => Math.min(availableStock, q + 1))
										}
										disabled={quantity >= availableStock || soldOut}
										className="premium-key ring-warm-focus flex h-9 w-9 items-center justify-center"
										aria-label={t("premium.increase", "Increase quantity")}
									>
										<Plus className="h-3.5 w-3.5" />
									</button>
								</div>
								{!soldOut && availableStock <= 5 && (
									<span className="text-xs text-accent">
										{t("premium.fewLeft", "Only {{count}} left", {
											count: availableStock,
										})}
									</span>
								)}
							</div>

							{/* Delivery transparency, printed on the label before the CTA */}
							<div className="mt-6 space-y-1.5 border-t border-card-foreground/15 pt-4 text-sm text-card-foreground/80">
								<p className="tabular-nums">
									{t("premium.flatShipping", "Shipping")}{" "}
									<Price amount={INTL_SHIPPING.flat} /> —{" "}
									{t("premium.freeOver", "free over")}{" "}
									<Price amount={INTL_SHIPPING.freeOver} />
								</p>
								<p suppressHydrationWarning>
									{t("premium.estimated", "Estimated")}: {estimated}
								</p>
							</div>

							{/* The gold action + express lane. Guest-first: no account copy. */}
							<div className="mt-5 flex items-stretch gap-2">
								<button
									type="button"
									onClick={handleAddToCart}
									disabled={soldOut}
									data-sealed={sealed}
									className="premium-seal-press ring-warm-focus h-12 flex-1 bg-primary text-sm font-medium uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{ctaLabel}
								</button>
								{wishlistEnabled && (
									<button
										type="button"
										onClick={handleToggleWishlist}
										disabled={isWishlistLoading}
										className="premium-key ring-warm-focus flex h-12 w-12 items-center justify-center disabled:opacity-60"
										aria-label={t("premium.wishlist", "Wishlist")}
										aria-pressed={isWishlisted}
									>
										<Heart
											className={cn(
												"h-5 w-5",
												isWishlisted && "fill-accent text-accent"
											)}
										/>
									</button>
								)}
							</div>
							{!soldOut && (
								<button
									type="button"
									onClick={handleBuyNow}
									className="ring-warm-focus mt-3 w-full text-center text-sm text-card-foreground/80 underline decoration-card-foreground/40 underline-offset-4 transition-colors hover:text-card-foreground"
								>
									{t("premium.buyNow", "Buy now — express checkout")}
								</button>
							)}
						</div>

						{/* Combo offers anchored to this product — compact link cards */}
						{combos && combos.length > 0 && (
							<div className="mt-6 space-y-2">
								{combos.map((combo) => (
									<ComboOfferCard key={combo.id} combo={combo} />
								))}
							</div>
						)}
					</div>
				</div>

				{/* Below the fold: accordion blocks on the lacquer */}
				<div className="mx-auto mt-16 max-w-3xl lg:mt-24">
					<Accordion type="single" collapsible className="w-full">
						{product.description && (
							<AccordionItem value="description" className="border-border/40">
								<AccordionTrigger className="ring-warm-focus font-display text-lg tracking-tight hover:no-underline">
									{t("premium.materials", "Materials & description")}
								</AccordionTrigger>
								<AccordionContent>
									<div
										className="max-w-[70ch] text-sm leading-relaxed text-muted-foreground [&_a]:underline"
										dangerouslySetInnerHTML={{
											__html: product.description,
										}}
									/>
								</AccordionContent>
							</AccordionItem>
						)}

						<AccordionItem value="shipping" className="border-border/40">
							<AccordionTrigger className="ring-warm-focus font-display text-lg tracking-tight hover:no-underline">
								{t("premium.shippingReturns", "Shipping & delivery")}
							</AccordionTrigger>
							<AccordionContent>
								<ul className="max-w-[70ch] space-y-2 text-sm leading-relaxed text-muted-foreground">
									<li className="tabular-nums">
										{t("premium.flatShipping", "Shipping")}{" "}
										<Price amount={INTL_SHIPPING.flat} /> —{" "}
										{t("premium.freeOver", "free over")}{" "}
										<Price amount={INTL_SHIPPING.freeOver} />
									</li>
									<li suppressHydrationWarning>
										{t(
											"premium.shippingWindow",
											"Dispatched orders typically arrive within {{days}} days"
										, { days: SHIPPING_WINDOW_DAYS })}{" "}
										— {t("premium.estimated", "Estimated")}: {estimated}
									</li>
								</ul>
							</AccordionContent>
						</AccordionItem>

						<AccordionItem value="provenance" className="border-border/40">
							<AccordionTrigger className="ring-warm-focus font-display text-lg tracking-tight hover:no-underline">
								{t("premium.provenance", "Provenance")}
							</AccordionTrigger>
							<AccordionContent>
								<dl className="max-w-[70ch] space-y-2 text-sm">
									<div className="flex items-baseline justify-between gap-4">
										<dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
											{t("premium.lot", "Lot")}
										</dt>
										<dd className="text-foreground">{lotLine(product)}</dd>
									</div>
									{product.sku && (
										<div className="flex items-baseline justify-between gap-4">
											<dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
												SKU
											</dt>
											<dd className="text-foreground">{product.sku}</dd>
										</div>
									)}
									{product.brand && (
										<div className="flex items-baseline justify-between gap-4">
											<dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
												{t("premium.house", "House")}
											</dt>
											<dd className="text-foreground">{product.brand}</dd>
										</div>
									)}
								</dl>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>

				{reviewsEnabled && product.total_reviews > 0 && (
					<div className="mx-auto mt-16 max-w-3xl">
						<ProductReviews
							averageRating={product.average_rating}
							totalReviews={product.total_reviews}
							ratingCounts={product.rating_counts}
							reviews={product.reviews}
						/>
					</div>
				)}

				{product.related_products &&
					product.related_products.length > 0 && (
						<section className="mt-20 lg:mt-28">
							<div className="premium-rule-flank mb-8">
								<h2 className="font-display text-2xl tracking-tight md:text-3xl">
									{t("premium.fromTheSameShelf", "From the same shelf")}
								</h2>
							</div>
							<div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
								{(product.related_products as Product[])
									.slice(0, 4)
									.map((related) => (
										<PremiumProductCard
											key={related.id}
											product={related}
										/>
									))}
							</div>
						</section>
					)}
			</div>

			{/* Sticky mobile buy bar — synced to the panel state, no CLS. */}
			<div
				className={cn(
					"fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-card text-card-foreground lg:hidden",
					panelVisible ? "invisible" : "visible"
				)}
				aria-hidden={panelVisible}
			>
				<div className="container mx-auto flex h-16 items-center gap-3">
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm">
							{product.name}
							{selectedVariant?.combination_text
								? ` — ${selectedVariant.combination_text}`
								: ""}
						</p>
						<p className="text-sm tabular-nums">
							<Price amount={price * quantity} />
							{quantity > 1 && (
								<span className="ml-1 text-xs text-card-foreground/60">
									× {quantity}
								</span>
							)}
						</p>
					</div>
					<button
						type="button"
						onClick={handleAddToCart}
						disabled={soldOut}
						tabIndex={panelVisible ? -1 : 0}
						className="premium-seal-press ring-warm-focus h-11 shrink-0 bg-primary px-6 text-xs font-medium uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-60"
					>
						{ctaLabel}
					</button>
				</div>
			</div>
		</main>
	);
}
