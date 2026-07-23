"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { calculateCartTax } from "@/lib/utils/tax-calculator";
import type { BundleCartComponent } from "@/lib/bundles/types";

export interface CartItem {
	id: number;
	name: string;
	price: number;
	image: string;
	quantity: number;
	variant_id?: number;
	stock?: number;
	tax?: number; // Individual item tax
	tax_type?: "include" | "exclude"; // Whether tax is included or excluded
	variant?: {
		color?: string;
		size?: string;
	};
	// --- Bundle/combo lines ---
	// A selected bundle tier is stored as ONE line. It reuses `variant_id`
	// (set to `bundle_tier_id`) as its cart-identity key so the existing
	// id+variant_id matching keeps tiers distinct without a reducer change.
	// `price` is the tier's server-authoritative total; `quantity` is the set
	// count. These fields carry the composition forward for the future order
	// payload (see the bundle API contract) — checkout is unchanged for now.
	bundle_id?: number;
	bundle_tier_id?: number;
	bundle_components?: BundleCartComponent[];
	// Combo slug for the bundle this line represents, so cart UI can deep-link
	// to `/combo/<slug>` instead of a product details page (bundle lines use
	// `id: bundle.id`, which is not a product id).
	bundle_slug?: string;
}

interface CartState {
	items: CartItem[];
	total: number;
	itemCount: number;
	subtotal: number;
	tax: number;
	taxType?: "include" | "exclude"; // Track tax type from items
}

interface CartContextType extends CartState {
	addToCart: (
		item: Omit<CartItem, "quantity"> & { quantity?: number }
	) => void;
	removeFromCart: (
		id: number,
		variant_id?: number,
		bundle_tier_id?: number
	) => void;
	updateQuantity: (
		id: number,
		quantity: number,
		variant_id?: number,
		bundle_tier_id?: number
	) => void;
	clearCart: () => void;
}

