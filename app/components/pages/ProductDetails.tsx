"use client";

import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect } from "react";
import { toast } from "@/components/shared/ui/sonner";
import { useCart } from "@/contexts/CartContext";
import { useAtom } from "jotai";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/(app-routes)/(auth)/action";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";
import { ProductsGrid } from "@/components/product/ProductsGrid";
import {
	trackUnifiedAddToCart,
	trackUnifiedViewProduct,
} from "@/lib/analytics";
import {
	ProductBreadcrumb,
	ProductImageGallery,
	ProductBadges,
	ProductRating,
	ProductPrice,
	ProductMeta,
	QuantitySelector,
	ProductActionButtons,
	ProductDeliveryInfo,
	ProductDetailsTabs,
} from "@/components/product/product-details";
import type { Product, ProductVariant } from "@/(app-routes)/products/model";

interface ProductDetailsPageProps {
	product: Product;
}

export function ProductDetails({ product }: ProductDetailsPageProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const [userProfile] = useAtom(miniProfileAtom);
	const [wishlistIds, setWishlistIds] = useAtom(wishlistAtom);
	const [isWishlistLoading, setIsWishlistLoading] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
	const { items, addToCart } = useCart();

	// Select first variant as default, or null if no variants
	const [selectedVariant, setSelectedVariant] =
		useState<ProductVariant | null>(
			product.variants && product.variants.length > 0
				? product.variants[0]
				: null
		);
	const isWishlisted = wishlistIds.includes(product.id);

	// Track product view on mount
	useEffect(() => {
		const price = selectedVariant
			? parseFloat(selectedVariant.discount_price.toString())
			: parseFloat(product.discounted_price.toString());

		trackUnifiedViewProduct(
			product.id.toString(),
			product.name,
			price,
			product.category?.name
		);
	}, [product.id]); // Only track once on mount

	// derive how many of this product (or this selected variant) are already in cart
	const reservedQuantity = useMemo(() => {
		if (!items || items.length === 0) return 0;
		return items.reduce((sum, cartItem) => {
			if (cartItem.id !== product.id) return sum;
			// if a variant is selected, only count items matching that variant
			if (selectedVariant) {
				return (
					sum +
					(cartItem.variant_id === selectedVariant.id
						? cartItem.quantity
						: 0)
				);
			}
			// no variant selected -> count all cart quantities for this product
			return sum + cartItem.quantity;
		}, 0);
	}, [items, product.id, selectedVariant?.id]);

	// compute available stock for UI (never mutate `product`)
	const availableStock = selectedVariant
		? Math.max(0, selectedVariant.stock - reservedQuantity)
		: Math.max(0, product.stock - reservedQuantity);

	// Check if product is in wishlist

	// Use selected variant's price and stock, or fall back to product's price/stock
	const price = selectedVariant ? selectedVariant.price : product.price;
	const discountedPrice = selectedVariant
		? selectedVariant.discount_price
		: product.discounted_price;
	const originalPrice = discountedPrice < price ? price : undefined;

	// Calculate discount percentage
	const discount =
		originalPrice && discountedPrice < originalPrice
			? Math.round(
				((originalPrice - discountedPrice) / originalPrice) * 100
			)
			: 0;

	// Fallback image for products without thumbnails
	const fallbackImage = `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&auto=format`;

	// Main image for cart operations
	const mainImage =
		(product.gallery_images && product.gallery_images[0]) ||
		product.thumbnail_image ||
		fallbackImage;

	const handleAddToCart = () => {
		if (availableStock <= 0) {
			toast.error(t("productDetails.outOfStockError") || "Out of stock!");
			return;
		}

		if (quantity > availableStock) {
			toast.error(
				t("productDetails.quantityExceedsStock") ||
				`Only ${availableStock} items available in stock`
			);
			return;
		}

		addToCart({
			id: product.id,
			name: selectedVariant
				? `${product.name} - ${selectedVariant.combination_text}`
				: product.name,
			price: discountedPrice,
			image: mainImage,
			variant_id: selectedVariant?.id,
			stock: availableStock,
			tax: product.tax ? parseFloat(product.tax) : 0,
			tax_type: product.tax_type || "exclude",
			quantity,
		});

		// Track add to cart event
		trackUnifiedAddToCart(
			product.id.toString(),
			product.name,
			parseFloat(discountedPrice.toString()),
			quantity
		);

		toast.success(t("productDetails.addedToCart") || "Added to cart!", {
			description:
				t("productDetails.itemsAddedToCart", { count: quantity }) ||
				`${quantity} item(s) added to your cart.`,
		});
	};

	const handleBuyNow = () => {
		if (availableStock <= 0) {
			toast.error(t("productDetails.outOfStockError") || "Out of stock!");
			return;
		}

		if (quantity > availableStock) {
			toast.error(
				t("productDetails.quantityExceedsStock") ||
				`Only ${availableStock} items available in stock`
			);
			return;
		}

		// Add to cart first
		addToCart({
			id: product.id,
			name: selectedVariant
				? `${product.name} - ${selectedVariant.combination_text}`
				: product.name,
			price: discountedPrice,
			image: mainImage,
			variant_id: selectedVariant?.id,
			stock: availableStock,
			tax: product.tax ? parseFloat(product.tax) : 0,
			tax_type: product.tax_type || "exclude",
			quantity,
		});

		// Track add to cart event
		trackUnifiedAddToCart(
			product.id.toString(),
			product.name,
			parseFloat(discountedPrice.toString()),
			quantity
		);

		// Navigate to checkout
		router.push("/checkout");
	};

	const handleToggleWishlist = async () => {
		// Check if user is logged in
		if (!userProfile) {
			toast.error(
				t("productDetails.loginRequired") ||
				"Please login to add to wishlist"
			);
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
				// Update local wishlist state
				if (isWishlisted) {
					setWishlistIds(
						wishlistIds.filter((id) => id !== product.id)
					);
				} else {
					setWishlistIds([...wishlistIds, product.id]);
				}

				toast.success(
					isWishlisted
						? t("productDetails.removedFromWishlist") ||
						"Removed from wishlist"
						: t("productDetails.addedToWishlist") ||
						"Added to wishlist",
					{
						description: isWishlisted
							? t("productDetails.itemRemovedFromWishlist") ||
							"Item removed from your wishlist."
							: t("productDetails.itemAddedToWishlist") ||
							"Item added to your wishlist.",
					}
				);
			} else {
				toast.error(
					response.message ||
					t("productDetails.wishlistUpdateFailed") ||
					"Failed to update wishlist"
				);
			}
		} catch (error) {
			console.error("Error toggling wishlist:", error);
			toast.error(
				t("productDetails.wishlistUpdateFailed") ||
				"Failed to update wishlist"
			);
		} finally {
			setIsWishlistLoading(false);
		}
	};

	const handleShare = async () => {
		const shareUrl = `${window.location.origin}/products/${product.id}`;
		const shareData = {
			title: product.name,
			text: `${t("productDetails.checkOut") || "Check out"} ${product.name
				} - ${discountedPrice.toFixed(2)}`,
			url: shareUrl,
		};

		try {
			if (navigator.share) {
				await navigator.share(shareData);
				toast.success(
					t("productDetails.sharedSuccessfully") ||
					"Shared successfully!"
				);
			} else {
				await navigator.clipboard.writeText(shareUrl);
				toast.success(
					t("productDetails.linkCopiedToClipboard") ||
					"Link copied to clipboard!"
				);
			}
		} catch (error) {
			if ((error as Error).name !== "AbortError") {
				try {
					await navigator.clipboard.writeText(shareUrl);
					toast.success(
						t("productDetails.linkCopiedToClipboard") ||
						"Link copied to clipboard!"
					);
				} catch {
					toast.error(
						t("productDetails.failedToShare") || "Failed to share"
					);
				}
			}
		}
	};

	return (
		<main className="container mx-auto px-3 sm:px-4 py-3 sm:py-6 lg:py-8">
			{/* Breadcrumb */}
			<ProductBreadcrumb productName={product.name} />

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-12">
				{/* Image Gallery */}
				<ProductImageGallery
					productName={product.name}
					thumbnailImage={product.thumbnail_image || fallbackImage}
					galleryImages={product.gallery_images}
					colorImage={
						selectedColorId
							? product.colors_image?.find(
								(item) => item.id === selectedColorId
							)?.photo
							: undefined
					}
				/>

				{/* Product Info */}
				<div className="space-y-3 sm:space-y-4 lg:space-y-6">
					<div>
						{/* Badges */}
						<ProductBadges
							discount={discount}
							isFeatured={product.is_featured}
							isTodayDeal={product.today_deal}
						/>

						{/* Product Name */}
						<h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 lg:mb-4 leading-tight">
							{product.name}
						</h1>

						{/* Rating */}
						<ProductRating
							averageRating={product.average_rating}
							totalReviews={product.total_reviews}
						/>

						{/* Price */}
						<ProductPrice
							discountedPrice={discountedPrice}
							originalPrice={originalPrice}
						/>

						{/* Product Meta */}
						<ProductMeta
							brand={product.brand}
							sku={selectedVariant?.sku || product.sku}
						/>
					</div>

					{/* Variant Selection */}
					{product.variants && product.variants.length > 0 && (
						<ProductVariantSelector
							product={product}
							onVariantChange={(variant) => {
								setSelectedVariant(variant);
								setQuantity(1); // Reset quantity on variant change
							}}
							onColorChange={(color, colorId) => {
								setSelectedColorId(colorId || null);
							}}
						/>
					)}					{/* Quantity & Actions */}
					<div className="space-y-2.5 sm:space-y-4 lg:space-y-5">
						<QuantitySelector
							quantity={quantity}
							onQuantityChange={setQuantity}
							stock={availableStock}
						/>

						<ProductActionButtons
							onAddToCart={handleAddToCart}
							onBuyNow={handleBuyNow}
							onToggleWishlist={handleToggleWishlist}
							onShare={handleShare}
							availableStock={availableStock}
							isWishlisted={isWishlisted}
							isWishlistLoading={isWishlistLoading}
						/>

						<ProductDeliveryInfo />
					</div>
				</div>
			</div>

			{/* Tabs Section */}
			<ProductDetailsTabs product={product} />

			{/* Related Products Section */}
			{product.related_products &&
				product.related_products.length > 0 && (
					<div className="mt-4 mb-6 sm:my-4 lg:my-6">
						<h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6">
							{t("productDetails.relatedProducts") ||
								"Related Products"}
						</h2>
						<ProductsGrid
							products={product.related_products}
						/>
					</div>
				)}
		</main>
	);
}
