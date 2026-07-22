"use client";

import {
	createPurchaseOrder,
	getCheckoutData,
} from "@/(app-routes)/checkout/action";
import { validateBundle } from "@/(app-routes)/combo/action";
import type {
	FormData,
	FormErrors,
	CheckoutDataProduct,
} from "@/(app-routes)/checkout/model";
import type { BundleValidationMap } from "@/(app-routes)/checkout/helpers/checkout-helpers";
import {
	hasFormErrors,
	validateFormData,
	validateInternationalFormData,
} from "@/(app-routes)/checkout/model";
import { Button } from "@/components/shared/ui/button";
import { toast } from "@/components/shared/ui/sonner";
import { useCart } from "@/contexts/CartContext";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { useAtomValue } from "jotai";
import { ArrowLeft } from "lucide-react";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	BUY_NOW_ID_PARAM,
	BUY_NOW_VARIANT_PARAM,
	matchesBuyNowScope,
} from "@/lib/utils/buy-now";

import { OrderSummary } from "../../(app-routes)/checkout/components/OrderSummary";
import { ShippingAddressForm } from "../../(app-routes)/checkout/components/ShippingAddressForm";
import { GlobalShippingAddressForm } from "../../(app-routes)/checkout/components/GlobalShippingAddressForm";
import {
	prepareOrderData,
	toLocalBDPhone,
} from "../../(app-routes)/checkout/helpers/checkout-helpers";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { getDeliveryCharge, getGlobalDeliveryCharge } from "@/lib/constants/delivery";
import { useVariant } from "@/components/shared/providers/variant-provider";
import { findCountry, DEFAULT_COUNTRY_CODE } from "@/lib/data/countries";

