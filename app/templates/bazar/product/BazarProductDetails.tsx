"use client";

import { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { Facebook, Heart, Linkedin, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { Button } from "@/components/shared/ui/button";
import { toast } from "@/components/shared/ui/sonner";
import Price from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
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
	ProductDeliveryInfo,
	ProductDetailsTabs,
} from "@/components/product/product-details";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";
import type {
	Product,
	ProductVariant,
} from "@/(app-routes)/products/model";
import type { ProductDetailsLayoutProps } from "../../types";
import { BazarSectionTitle } from "../home/BazarSectionTitle";
import { BazarProductsGrid } from "./BazarProductsGrid";
import { cn } from "@/lib/utils/utils";

/**
 * Bazar PDP: breadcrumb, gallery left, purchase column right (title, SKU,
 * price + save badge, variant selector, quantity + stock, Add to Cart / Buy
 * Now / wishlist, delivery info, share), tabs, related products.
 */
export function BazarProductDetails({ product }: ProductDetailsLayoutProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const { items, addToCart } = useCart();
	const [userProfile] = useAtom(miniProfileAtom);
	const [wishlistIds, setWishlistIds] = useAtom(wishlistAtom);
	const [isWishlistLoading, setIsWishlistLoading] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [selectedColorId, setSelectedColorId] = useState<number | null>(
		null
	);
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

	// Fallback image for products without thumbnails (mirrors classic PDP).
	const fallbackImage = `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&auto=format`;
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
			toast.success(t("bazar.addToCart"), {
				description: `${product.name} ${t(
					"productCard.addedToCart"
				)}`,
			});
		}
	};

	const handleBuyNow = () => {
		const line = doAddToCart();
		if (line) {
			router.push(buyNowCheckoutHref(line.id, line.variant_id));
		}
	};

	const handleToggleWishlist = async () => {
		if (!userProfile) {
			toast.error(t("productCard.loginRequired"));
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
					response.message ||
						t("productCard.wishlistUpdateFailed")
				);
			}
		} catch {
			toast.error(t("productCard.wishlistUpdateFailed"));
		} finally {
			setIsWishlistLoading(false);
		}
	};

	const share = (network: "facebook" | "twitter" | "linkedin") => {
		const url = encodeURIComponent(window.location.href);
		const shareUrls = {
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
			twitter: `https://twitter.com/intent/tweet?url=${url}`,
			linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
		};
		window.open(shareUrls[network], "_blank", "noopener,noreferrer");
	};

	const colorImage = selectedColorId
		? product.colors_image?.find((ci) => ci.id === selectedColorId)
				?.photo
		: undefined;

	return (
		<main className="container mx-auto px-4 py-6">
			<nav
				className="mb-6 rounded-md bg-muted/60 px-4 py-3 text-sm"
				aria-label="Breadcrumb"
			>
				<Link href="/" className="font-semibold hover:text-primary">
					{t("bazar.home")}
				</Link>
				<span className="mx-2 text-muted-foreground">&gt;</span>
				<span className="line-clamp-1 inline text-muted-foreground">
					{product.name}
				</span>
			</nav>

			<div className="grid gap-8 lg:grid-cols-2">
				<ProductImageGallery
					productName={product.name}
					thumbnailImage={product.thumbnail_image}
					galleryImages={product.gallery_images}
					colorImage={colorImage}
				/>

				<div className="space-y-5">
					<h1 className="text-2xl font-bold md:text-3xl">
						{product.name}
					</h1>
					{product.sku && (
						<p className="text-sm text-muted-foreground">
							<span className="font-semibold text-foreground">
								{t("bazar.sku")}:
							</span>{" "}
							{product.sku}
						</p>
					)}

					<div className="flex flex-wrap items-center gap-3">
						<span className="text-3xl font-bold text-primary tabular-nums">
							<Price amount={price} />
						</span>
						{saveAmount > 0 && (
							<>
								<span className="text-muted-foreground line-through tabular-nums">
									<Price amount={originalPrice} />
								</span>
								<span className="rounded bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
									{t("bazar.save")}:{" "}
									<Price amount={saveAmount} />
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
									? "text-primary"
									: "text-destructive"
							)}
						>
							{availableStock > 0
								? `${availableStock} ${t("bazar.inStock")}`
								: t("bazar.stockOut")}
						</span>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<Button
							size="lg"
							variant="secondary"
							className="rounded-full px-8 font-semibold"
							onClick={handleAddToCart}
							disabled={availableStock <= 0}
						>
							{t("bazar.addToCart")}
						</Button>
						<Button
							size="lg"
							className="rounded-full px-8 font-semibold"
							onClick={handleBuyNow}
							disabled={availableStock <= 0}
						>
							{t("bazar.buyNow")}
						</Button>
						<Button
							size="icon"
							variant={isWishlisted ? "default" : "outline"}
							className="rounded-full"
							onClick={handleToggleWishlist}
							disabled={isWishlistLoading}
							aria-label={t("bazar.wishlist")}
							aria-pressed={isWishlisted}
						>
							<Heart
								className={cn(
									"h-5 w-5",
									isWishlisted && "fill-current"
								)}
							/>
						</Button>
					</div>

					<ProductDeliveryInfo />

					<div className="flex items-center gap-3 border-t pt-4">
						<span className="text-sm font-medium">
							{t("bazar.shareOn")}:
						</span>
						<button
							type="button"
							onClick={() => share("facebook")}
							aria-label="Facebook"
							className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground hover:border-primary hover:text-primary"
						>
							<Facebook className="h-4 w-4" />
						</button>
						<button
							type="button"
							onClick={() => share("twitter")}
							aria-label="Twitter"
							className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground hover:border-primary hover:text-primary"
						>
							<Twitter className="h-4 w-4" />
						</button>
						<button
							type="button"
							onClick={() => share("linkedin")}
							aria-label="LinkedIn"
							className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground hover:border-primary hover:text-primary"
						>
							<Linkedin className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>

			<div className="mt-10">
				<ProductDetailsTabs product={product} />
			</div>

			{product.related_products &&
				product.related_products.length > 0 && (
					<section className="mt-12">
						<BazarSectionTitle titleKey="bazar.relatedProducts" />
						<BazarProductsGrid
							products={product.related_products as Product[]}
						/>
					</section>
				)}
		</main>
	);
}
