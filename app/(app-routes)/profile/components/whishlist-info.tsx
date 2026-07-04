"use client";

import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { HeartIcon } from "lucide-react";
import { getWishlists, toggleWishlist } from "@/(app-routes)/(auth)/action";
import { Product } from "@/(app-routes)/products/model";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/shared/ui/skeleton";
import Image from "next/image";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/components/shared/ui/sonner";
import { useTranslation } from "react-i18next";
import Price from "@/components/shared/Price";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";

export default function WishlistInfo() {
	const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

	const [loading, setLoading] = useState(true);
	const { addToCart } = useCart();
	const { t } = useTranslation();

	useEffect(() => {
		const fetchWishlists = async () => {
			setLoading(true);
			try {
				const response = await getWishlists();
				// Extract products from wishlist items
				if (response.success && response.data) {
					const products = response.data.map(item => item.product);
					setWishlistItems(products);
				}
			} catch (error) {
				console.error("Error fetching wishlists:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchWishlists();
	}, []);

	const handleAddToCart = (product: Product) => {
		// Get the first variant if product has variants
		const variant = product.variants && product.variants.length > 0 ? product.variants[0] : null;

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

		// Add to cart with variant information and tax
		addToCart({
			id: product.id,
			name: variant
				? `${product.name} - ${variant.combination_text}`
				: product.name,
			price: price,
			image: product.thumbnail_image,
			variant_id: variant?.id,
			stock: stock,
			tax: product.tax ? parseFloat(product.tax) : 0,
			tax_type: product.tax_type || "exclude",
		});
		toast.success(t("products.addToCart") || "Added to cart!", {
			description: `${product.name} ${t("productCard.addedToCart") || "added to cart"}`,
		});
	};

	const handleRemoveFromWishlist = async (product: Product) => {
		try {
			const response = await toggleWishlist(product.id);
			if (response.success) {
				// Remove the item from wishlist
				setWishlistItems(wishlistItems.filter(item => item.id !== product.id));
				toast.success(
					t("productCard.wishlistRemoved") || "Removed from wishlist"
				);
			} else {
				toast.error(
					response.message ||
					t("productCard.wishlistUpdateFailed") ||
					"Failed to remove from wishlist"
				);
			}
		} catch (error) {
			console.error("Error removing from wishlist:", error);
			toast.error(
				t("productCard.wishlistUpdateFailed") ||
				"Failed to remove from wishlist"
			);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<HeartIcon className="w-5 h-5" />
					{t("profile.myWishlist") || "My Wishlist"}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="grid gap-4 md:grid-cols-2">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="p-4 border rounded-lg">
								<div className="flex items-center space-x-4">
									<Skeleton className="w-16 h-16 rounded" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-3/4" />
										<Skeleton className="h-4 w-1/2" />
									</div>
									<div className="flex flex-col gap-2">
										<Skeleton className="h-8 w-20" />
										<Skeleton className="h-8 w-20" />
									</div>
								</div>
							</div>
						))}
					</div>
				) : wishlistItems.length === 0 ? (
					<div className="text-center py-12">
						<HeartIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
							{t("profile.emptyWishlistTitle") || "Your wishlist is empty"}
						</h3>
						<p className="text-gray-500 dark:text-gray-400">
							{t("profile.emptyWishlistDescription") || "Start adding products you love to your wishlist"}
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{wishlistItems.map((item) => (
							<div key={item.id} className="p-4 border rounded-lg">
								<div className="flex items-center space-x-4">
									<Image
										src={item.thumbnail_image}
										alt={item.name}
										width={64}
										height={64}
										className="w-16 h-16 object-cover rounded"
									/>
									<div className="flex-1">
										<Link href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(item.id)}>
											<h3 className="font-medium hover:text-primary transition-colors cursor-pointer">{item.name}</h3>
										</Link>
										<p className="text-lg font-semibold text-primary"><Price amount={item.price} /></p>
									</div>
									<div className="flex flex-col gap-2">
										<Button
											size="sm"
											onClick={() => handleAddToCart(item)}
										>
											{t("profile.wishlistAddToCart") || "Add to Cart"}
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleRemoveFromWishlist(item)}
										>
											{t("profile.wishlistRemove") || "Remove"}
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
