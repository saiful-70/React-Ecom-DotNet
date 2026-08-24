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
import { ClassicSectionTitle } from "../home/ClassicSectionTitle";
import { ClassicComboRail } from "../home/ClassicComboRail";
import { ClassicProductCard } from "./ClassicProductCard";
import { ClassicGallery } from "./ClassicGallery";
import { cn } from "@/lib/utils/utils";

/**
 * Neutral local placeholder for the CART LINE payload only (the cart thumbnail
 * is rendered by shared code that needs a URL string). The gallery degrades
 * through ClassicImage's own in-world plate instead.
 */
const CART_LINE_PLACEHOLDER = "/placeholder.svg";

/**
 * The product page: photograph on the left, the offer on the right — price
 * anchoring, variants, quantity, the delivery-fee table, cash-on-delivery and
 * the confirming-call line, all printed BEFORE the vermilion order button.
 * Description and reviews follow on the grey band, then the order action
 * repeats at the bottom of the scroll, clear of the mobile bottom bar.
 */
export function ClassicProductDetails({
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

	const isWishlisted = wishlistIds.includes(product.id);
	const price = selectedVariant
		? parseFloat(selectedVariant.discount_price.toString())
		: parseFloat(product.discounted_price.toString());
	const originalPrice = selectedVariant
		? parseFloat(selectedVariant.price.toString())
		: parseFloat(product.price.toString());
	const stock = selectedVariant ? selectedVariant.stock : product.stock;
	const hasDiscount = originalPrice > price;
	const discountPercent = hasDiscount
		? Math.round(((originalPrice - price) / originalPrice) * 100)
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

	const cartLineImage =
		(product.gallery_images && product.gallery_images[0]) ||
		product.thumbnail_image ||
		CART_LINE_PLACEHOLDER;

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
			image: cartLineImage,
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
			toast.success(t("classic2.addedToBag", "ব্যাগে যোগ হয়েছে"), {
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

	/** The order actions; reused in the closing band at the bottom of the scroll. */
	const orderActions = (compact = false) => (
		<div className="flex flex-wrap items-center gap-3">
			<button
				type="button"
				onClick={handleOrderNow}
				disabled={isOutOfStock}
				className={cn(
					"ring-warm-focus inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-extrabold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
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
					"ring-warm-focus inline-flex min-h-12 items-center justify-center rounded-lg border border-border px-6 text-base font-bold transition-colors hover:bg-accent active:bg-accent disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent",
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
						"ring-warm-focus inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border transition-colors disabled:opacity-60",
						isWishlisted
							? "text-primary"
							: "text-muted-foreground hover:bg-accent hover:text-foreground"
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
		<main className="pb-24 md:pb-0">
			<div className="container mx-auto pt-4 md:pt-6">
				{/* Breadcrumb */}
				<nav aria-label="Breadcrumb" className="mb-3 text-sm md:mb-6">
					<Link
						href="/"
						className="ring-warm-focus rounded-md text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
					>
						{t("classic2.home", "হোম")}
					</Link>
					<span className="mx-2 text-muted-foreground" aria-hidden>
						/
					</span>
					{product.category?.name && (
						<>
							<Link
								href={`/products?category_id=${product.category.id}`}
								className="ring-warm-focus rounded-md text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
							>
								{product.category.name}
							</Link>
							<span className="mx-2 text-muted-foreground" aria-hidden>
								/
							</span>
						</>
					)}
					<span className="font-semibold">{product.name}</span>
				</nav>

				<div className="grid gap-4 lg:grid-cols-2 lg:gap-14">
					<ClassicGallery
						productName={product.name}
						thumbnailImage={product.thumbnail_image}
						galleryImages={product.gallery_images}
						colorImage={colorImage}
					/>

					<div className="flex flex-col gap-4 md:gap-6">
						<div>
							<h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-balance sm:text-3xl md:text-4xl">
								{product.name}
							</h1>
							{(product.sku || product.brand) && (
								<p className="mt-2 text-sm text-muted-foreground">
									{product.sku && (
										<>
											{t("classic2.sku", "কোড")}:{" "}
											<span className="classic-price">
												{product.sku}
											</span>
										</>
									)}
									{product.sku && product.brand && " · "}
									{product.brand}
								</p>
							)}
						</div>

						{/* Price anchoring: current heavy, original struck, chip. */}
						<div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
							<span
								className={cn(
									"classic-price font-display text-3xl font-extrabold sm:text-4xl md:text-5xl",
									isOutOfStock && "text-muted-foreground"
								)}
							>
								<Price amount={price} />
							</span>
							{hasDiscount && (
								<span className="classic-price text-lg text-muted-foreground line-through">
									<Price amount={originalPrice} />
								</span>
							)}
							{discountPercent > 0 && (
								<span className="classic-price rounded-md bg-primary px-2 py-0.5 text-sm font-extrabold text-primary-foreground">
									−{discountPercent}%
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
									"text-sm font-bold",
									isOutOfStock
										? "text-muted-foreground"
										: "text-success"
								)}
							>
								{isOutOfStock
									? t("classic2.stockOut", "স্টক শেষ")
									: `${availableStock} ${t(
											"classic2.inStock",
											"টি স্টকে আছে"
										)}`}
							</span>
						</div>

						{/* Combo offers anchored to this product. */}
						{combos && combos.length > 0 && (
							<ClassicComboRail combos={combos} />
						)}

						{/* Delivery fees printed BEFORE the order button. */}
						<ProductDeliveryInfo />

						{/* The terms, then the button. */}
						<ul className="space-y-2.5 text-sm">
							<li className="flex items-center gap-2 font-bold text-success">
								<BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
								{t(
									"classic2.codLong",
									"পণ্য হাতে পেয়ে টাকা দিন — ক্যাশ অন ডেলিভারি"
								)}
							</li>
							<li className="flex items-center gap-2 text-success">
								<Truck className="h-4 w-4 shrink-0" aria-hidden />
								{t(
									"classic2.deliveryPromise",
									"ঢাকায় ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ২–৩ দিন"
								)}
							</li>
							<li className="flex items-center gap-2 text-muted-foreground">
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

			{/* Description and reviews on the grey band. */}
			<div className="classic-band mt-12 py-10 md:mt-16 md:py-14">
				<div className="container mx-auto">
					<h2 className="mb-5 font-display text-2xl font-extrabold tracking-tight md:mb-6 md:text-3xl">
						{t("classic2.proofHeading", "বিবরণ ও রিভিউ")}
					</h2>
					<ProductDetailsTabs product={product} />
				</div>
			</div>

			{/* The order action, repeated at the bottom of the scroll. */}
			<div className="container mx-auto py-10 md:py-12">
				<div className="rounded-xl border border-border p-4 md:p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="min-w-0">
							<p className="truncate font-display text-lg font-extrabold">
								{product.name}
							</p>
							<p className="flex flex-wrap items-baseline gap-x-2">
								<span
									className={cn(
										"classic-price text-2xl font-extrabold",
										isOutOfStock && "text-muted-foreground"
									)}
								>
									<Price amount={price} />
								</span>
								{hasDiscount && (
									<span className="classic-price text-sm text-muted-foreground line-through">
										<Price amount={originalPrice} />
									</span>
								)}
							</p>
							{settings?.contact_phone && (
								<a
									href={`tel:${settings.contact_phone}`}
									className="ring-warm-focus mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-bold text-primary underline-offset-4 hover:underline"
								>
									<Phone className="h-4 w-4" aria-hidden />
									{t("classic2.callToOrder", "ফোনে অর্ডার")}:{" "}
									<span className="classic-price">
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

			{/* Related products. */}
			{product.related_products && product.related_products.length > 0 && (
				<section className="container mx-auto pb-14">
					<ClassicSectionTitle
						titleKey="classic2.relatedProducts"
						titleDefault="সম্পর্কিত পণ্য"
					/>
					<div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
						{(product.related_products as Product[]).map((related) => (
							<ClassicProductCard
								key={related.id}
								product={related}
							/>
						))}
					</div>
				</section>
			)}
		</main>
	);
}
