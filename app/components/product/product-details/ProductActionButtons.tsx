"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/shared/ui/button";
import { ShoppingCart, Heart, Share2, ShoppingBag } from "lucide-react";

interface ProductActionButtonsProps {
	onAddToCart: () => void;
	onBuyNow: () => void;
	onToggleWishlist: () => void;
	onShare: () => void;
	availableStock: number;
	isWishlisted: boolean;
	isWishlistLoading: boolean;
}

export function ProductActionButtons({
	onAddToCart,
	onBuyNow,
	onToggleWishlist,
	onShare,
	availableStock,
	isWishlisted,
	isWishlistLoading,
}: ProductActionButtonsProps) {
	const { t } = useTranslation();

	return (
		<div className="space-y-2">
			<div className="flex flex-col sm:flex-row gap-2">
				<Button
					onClick={onBuyNow}
					disabled={availableStock <= 0}
					className="w-full sm:flex-1 h-10"
				>
					<ShoppingBag className="size-4 mr-2" />
					{t("productDetails.buyNow")}
				</Button>
				<Button
					onClick={onAddToCart}
					disabled={availableStock <= 0}
					variant="outline"
					className="w-full sm:flex-1 h-10 border-primary text-primary hover:bg-primary/10 hover:text-primary"
				>
					<ShoppingCart className="size-4 mr-2" />
					{availableStock > 0
						? t("productDetails.addToCart")
						: t("productDetails.outOfStock") || "Out of Stock"}
				</Button>
			</div>
			<div className="flex gap-2 pt-1">
				<Button
					variant="outline"
					onClick={onToggleWishlist}
					disabled={isWishlistLoading}
					className={`flex-1 h-9 ${
						isWishlisted ? "text-destructive border-destructive" : ""
					}`}
					title={t("productDetails.wishlist") || "Add to wishlist"}
				>
					<Heart
						className={`size-3.5 mr-1.5 ${
							isWishlisted ? "fill-current" : ""
						}`}
					/>
					{t("productDetails.wishlist")}
				</Button>
				<Button
					variant="outline"
					onClick={onShare}
					title={t("productDetails.shareProduct") || "Share this product"}
					className="flex-1 h-9"
				>
					<Share2 className="size-3.5 mr-1.5" />
					{t("productDetails.share")}
				</Button>
			</div>
		</div>
	);
}
