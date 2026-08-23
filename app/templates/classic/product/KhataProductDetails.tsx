"use client";

import "../classic.css";

import { useEffect, useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { BadgeCheck, Heart, Loader2, Phone, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { toast } from "@/components/shared/ui/sonner";
import Price from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { buyNowCheckoutHref } from "@/lib/utils/buy-now";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { toggleWishlist } from "@/(app-routes)/(auth)/action";
import {
	trackUnifiedAddToCart,
	trackUnifiedViewProduct,
} from "@/lib/analytics";
import {
	QuantitySelector,
	ProductDeliveryInfo,
	ProductDetailsTabs,
} from "@/components/product/product-details";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";
import type { Product, ProductVariant } from "@/(app-routes)/products/model";
import type { ProductDetailsLayoutProps } from "@/templates/types";
import { KhataSectionTitle } from "../home/KhataSectionTitle";
import { KhataComboLedger } from "../home/KhataComboLedger";
import { KhataProductCard } from "./KhataProductCard";
import { KhataGallery } from "./KhataGallery";
import { cn } from "@/lib/utils/utils";

const FALLBACK_IMAGE =
	"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&auto=format";

/**
 * The khata PDP: a long scroll staged in hard ledger bands — photograph,
 * proof, order — each boundary a printed double rule. Delivery fees, COD and
 * the confirming-call line are printed BEFORE the order button; the order
 * action repeats at the bottom of the scroll in the thumb zone. Red belongs
 * to the order zone alone.
 */
export function KhataProductDetails({
	product,
	combos,
}: ProductDetailsLayoutProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const { items, addToCart } = useCart();
	const settings = useAtomValue(businessSettingsAtom);
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
	// The one authored motion on this surface: the "written into the ledger"
	// stamp settles after a successful add. Keyed so repeat adds re-stamp.
	const [stampKey, setStampKey] = useState(0);

	const isWishlisted = wishlistIds.includes(product.id);
	const price = selectedVariant
		? parseFloat(selectedVariant.discount_price.toString())
		: parseFloat(product.discounted_price.toString());
	const originalPrice = selectedVariant
		? parseFloat(selectedVariant.price.toString())
		: parseFloat(product.price.toString());
	const stock = selectedVariant ? selectedVariant.stock : product.stock;
	const hasDiscount = originalPrice > price;

	useEffect(() => {
		trackUnifiedViewProduct(
			product.id.toString(),
			product.name,
			price,
			product.category?.name
		);
		// Track once on mount only.
	}, [product.id]);

	// Units of this product/variant already reserved in the cart.
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
	const isOutOfStock = availableStock <= 0;

	const mainImage =
		(product.gallery_images && product.gallery_images[0]) ||
		product.thumbnail_image ||
		FALLBACK_IMAGE;

	const doAddToCart = (): { id: number; variant_id?: number } | null => {
		if (isOutOfStock || quantity > availableStock) {
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
		trackUnifiedAddToCart(
			product.id.toString(),
			product.name,
			price,
			quantity
		);
		return { id: product.id, variant_id: selectedVariant?.id };
	};

	const handleAddToCart = () => {
		if (doAddToCart()) {
			setStampKey((k) => k + 1);
			toast.success(t("classic2.addedToBag", "খাতায় লেখা হলো"), {
				description: `${product.name} ${t("productCard.addedToCart")}`,
			});
		}
	};

	const handleOrderNow = () => {
		const line = doAddToCart();
		if (line) {
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

	const colorImage = selectedColorId
		? product.colors_image?.find((ci) => ci.id === selectedColorId)?.photo
		: undefined;

	/** The printed terms + order actions block; reused in the closing band. */
	const orderActions = (compact = false) => (
		<div className={cn("flex flex-wrap items-center gap-3")}>
			<button
				type="button"
				onClick={handleOrderNow}
				disabled={isOutOfStock}
				className={cn(
					"ring-warm-focus inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-bold text-primary-foreground shadow-warm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
					compact ? "flex-1 sm:flex-none" : "w-full sm:w-auto"
				)}
			>
				{t("classic2.orderNowCta", "এখনই অর্ডার করুন")}
			</button>
			<button
				type="button"
				onClick={handleAddToCart}
				disabled={isOutOfStock}
				className={cn(
					"ring-warm-focus inline-flex min-h-12 items-center justify-center rounded-md border border-accent/60 px-6 text-base font-bold text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent",
					compact ? "flex-1 sm:flex-none" : "w-full sm:w-auto"
				)}
			>
				{t("classic2.addToBag", "ব্যাগে রাখুন")}
			</button>
			{!compact && (
				<button
					type="button"
					onClick={handleToggleWishlist}
					disabled={isWishlistLoading}
					aria-label={t("classic2.wishlist", "পছন্দের তালিকা")}
					aria-pressed={isWishlisted}
					className={cn(
						"ring-warm-focus inline-flex h-12 w-12 items-center justify-center rounded-md border transition-colors disabled:opacity-60",
						isWishlisted
							? "border-accent text-accent"
							: "text-muted-foreground hover:border-accent hover:text-accent"
					)}
				>
					{isWishlistLoading ? (
						<Loader2 className="h-5 w-5 animate-spin" aria-hidden />
					) : (
						<Heart
							className={cn(
								"h-5 w-5",
								isWishlisted && "fill-current"
							)}
							aria-hidden
						/>
					)}
				</button>
			)}
		</div>
	);

	return (
		<main className="container mx-auto pb-24 pt-6 md:pb-8">
			{/* Breadcrumb — one ledger line. */}
			<nav
				aria-label="Breadcrumb"
				className="mb-6 border-b border-dashed pb-3 text-sm"
			>
				<Link
					href="/"
					className="ring-warm-focus font-semibold text-accent underline-offset-4 hover:underline"
				>
					{t("classic2.home", "হোম")}
				</Link>
				<span className="mx-2 text-muted-foreground" aria-hidden>
					›
				</span>
				{product.category?.name && (
					<>
						<Link
							href={`/products?category_id=${product.category.id}`}
							className="ring-warm-focus text-accent underline-offset-4 hover:underline"
						>
							{product.category.name}
						</Link>
						<span className="mx-2 text-muted-foreground" aria-hidden>
							›
						</span>
					</>
				)}
				<span className="text-muted-foreground">{product.name}</span>
			</nav>

			{/* ============ BAND 1 — the photograph and the entry ============ */}
			<div className="khata-spine pl-5 md:pl-8">
				<div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
					<div className="rounded-md border bg-card p-3 shadow-warm-sm">
						<KhataGallery
							productName={product.name}
							thumbnailImage={product.thumbnail_image}
							galleryImages={product.gallery_images}
							colorImage={colorImage}
						/>
					</div>

					<div className="flex flex-col gap-5">
						<div>
							<h1 className="font-display text-3xl font-bold leading-tight text-balance md:text-4xl">
								{product.name}
							</h1>
							{(product.sku || product.brand) && (
								<p className="mt-2 text-sm text-muted-foreground">
									{product.sku && (
										<>
											{t("classic2.sku", "কোড")}:{" "}
											<span className="tabular-nums">
												{product.sku}
											</span>
										</>
									)}
									{product.sku && product.brand && " · "}
									{product.brand}
								</p>
							)}
						</div>

						{/* Price anchoring: current heavy in stamp red. */}
						<div className="flex flex-wrap items-baseline gap-x-3">
							<span
								className={cn(
									"font-display text-4xl font-bold tabular-nums text-primary md:text-5xl",
									isOutOfStock &&
										"khata-strike text-muted-foreground"
								)}
							>
								<Price amount={price} />
							</span>
							{hasDiscount && !isOutOfStock && (
								<span className="text-lg tabular-nums text-muted-foreground line-through">
									<Price amount={originalPrice} />
								</span>
							)}
							{hasDiscount && !isOutOfStock && (
								<span className="khata-tag inline-flex items-center rounded-sm border border-success/40 px-2 py-0.5 text-xs font-semibold text-success">
									{t("classic2.youSave", "সাশ্রয়")}{" "}
									<span className="ml-1 tabular-nums">
										<Price amount={originalPrice - price} />
									</span>
								</span>
							)}
						</div>

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

						<div className="flex flex-wrap items-center gap-4">
							<QuantitySelector
								quantity={quantity}
								onQuantityChange={setQuantity}
								stock={availableStock}
							/>
							<span
								className={cn(
									"khata-tag inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold",
									isOutOfStock
										? "border-foreground/30 text-muted-foreground"
										: "border-success/40 text-success"
								)}
							>
								{isOutOfStock
									? t("classic2.stockOut", "স্টক শেষ")
									: `${availableStock} ${t(
											"classic2.inStock",
											"টি স্টকে আছে"
										)}`}
							</span>
							{stampKey > 0 && (
								<span
									key={stampKey}
									className="khata-stamp-in inline-flex rotate-[-4deg] items-center rounded-sm border-2 border-primary px-2 py-0.5 text-xs font-bold uppercase text-primary"
								>
									{t("classic2.addedStamp", "লেখা হলো")}
								</span>
							)}
						</div>

						{/* Combo offers anchored to this product. */}
						{combos && combos.length > 0 && (
							<KhataComboLedger combos={combos} />
						)}

						{/* Delivery fees printed BEFORE the order button. */}
						<ProductDeliveryInfo />

						{/* The shop's terms — printed, then the stamp. */}
						<ul className="space-y-0 text-sm">
							<li className="flex items-center gap-2 border-b border-dashed py-2 font-semibold">
								<BadgeCheck
									className="h-4 w-4 shrink-0 text-success"
									aria-hidden
								/>
								{t(
									"classic2.codLong",
									"পণ্য হাতে পেয়ে টাকা দিন — ক্যাশ অন ডেলিভারি"
								)}
							</li>
							<li className="flex items-center gap-2 border-b border-dashed py-2 text-muted-foreground">
								<Truck className="h-4 w-4 shrink-0" aria-hidden />
								{t(
									"classic2.deliveryPromise",
									"ঢাকায় ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ২–৩ দিন"
								)}
							</li>
							<li className="flex items-center gap-2 border-b border-dashed py-2 text-muted-foreground">
								<Phone className="h-4 w-4 shrink-0" aria-hidden />
								{t(
									"classic2.confirmCall",
									"অর্ডার কনফার্ম করতে আমরা ফোনে কল করব"
								)}
							</li>
						</ul>

						{orderActions()}
					</div>
				</div>
			</div>

			{/* ============ BAND 2 — proof ============ */}
			<div className="khata-rule-double my-10" aria-hidden />
			<div className="khata-spine pl-5 md:pl-8">
				<h2 className="mb-4 font-display text-2xl font-bold">
					{t("classic2.proofHeading", "বিবরণ ও রিভিউ")}
				</h2>
				<ProductDetailsTabs product={product} />
			</div>

			{/* ============ BAND 3 — the order close ============ */}
			<div className="khata-rule-double my-10" aria-hidden />
			<div className="khata-spine pl-5 md:pl-8">
				<div className="rounded-md border bg-card p-4 shadow-warm-sm md:p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="min-w-0">
							<p className="truncate font-display text-lg font-bold">
								{product.name}
							</p>
							<p className="flex flex-wrap items-baseline gap-x-2">
								<span
									className={cn(
										"text-2xl font-bold tabular-nums text-primary",
										isOutOfStock &&
											"khata-strike text-muted-foreground"
									)}
								>
									<Price amount={price} />
								</span>
								{hasDiscount && !isOutOfStock && (
									<span className="text-sm tabular-nums text-muted-foreground line-through">
										<Price amount={originalPrice} />
									</span>
								)}
							</p>
							{settings?.contact_phone && (
								<a
									href={`tel:${settings.contact_phone}`}
									className="ring-warm-focus mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline"
								>
									<Phone className="h-4 w-4" aria-hidden />
									{t("classic2.callToOrder", "ফোনে অর্ডার")}:{" "}
									<span className="tabular-nums">
										{settings.contact_phone}
									</span>
								</a>
							)}
						</div>
						<div className="shrink-0">{orderActions(true)}</div>
					</div>
					<p className="mt-3 text-xs text-muted-foreground">
						{t(
							"classic2.confirmCall",
							"অর্ডার কনফার্ম করতে আমরা ফোনে কল করব"
						)}
					</p>
				</div>
			</div>

			{/* Related entries. */}
			{product.related_products && product.related_products.length > 0 && (
				<section className="mt-12">
					<div className="khata-spine pl-5 md:pl-8">
						<KhataSectionTitle
							titleKey="classic2.relatedProducts"
							titleDefault="মিলিয়ে দেখুন"
						/>
						<div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
							{(product.related_products as Product[]).map(
								(related) => (
									<KhataProductCard
										key={related.id}
										product={related}
									/>
								)
							)}
						</div>
					</div>
				</section>
			)}
		</main>
	);
}
