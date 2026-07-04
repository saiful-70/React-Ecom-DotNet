"use client";

import {
	createPurchaseOrder,
	getCheckoutData,
} from "@/(app-routes)/checkout/action";
import type {
	FormData,
	FormErrors,
	CheckoutDataProduct,
} from "@/(app-routes)/checkout/model";
import { hasFormErrors, validateFormData } from "@/(app-routes)/checkout/model";
import { Button } from "@/components/shared/ui/button";
import { toast } from "@/components/shared/ui/sonner";
import { useCart } from "@/contexts/CartContext";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { useAtomValue } from "jotai";
import { ArrowLeft } from "lucide-react";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { OrderSummary } from "../../(app-routes)/checkout/components/OrderSummary";
import { ShippingAddressForm } from "../../(app-routes)/checkout/components/ShippingAddressForm";
import {
	prepareOrderData,
	toLocalBDPhone,
} from "../../(app-routes)/checkout/helpers/checkout-helpers";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { getDeliveryCharge } from "@/lib/constants/delivery";

export function CheckoutPage() {
	const { t } = useTranslation();
	const [isProcessing, setIsProcessing] = useState(false);
	// Once the order succeeds we navigate to the success page; this flag keeps
	// the "empty cart" guard from flashing while the cart is cleared mid-redirect.
	const [orderPlaced, setOrderPlaced] = useState(false);
	const [formErrors, setFormErrors] = useState<FormErrors>({});
	const [isLoadingPrices, setIsLoadingPrices] = useState(true);
	const [serverPrices, setServerPrices] = useState<CheckoutDataProduct[]>([]);
	const { items, clearCart, subtotal, tax } = useCart();
	const router = useRouter();
	const miniProfile = useAtomValue(miniProfileAtom);

	const [formData, setFormData] = useState<FormData>({
		name: miniProfile?.name || "",
		phone: toLocalBDPhone(miniProfile?.phone || ""),
		address: "",
		city: "",
		cityId: undefined,
	});

	const handleInputChange = (
		field: keyof FormData,
		value: string | number
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (formErrors[field as keyof FormErrors]) {
			setFormErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	useEffect(() => {
		const fetchCheckoutData = async () => {
			if (items.length === 0) {
				setIsLoadingPrices(false);
				return;
			}

			setIsLoadingPrices(true);
			try {
				const requestItems = items.map((item) => ({
					product_id: item.id,
					...(item.variant_id && { variant_id: item.variant_id }),
				}));

				const response = await getCheckoutData(requestItems);

				if (response.success && response.data?.products) {
					setServerPrices(response.data.products);
				} else {
					console.warn(
						"Failed to fetch checkout data, using client-side prices"
					);
				}
			} catch (error) {
				console.error("Error fetching checkout data:", error);
			} finally {
				setIsLoadingPrices(false);
			}
		};

		fetchCheckoutData();
	}, [items]);

	const finalShipping = formData.city ? getDeliveryCharge(formData.city) : 0;

	const calculatedSubtotal = useMemo(() => {
		if (serverPrices.length > 0) {
			return items.reduce((total, item) => {
				const serverPrice = serverPrices.find(
					(sp) =>
						sp.product_id === item.id &&
						sp.variant_id === (item.variant_id || 0)
				);
				if (serverPrice) {
					return total + serverPrice.discount_price * item.quantity;
				}
				return total + item.price * item.quantity;
			}, 0);
		}
		return subtotal;
	}, [serverPrices, items, subtotal]);

	const calculatedTax = useMemo(() => {
		if (serverPrices.length > 0) {
			return items.reduce((total, item) => {
				const serverPrice = serverPrices.find(
					(sp) =>
						sp.product_id === item.id &&
						sp.variant_id === (item.variant_id || 0)
				);
				if (serverPrice) {
					const taxPercentage = parseFloat(serverPrice.tax);
					const itemTotal = serverPrice.discount_price * item.quantity;
					return total + (itemTotal * taxPercentage) / 100;
				}
				return total + (item.tax || 0) * item.quantity;
			}, 0);
		}
		return tax;
	}, [serverPrices, items, tax]);

	const calculatedTotal = calculatedSubtotal + calculatedTax + finalShipping;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const errors = validateFormData(formData);
		if (hasFormErrors(errors)) {
			setFormErrors(errors);
			toast.error(t("checkout.validationError"), {
				description: t("checkout.pleaseFixErrors"),
			});
			return;
		}

		if (!items || items.length === 0) {
			toast.error(t("checkout.validationError"), {
				description: t("checkout.emptyCartDescription"),
			});
			return;
		}

		setIsProcessing(true);

		try {
			const orderData = prepareOrderData({
				formData,
				cartItems: items,
				cartTotals: {
					subtotal: calculatedSubtotal,
					tax: calculatedTax,
					shipping: finalShipping,
				},
				shippingMethod: "standard",
				serverPrices: serverPrices.length > 0 ? serverPrices : undefined,
			});

			const response = await createPurchaseOrder(orderData);
			if (response.success && response.data) {
				// Mark as placed first so clearing the cart doesn't render the
				// empty-checkout state before the success-page navigation lands.
				setOrderPlaced(true);

				toast.success(t("checkout.orderPlacedSuccess"), {
					description: `${
						response.data?.order_number ||
						response.data?.order_id ||
						response.data?.order_tracking_number ||
						"N/A"
					} - ${t("checkout.orderPlacedDescription")}`,
				});
				router.push(
					ABSOLUTE_ROUTES.PAYMENT_SUCCESS(
						response.data?.order_tracking_number || ""
					)
				);
				clearCart();
			} else {
				toast.error(t("checkout.orderFailed"), {
					description:
						response.error || t("checkout.orderFailedDescription"),
				});
			}
		} catch (error) {
			console.error("Checkout error:", error);
			toast.error(t("checkout.error"), {
				description: t("checkout.unexpectedError"),
			});
		} finally {
			setIsProcessing(false);
		}
	};

	// While redirecting to the success page (cart just cleared), render nothing
	// instead of the empty-checkout state.
	if (orderPlaced) {
		return null;
	}

	if (items.length === 0) {
		return (
			<main className="container mx-auto px-4 py-16">
				<div className="text-center max-w-md mx-auto">
					<h1 className="text-2xl font-bold mb-2">
						{t("checkout.noItemsToCheckout")}
					</h1>
					<p className="text-muted-foreground mb-6">
						{t("checkout.emptyCartDescription")}
					</p>
					<Button asChild>
						<Link href="/products">
							{t("checkout.continueShopping")}
						</Link>
					</Button>
				</div>
			</main>
		);
	}

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
				<Link href="/cart" className="hover:text-foreground">
					{t("checkout.cart")}
				</Link>
				<span>/</span>
				<span className="text-foreground">{t("checkout.title")}</span>
			</div>

			<Button variant="ghost" className="mb-6" asChild>
				<Link href="/cart">
					<ArrowLeft className="w-4 h-4 mr-2" />
					{t("checkout.backToCart")}
				</Link>
			</Button>

			<form onSubmit={handleSubmit}>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div className="space-y-6">
						<ShippingAddressForm
							formData={formData}
							onInputChange={handleInputChange}
							errors={formErrors}
						/>
					</div>

					<div>
						<OrderSummary
							isProcessing={isProcessing}
							onSubmit={() => {}}
							shippingCost={finalShipping}
							subtotal={calculatedSubtotal}
							tax={calculatedTax}
							total={calculatedTotal}
							isFormValid={!hasFormErrors(formErrors)}
							isLoadingPrices={isLoadingPrices}
						/>
					</div>
				</div>
			</form>
		</main>
	);
}
