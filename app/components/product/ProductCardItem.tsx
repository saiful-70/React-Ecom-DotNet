"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Card, CardContent } from "@/components/shared/ui/card";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/components/shared/ui/sonner";
import { useTranslation } from "react-i18next";
import type { Product } from "@/(app-routes)/products/model";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { useAtom } from "jotai";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/(app-routes)/(auth)/action";
import Price from "@/components/shared/Price";
import { cn } from "@/lib/utils/utils";

interface ProductCardItemProps {
	product: Product;
}

export function ProductCardItem({ product }: ProductCardItemProps) {
	const [isWishlistLoading, setIsWishlistLoading] = useState(false);
	const { addToCart } = useCart();
	const { t } = useTranslation();
	const [userProfile] = useAtom(miniProfileAtom);
	const [wishlistIds, setWishlistIds] = useAtom(wishlistAtom);
	const router = useRouter();

	const isWishlisted = wishlistIds.includes(product.id);

	const fallbackImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&q=80";
	const imageSource = product.thumbnail_image && product.thumbnail_image.trim() !== ""
		? product.thumbnail_image
		: fallbackImage;

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		// Get the first variant if product has variants
		const variant =
			product.variants && product.variants.length > 0
				? product.variants[0]
				: null;

		// Use variant price if available, otherwise use product price
		const price = variant
			? parseFloat(variant.discount_price.toString())
			: parseFloat(product.discounted_price.toString());

		// Use variant stock if available, otherwise use product stock
		const stock = variant ? variant.stock : product.stock;

		// Check if out of stock
		if (stock <= 0) {
			toast.error(t("products.outOfStock") || "Out of stock!");
			return;
		}

		// Add to cart with variant information if available
		addToCart({
			id: product.id,
			name: variant
				? `${product.name} - ${variant.combination_text}`
				: product.name,
			price: price,
			image: imageSource,
			variant_id: variant?.id,
			stock: stock,
			tax: product.tax ? parseFloat(product.tax) : 0,
			tax_type: product.tax_type || "exclude",
		});
		toast.success(t("products.addToCart"), {
			description: `${product.name} ${t("productCard.addedToCart") || "added to cart"
				}`,
		});
	};

	const handleToggleWishlist = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!userProfile) {
			toast.error(
				t("productCard.loginRequired") ||
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
				if (isWishlisted) {
					setWishlistIds(
						wishlistIds.filter((id) => id !== product.id)
					);
				} else {
					setWishlistIds([...wishlistIds, product.id]);
				}

				toast.success(
					isWishlisted
						? t("productCard.wishlistRemoved") ||
						"Removed from wishlist"
						: t("productCard.wishlistAdded") || "Added to wishlist"
				);
			} else {
				toast.error(
					response.message ||
					t("productCard.wishlistUpdateFailed") ||
					"Failed to update wishlist"
				);
			}
		} catch (error) {
			console.error("Error toggling wishlist:", error);
			toast.error(
				t("productCard.wishlistUpdateFailed") ||
				"Failed to update wishlist"
			);
		} finally {
			setIsWishlistLoading(false);
		}
	};
	const isOutOfStock = product.stock <= 0;
	const price = product.price;
	const discountedPrice = product.discounted_price;
	const hasDiscount =
		price > discountedPrice && product.discount_type !== "none";
	const discountPercentage = hasDiscount
		? Math.round(((price - discountedPrice) / price) * 100)
		: 0;

	const rating = product.average_rating || 0;
	const reviewCount = product.total_reviews || 0;

	// Single card layout for both grid and list views
	return (
		<Card className="group relative overflow-hidden border-border/60 shadow-warm-sm hover:shadow-warm-md hover:border-primary/30 transition-all duration-300 lg:hover:-translate-y-1 flex flex-col h-full bg-card">
			<div className="relative overflow-hidden bg-muted/40">
				<Link href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}>
					<Image
						src={imageSource}
						alt={product.name}
						width={400}
						height={300}
						className="w-full h-32 sm:h-40 md:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
						sizes="(max-width: 1024px) 50vw, 25vw"
					/>
				</Link>

				{/* Badges */}
				<div className="absolute top-2 left-2 flex flex-col gap-1">
					{product.is_featured ? (
						<Badge className="bg-saffron-gradient text-accent-foreground border-0 shadow-warm-sm text-[10px] sm:text-xs px-2 py-0.5 font-medium">
							{t("productCard.featured") || "Featured"}
						</Badge>
					) : null}
					{hasDiscount && discountPercentage > 0 ? (
						<Badge variant="destructive" className="shadow-warm-sm text-[10px] sm:text-xs px-2 py-0.5 font-semibold">
							-{discountPercentage}%
						</Badge>
					) : null}
				</div>

				{/* Quick Actions - Hover only on desktop */}
				<div className="hidden lg:flex absolute top-2 right-2 flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					<Button
						size="icon"
						variant={isWishlisted ? "default" : "secondary"}
						className="w-8 h-8 rounded-full"
						onClick={handleToggleWishlist}
						disabled={isWishlistLoading}
					>
						<Heart
							className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""
								}`}
						/>
					</Button>
					<Link href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}>
						<Button
							size="icon"
							variant="secondary"
							className="w-8 h-8 rounded-full"
						>
							<Eye className="w-4 h-4" />
						</Button>
					</Link>
				</div>

				{/* Add to Cart Overlay - Desktop only */}
				<div className="hidden lg:block absolute bottom-0 left-0 right-0 bg-gradient-to-t from-secondary/80 via-secondary/30 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					<Button
						className="w-full shadow-warm-md font-medium"
						onClick={handleAddToCart}
						disabled={isOutOfStock}
					>
						<ShoppingCart className="w-4 h-4 mr-2" />
						{isOutOfStock
							? t("products.outOfStock")
							: t("products.addToCart")}
					</Button>
				</div>
			</div>

			<CardContent className="p-2 sm:p-3 md:p-4 flex flex-col flex-1">
				<div className="space-y-1 sm:space-y-2 flex-1">
					<Link href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}>
						<h3 className="font-medium text-xs sm:text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
							{product.name}
						</h3>
					</Link>

					{/* Rating */}
					{reviewCount > 0 ? (
						<div className="flex items-center gap-0.5">
							<div className="flex items-center">
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < Math.floor(rating)
											? "text-yellow-400 fill-current"
											: "text-muted-foreground"
											}`}
									/>
								))}
							</div>
							<span className="text-[10px] sm:text-xs text-muted-foreground">
								({reviewCount})
							</span>
						</div>
					) : (
						<div className="text-[10px] sm:text-xs text-muted-foreground">
							{t("productCard.noRatingYet") || "No rating yet"}
						</div>
					)}

					{/* Price */}
					<div className="flex items-baseline gap-2 pt-1">
						<span className="font-sans font-bold text-base sm:text-lg md:text-xl text-primary tabular-nums tracking-tight">
							<Price amount={discountedPrice} />
						</span>
						{hasDiscount && (
							<span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-through tabular-nums">
								<Price amount={price} />
							</span>
						)}
					</div>
				</div>

				{/* Mobile Action Buttons - Always at bottom */}
				<div className="flex gap-1 sm:gap-2 lg:hidden mt-2">
					<Button
						className="flex-1 text-[10px] sm:text-xs h-7 sm:h-8 px-2"
						onClick={handleAddToCart}
						disabled={isOutOfStock}
					>
						<ShoppingCart className="w-3 h-3 sm:mr-1" />
						<span className="hidden sm:inline">
							{isOutOfStock
								? t("products.outOfStock")
								: t("products.addToCart")}
						</span>
					</Button>
					<Button
						size="icon"
						variant={isWishlisted ? "default" : "secondary"}
						className="h-7 w-7 sm:h-8 sm:w-8"
						onClick={handleToggleWishlist}
						disabled={isWishlistLoading}
					>
						<Heart
							className={cn(
								"w-3 h-3",
								isWishlisted && "fill-current"
							)}
						/>
					</Button>
					<Link
						href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
					>
						<Button
							size="icon"
							variant="secondary"
							className="h-7 w-7 sm:h-8 sm:w-8"
						>
							<Eye className="w-3 h-3" />
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