export function CheckoutPage() {
	const { t } = useTranslation();
	const [isProcessing, setIsProcessing] = useState(false);
	// Once the order succeeds we navigate to the success page; this flag keeps
	// the "empty cart" guard from flashing while the cart is cleared mid-redirect.
	const [orderPlaced, setOrderPlaced] = useState(false);
	const [formErrors, setFormErrors] = useState<FormErrors>({});
	const [isLoadingPrices, setIsLoadingPrices] = useState(true);
	const [serverPrices, setServerPrices] = useState<CheckoutDataProduct[]>([]);
	const [bundleValidations, setBundleValidations] =
		useState<BundleValidationMap>({});
	const { items: cartItems, clearCart, removeFromCart } = useCart();

	// "Buy Now" checkout is scoped to a single cart line via ?only=<id>&ov=<variant>.
	// When scoped, everything below (display, pricing, order payload, post-order
	// cleanup) operates on just that line; the rest of the cart is untouched.
	const searchParams = useSearchParams();
	const onlyId = searchParams.get(BUY_NOW_ID_PARAM);
	const onlyVariant = searchParams.get(BUY_NOW_VARIANT_PARAM);
	const items = useMemo(
		() =>
			onlyId
				? cartItems.filter((i) =>
						matchesBuyNowScope(i, onlyId, onlyVariant)
				  )
				: cartItems,
		[cartItems, onlyId, onlyVariant]
	);

	// Bundle lines (carry a tier) validate server-side; normal lines re-price via
	// checkout-data. Split once so both paths stay independent.
	const bundleLines = useMemo(
		() => items.filter((i) => i.bundle_tier_id != null),
		[items]
	);
	const normalLines = useMemo(
		() => items.filter((i) => i.bundle_tier_id == null),
		[items]
	);
	const router = useRouter();
	const miniProfile = useAtomValue(miniProfileAtom);
	// The global template uses the international checkout (country selector,
	// international phone, flat shipping); other variants keep the BD flow.
	const variant = useVariant();
	const isGlobal = variant.template === "global";

	const [formData, setFormData] = useState<FormData>({
		name: miniProfile?.name || "",
		phone: isGlobal
			? miniProfile?.phone || ""
			: toLocalBDPhone(miniProfile?.phone || ""),
		address: "",
		city: "",
		cityId: undefined,
		country: isGlobal
			? findCountry(DEFAULT_COUNTRY_CODE)?.name ?? ""
			: undefined,
		zip: isGlobal ? "" : undefined,
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

	// Validate every bundle line against the backend (server-authoritative
	// pricing + a short-lived quote). Returns the results keyed by tier id.
	const runBundleValidations = async (
		cityId?: number
	): Promise<{
		map: BundleValidationMap;
		allValid: boolean;
		firstError?: string;
	}> => {
		const requests = bundleLines.map((line) => ({
			bundle_id: line.bundle_id as number,
			bundle_tier_id: line.bundle_tier_id as number,
			city_id: cityId ?? null,
			shipping_type: "home_delivery",
			items: (line.bundle_components ?? []).map((c) => ({
				product_id: c.product_id,
				variant_id: c.variant_id ?? null,
				qty: c.qty,
			})),
		}));

		const results = await Promise.all(requests.map((r) => validateBundle(r)));

		const map: BundleValidationMap = {};
		let allValid = true;
		let firstError: string | undefined;
		results.forEach((res, i) => {
			if (res) map[requests[i].bundle_tier_id] = res;
			if (!res || !res.is_valid) {
				allValid = false;
				firstError = res?.errors?.[0]?.message ?? firstError;
			}
		});
		return { map, allValid, firstError };
	};

	useEffect(() => {
		const fetchCheckoutData = async () => {
			if (items.length === 0) {
				setIsLoadingPrices(false);
				return;
			}

			setIsLoadingPrices(true);
			try {
				// Only real products go to checkout-data; bundle ids aren't products.
				if (normalLines.length > 0) {
					const requestItems = normalLines.map((item) => ({
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
				}

				if (bundleLines.length > 0) {
					const { map } = await runBundleValidations(formData.cityId);
					setBundleValidations(map);
				}
			} catch (error) {
				console.error("Error fetching checkout data:", error);
			} finally {
				setIsLoadingPrices(false);
			}
		};

		fetchCheckoutData();
	}, [items, formData.cityId]);

	// Normal lines re-price via checkout-data; bundle lines use the validated
	// server pricing (falling back to the server-read tier price before validate
	// resolves). Prices shown are server-authoritative — never client-computed.
	const calculatedSubtotal = useMemo(() => {
		const normal = normalLines.reduce((total, item) => {
			const sp = serverPrices.find(
				(s) =>
					s.product_id === item.id &&
					s.variant_id === (item.variant_id || 0)
			);
			return total + (sp ? sp.discount_price : item.price) * item.quantity;
		}, 0);
		const bundle = bundleLines.reduce((total, line) => {
			const v = line.bundle_tier_id
				? bundleValidations[line.bundle_tier_id]
				: undefined;
			return total + (v?.pricing?.price ?? line.price * line.quantity);
		}, 0);
		return normal + bundle;
	}, [serverPrices, bundleValidations, normalLines, bundleLines]);

	const calculatedTax = useMemo(() => {
		const normal = normalLines.reduce((total, item) => {
			const sp = serverPrices.find(
				(s) =>
					s.product_id === item.id &&
					s.variant_id === (item.variant_id || 0)
			);
			if (sp) {
				const pct = parseFloat(sp.tax);
				return total + (sp.discount_price * item.quantity * pct) / 100;
			}
			return total + (item.tax || 0) * item.quantity;
		}, 0);
		const bundle = bundleLines.reduce((total, line) => {
			const v = line.bundle_tier_id
				? bundleValidations[line.bundle_tier_id]
				: undefined;
			return total + (v?.pricing?.tax ?? 0);
		}, 0);
		return normal + bundle;
	}, [serverPrices, bundleValidations, normalLines, bundleLines]);

	// For a bundle-only order, use the validated (perk-aware) shipping; otherwise
	// keep the client delivery-charge calc for the normal-item order.
	const bundleShippingReady =
		bundleLines.length > 0 &&
		bundleLines.every(
			(l) => l.bundle_tier_id != null && bundleValidations[l.bundle_tier_id]?.pricing
		);
	const bundleShipping = bundleLines.reduce((sum, line) => {
		const v = line.bundle_tier_id
			? bundleValidations[line.bundle_tier_id]
			: undefined;
		return sum + (v?.pricing?.shipping ?? 0);
	}, 0);

	const finalShipping =
		bundleLines.length > 0 && normalLines.length === 0 && bundleShippingReady
			? bundleShipping
			: isGlobal
				? getGlobalDeliveryCharge(calculatedSubtotal)
				: formData.city
					? getDeliveryCharge(formData.city)
					: 0;

	const calculatedTotal = calculatedSubtotal + calculatedTax + finalShipping;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const errors = isGlobal
			? validateInternationalFormData(formData)
			: validateFormData(formData);
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
			// Re-validate bundle lines for a fresh quote (quotes expire ~15 min);
			// block checkout if the server rejects the composition/stock.
			let validations = bundleValidations;
			if (bundleLines.length > 0) {
				const { map, allValid, firstError } = await runBundleValidations(
					formData.cityId
				);
				if (!allValid) {
					toast.error(t("bundle.validationFailed"), {
						description:
							firstError || t("bundle.validationFailedDescription"),
					});
					return;
				}
				validations = map;
				setBundleValidations(map);
			}

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
				international: isGlobal,
				bundleValidations: validations,
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
				// A scoped "Buy Now" order clears only its own line, leaving the
				// rest of the cart intact; a full checkout clears everything.
				if (onlyId) {
					items.forEach((i) => removeFromCart(i.id, i.variant_id));
				} else {
					clearCart();
				}
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
						{isGlobal ? (
							<GlobalShippingAddressForm
								formData={formData}
								onInputChange={handleInputChange}
								errors={formErrors}
							/>
						) : (
							<ShippingAddressForm
								formData={formData}
								onInputChange={handleInputChange}
								errors={formErrors}
							/>
						)}
					</div>

					<div>
						<OrderSummary
							items={items}
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
