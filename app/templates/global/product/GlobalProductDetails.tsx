"use client";

import { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { ChevronRight, Heart, Share2 } from "lucide-react";
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
import { toggleWishlist } from "@/(app-routes)/(auth)/action";
import {
	trackUnifiedAddToCart,
	trackUnifiedViewProduct,
} from "@/lib/analytics";
import {
	ProductImageGallery,
	QuantitySelector,
	ProductDetailsTabs,
} from "@/components/product/product-details";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";
import { ProductBundleSelector } from "@/components/product/bundle/ProductBundleSelector";
import type { Product, ProductVariant } from "@/(app-routes)/products/model";
import type { ProductDetailsLayoutProps } from "@/templates/types";
import { GlobalSectionTitle } from "../home/GlobalSectionTitle";
import { GlobalDeliveryInfo } from "./GlobalDeliveryInfo";
import { GlobalRatingStars } from "./GlobalRatingStars";
import { GlobalProductsGrid } from "./GlobalProductsGrid";
import { cn } from "@/lib/utils/utils";

/**
 * Global PDP: breadcrumb, gallery, purchase column (title, rating, order/
 * wishlist counts, price + save, variant selector, quantity, live total,
 * Buy Now / Add to Cart / wishlist, delivery, share), tabs, related products.
 */
export function GlobalProductDetails({
	product,
	bundle,
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
	const saveAmount = originalPrice > price ? originalPrice - price : 0;

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

	const handleShare = async () => {
		const url = typeof window !== "undefined" ? window.location.href : "";
		try {
			if (navigator.share) {
				await navigator.share({ title: product.name, url });
			} else {
				await navigator.clipboard.writeText(url);
				toast.success(t("global.linkCopied"));
			}
		} catch {
			/* user dismissed the share sheet — no action needed */
		}
	};

	const colorImage = selectedColorId
		? product.colors_image?.find((ci) => ci.id === selectedColorId)?.photo
		: undefined;

	return (
		<main className="container mx-auto px-4 py-6">
			<nav
				className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground"
				aria-label="Breadcrumb"
			>
				<Link href="/" className="hover:text-primary">
					{t("global.nav.home")}
				</Link>
				<ChevronRight className="h-4 w-4" />
				{product.category?.name && (
					<>
						<Link
							href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
								product.category.id
							)}
							className="hover:text-primary"
						>
							{product.category.name}
						</Link>
						<ChevronRight className="h-4 w-4" />
					</>
				)}
				<span className="line-clamp-1 font-medium text-foreground">
					{product.name}
				</span>
			</nav>

			<div className="grid gap-8 rounded-lg border bg-card p-4 md:p-6 lg:grid-cols-2">
				<ProductImageGallery
					productName={product.name}
					thumbnailImage={product.thumbnail_image}
					galleryImages={product.gallery_images}
					colorImage={colorImage}
				/>

				<div className="space-y-5">
					<h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>

					<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
						<GlobalRatingStars
							rating={product.average_rating}
							count={product.total_reviews}
						/>
						{product.sku && (
							<span>
								<span className="font-medium text-foreground">
									{t("global.sku")}:
								</span>{" "}
								{product.sku}
							</span>
						)}
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<span className="text-3xl font-bold text-primary tabular-nums">
							<Price amount={price} />
						</span>
						{saveAmount > 0 && (
							<>
								<span className="text-muted-foreground line-through tabular-nums">
									<Price amount={originalPrice} />
								</span>
								<span className="rounded bg-warning px-2.5 py-1 text-sm font-semibold text-warning-foreground">
									{t("global.save")} <Price amount={saveAmount} />
								</span>
							</>
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

					{bundle && bundle.tiers.length > 0 ? (
						<ProductBundleSelector bundle={bundle} />
					) : (
						<>
							<div className="flex flex-wrap items-center gap-4">
								<QuantitySelector
									quantity={quantity}
									onQuantityChange={setQuantity}
									stock={availableStock}
								/>
								<span
									className={cn(
										"text-sm font-medium",
										availableStock > 0
											? "text-success"
											: "text-destructive"
									)}
								>
									{availableStock > 0
										? `${availableStock} ${t("global.inStock")}`
										: t("global.stockOut")}
								</span>
							</div>

							<div className="flex items-center gap-2 border-t pt-4 text-lg">
								<span className="font-medium text-muted-foreground">
									{t("global.totalPrice")}:
								</span>
								<span className="text-2xl font-bold text-primary tabular-nums">
									<Price amount={totalPrice} />
								</span>
							</div>

							<div className="flex flex-wrap items-center gap-3">
								<Button
									size="lg"
									className="bg-warning px-8 font-semibold text-warning-foreground hover:bg-warning/90"
									onClick={handleBuyNow}
									disabled={availableStock <= 0}
								>
									{t("global.buyNow")}
								</Button>
								<Button
									size="lg"
									className="px-8 font-semibold"
									onClick={handleAddToCart}
									disabled={availableStock <= 0}
								>
									{t("global.addToCart")}
								</Button>
								<Button
									size="icon"
									variant={isWishlisted ? "default" : "outline"}
									onClick={handleToggleWishlist}
									disabled={isWishlistLoading}
									aria-label={t("global.wishlist")}
									aria-pressed={isWishlisted}
								>
									<Heart
										className={cn(
											"h-5 w-5",
											isWishlisted && "fill-current"
										)}
									/>
								</Button>
								<Button
									size="icon"
									variant="outline"
									onClick={handleShare}
									aria-label={t("global.share")}
								>
									<Share2 className="h-5 w-5" />
								</Button>
							</div>
						</>
					)}

					<GlobalDeliveryInfo />
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
		</main>
	);
}