type CartAction =
	| {
			type: "ADD_TO_CART";
			payload: Omit<CartItem, "quantity"> & { quantity?: number };
	  }
	| {
			type: "REMOVE_FROM_CART";
			payload: { id: number; variant_id?: number; bundle_tier_id?: number };
	  }
	| {
			type: "UPDATE_QUANTITY";
			payload: {
				id: number;
				variant_id?: number;
				bundle_tier_id?: number;
				quantity: number;
			};
	  }
	| { type: "CLEAR_CART" }
	| { type: "LOAD_CART"; payload: CartItem[] };

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
	switch (action.type) {
		case "ADD_TO_CART": {
			const isBundleLine = action.payload.bundle_tier_id != null;
			const existingItem = state.items.find(
				(item) =>
					item.id === action.payload.id &&
					((action.payload.variant_id &&
						item.variant_id === action.payload.variant_id) ||
						(!action.payload.variant_id && !item.variant_id)) &&
					item.bundle_tier_id === action.payload.bundle_tier_id
			);

			const quantityToAdd = isBundleLine
				? 1
				: action.payload.quantity || 1;

			let newItems: CartItem[];
			if (existingItem) {
				newItems = state.items.map((item) =>
					item.id === action.payload.id &&
					((action.payload.variant_id &&
						item.variant_id === action.payload.variant_id) ||
						(!action.payload.variant_id && !item.variant_id)) &&
					item.bundle_tier_id === action.payload.bundle_tier_id
						? {
								...item,
								quantity: isBundleLine
									? 1
									: item.quantity + quantityToAdd,
						  }
						: item
				);
			} else {
				const { ...payloadWithoutQuantity } = action.payload;
				newItems = [
					...state.items,
					{ ...payloadWithoutQuantity, quantity: quantityToAdd },
				];
			}

			// Calculate tax from items
			const taxCalculation = calculateCartTax(newItems);
			const itemCount = newItems.reduce(
				(sum, item) => sum + item.quantity,
				0
			);
			// Track tax type from first item (assumes all items have same tax type)
			const taxType = newItems[0]?.tax_type || "exclude";

			return {
				items: newItems,
				total: taxCalculation.total,
				itemCount,
				subtotal: taxCalculation.subtotal,
				tax: taxCalculation.tax,
				taxType,
			};
		}

		case "REMOVE_FROM_CART": {
			const newItems = state.items.filter(
				(item) =>
					!(
						item.id === action.payload.id &&
						((action.payload.variant_id &&
							item.variant_id === action.payload.variant_id) ||
							(!action.payload.variant_id && !item.variant_id)) &&
						item.bundle_tier_id === action.payload.bundle_tier_id
					)
			);

			// Calculate tax from items
			const taxCalculation = calculateCartTax(newItems);
			const itemCount = newItems.reduce(
				(sum, item) => sum + item.quantity,
				0
			);
			// Track tax type from first item
			const taxType = newItems[0]?.tax_type || "exclude";

			return {
				items: newItems,
				total: taxCalculation.total,
				itemCount,
				subtotal: taxCalculation.subtotal,
				tax: taxCalculation.tax,
				taxType,
			};
		}

		case "UPDATE_QUANTITY": {
			const newItems = state.items.map((item) =>
				item.id === action.payload.id &&
				((action.payload.variant_id &&
					item.variant_id === action.payload.variant_id) ||
					(!action.payload.variant_id && !item.variant_id)) &&
				item.bundle_tier_id === action.payload.bundle_tier_id
					? {
							...item,
							quantity:
								item.bundle_tier_id != null
									? 1
									: Math.min(
											action.payload.quantity,
											item.stock || action.payload.quantity
										),
					  }
					: item
			);

			// Calculate tax from items
			const taxCalculation = calculateCartTax(newItems);
			const itemCount = newItems.reduce(
				(sum, item) => sum + item.quantity,
				0
			);
			// Track tax type from first item
			const taxType = newItems[0]?.tax_type || "exclude";

			return {
				items: newItems,
				total: taxCalculation.total,
				itemCount,
				subtotal: taxCalculation.subtotal,
				tax: taxCalculation.tax,
				taxType,
			};
		}

		case "CLEAR_CART":
			return {
				items: [],
				total: 0,
				itemCount: 0,
				subtotal: 0,
				tax: 0,
				taxType: "exclude",
			};

		case "LOAD_CART": {
			// Clamp stale bundle lines to quantity 1 (invariant: bundle_tier_id != null => quantity === 1)
			const newItems = action.payload.map((item) =>
				item.bundle_tier_id != null && item.quantity !== 1
					? { ...item, quantity: 1 }
					: item
			);

			// Calculate tax from items
			const taxCalculation = calculateCartTax(newItems);
			const itemCount = newItems.reduce(
				(sum, item) => sum + item.quantity,
				0
			);
			// Track tax type from first item
			const taxType = newItems[0]?.tax_type || "exclude";

			return {
				items: newItems,
				total: taxCalculation.total,
				itemCount,
				subtotal: taxCalculation.subtotal,
				tax: taxCalculation.tax,
				taxType,
			};
		}

		default:
			return state;
	}
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(cartReducer, {
		items: [],
		total: 0,
		itemCount: 0,
		subtotal: 0,
		tax: 0,
		taxType: "exclude",
	});

	const [isLoaded, setIsLoaded] = React.useState(false);

	// Load cart from localStorage on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			try {
				const savedCart = localStorage.getItem("cart");
				if (savedCart) {
					const cartItems = JSON.parse(savedCart);
					dispatch({ type: "LOAD_CART", payload: cartItems });
				}
			} catch (error) {
				console.error("Error loading cart from localStorage:", error);
			} finally {
				setIsLoaded(true);
			}
		}
	}, []);

	// Save cart to localStorage whenever it changes (only after initial load)
	useEffect(() => {
		if (isLoaded && typeof window !== "undefined") {
			try {
				localStorage.setItem("cart", JSON.stringify(state.items));
			} catch (error) {
				console.error("Error saving cart to localStorage:", error);
			}
		}
	}, [state.items, isLoaded]);

	// Cross-tab sync: reload the cart when another tab writes it.
	useEffect(() => {
		const onStorage = (event: StorageEvent) => {
			if (event.key !== "cart") return;
			try {
				const cartItems = JSON.parse(event.newValue || "[]");
				if (Array.isArray(cartItems)) {
					dispatch({ type: "LOAD_CART", payload: cartItems });
				}
			} catch (error) {
				console.error("Error syncing cart from another tab:", error);
			}
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	const addToCart = (
		item: Omit<CartItem, "quantity"> & { quantity?: number }
	) => {
		dispatch({ type: "ADD_TO_CART", payload: item });
	};

	const removeFromCart = (
		id: number,
		variant_id?: number,
		bundle_tier_id?: number
	) => {
		dispatch({
			type: "REMOVE_FROM_CART",
			payload: { id, variant_id, bundle_tier_id },
		});
	};

	const updateQuantity = (
		id: number,
		quantity: number,
		variant_id?: number,
		bundle_tier_id?: number
	) => {
		dispatch({
			type: "UPDATE_QUANTITY",
			payload: { id, quantity, variant_id, bundle_tier_id },
		});
	};

	const clearCart = () => {
		dispatch({ type: "CLEAR_CART" });
	};

	const value: CartContextType = {
		...state,
		addToCart,
		removeFromCart,
		updateQuantity,
		clearCart,
	};

	return (
		<CartContext.Provider value={value}>{children}</CartContext.Provider>
	);
};

export const useCart = (): CartContextType => {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
};
