"use client";

import { useCart } from "@/contexts/CartContext";
import { toast } from "@/components/shared/ui/sonner";
import { useTranslation } from "react-i18next";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import {
	EmptyCart,
	CartHeader,
	CartItem,
	OrderSummary,
	type CartItemData,
} from "@/components/cart";
import { useState, useEffect } from "react";

export function CartPage() {
	const { t } = useTranslation();
	const router = useRouter();
	const [isHydrated, setIsHydrated] = useState(false);
	const {
		items,
		total,
		subtotal,
		itemCount,
		removeFromCart,
		updateQuantity,
		clearCart,
		tax,
	} = useCart();

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	const handleRemoveItem = (id: string, variant_id?: number) => {
		const item = items.find((item) => item.id.toString() === id);
		removeFromCart(parseInt(id), variant_id);
		if (item) {
			toast.success(t("cart.itemRemoved") || "Item removed", {
				description: `${item.name} ${
					t("cart.itemRemovedDescription") ||
					"has been removed from your cart."
				}`,
			});
		}
	};

	const handleClearCart = () => {
		clearCart();
		toast.success(t("cart.cartCleared") || "Cart cleared", {
			description:
				t("cart.cartClearedDescription") ||
				"All items have been removed from your cart.",
		});
	};

	const handleQuantityChange = (
		id: string,
		newQuantity: number,
		variant_id?: number
	) => {
		updateQuantity(parseInt(id), newQuantity, variant_id);
	};

	// Convert cart items to CartItemData format
	const cartItems: CartItemData[] = items.map((item) => {
		return {
			id: item.id.toString(),
			name: item.name,
			image: item.image,
			price: item.price,
			quantity: item.quantity,
			variant_id: item.variant_id,
		};
	});

	const handleProductClick = (id: string) => {
		router.push(ABSOLUTE_ROUTES.PRODUCT_DETAILS(id));
	};

	// Prevent hydration mismatch by only rendering after hydration
	if (!isHydrated) {
		return (
			<main className="container mx-auto px-4 py-16">
				<div className="flex items-center justify-center min-h-screen">
					<p className="text-muted-foreground">
						{t("common.loading") || "Loading..."}
					</p>
				</div>
			</main>
		);
	}

	if (items.length === 0) {
		return (
			<main className="container mx-auto px-4 py-16">
				<EmptyCart />
			</main>
		);
	}

	return (
		<main className="container mx-auto px-4 py-8">
			<CartHeader itemCount={itemCount} onClearCart={handleClearCart} />

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
				<div className="lg:col-span-2 space-y-4">
					{cartItems.map((item) => (
						<CartItem
							key={item.name}
							item={item}
							onRemove={handleRemoveItem}
							onUpdateQuantity={handleQuantityChange}
							onProductClick={handleProductClick}
						/>
					))}
				</div>

				<div className="lg:col-span-1">
					<OrderSummary subtotal={subtotal} tax={tax} total={total} />
				</div>
			</div>
		</main>
	);
}
