"use client";

import { capturePaypalPayment } from "@/(app-routes)/checkout/action";
import { useCart } from "@/contexts/CartContext";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import {
	clearPaypalHandoff,
	readPaypalHandoff,
} from "@/lib/utils/paypal-handoff";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

/**
 * PayPal return hop.
 *
 * PayPal only AUTHORISES the payment when the buyer approves — the funds are
 * taken by `POST /payments/paypal/capture`, which the frontend is responsible
 * for calling. This page runs that capture once, then forwards to the shared
 * payment-success / payment-failed pages.
 *
 * The backend's PayPal return_url must point here (or redirect here). Query
 * params are read defensively: PayPal's own return carries `token` (the PayPal
 * order id) and `PayerID`, while a backend-mediated return may forward
 * `order_id` / `paypal_order_id` instead.
 */
export default function PaypalReturn() {
	const { t } = useTranslation();
	const router = useRouter();
	const searchParams = useSearchParams();
	const { items: cartItems, removeFromCart, updateQuantity } = useCart();
	// Capture must fire exactly once — a double call would be a second charge
	// attempt, and React strict mode double-invokes effects in development.
	const captured = useRef(false);
	// Read through a ref so cart churn can't re-trigger the effect.
	const cartRef = useRef(cartItems);
	cartRef.current = cartItems;

	useEffect(() => {
		if (captured.current) return;
		captured.current = true;

		const stored = readPaypalHandoff();

		const paramOrderId = Number(searchParams.get("order_id"));
		const orderId = Number.isFinite(paramOrderId) && paramOrderId > 0
			? paramOrderId
			: stored?.orderId;

		const paypalOrderId =
			searchParams.get("paypal_order_id") ||
			searchParams.get("token") ||
			stored?.paypalOrderId ||
			undefined;

		const fail = (message: string) => {
			clearPaypalHandoff();
			router.replace(
				`${ABSOLUTE_ROUTES.PAYMENT_FAILED}?message=${encodeURIComponent(
					message
				)}${orderId != null ? `&order_id=${orderId}` : ""}`
			);
		};

		if (orderId == null && !paypalOrderId) {
			fail(
				t("checkout.paypalMissingReference") ||
					"We could not identify this PayPal payment."
			);
			return;
		}

		capturePaypalPayment({ orderId, paypalOrderId })
			.then((result) => {
				if (!result.success) {
					fail(
						result.message ||
							t("checkout.paypalCaptureFailed") ||
							"PayPal payment could not be completed."
					);
					return;
				}

				// Paid — remove exactly the lines this order covered. A Buy Now
				// order only consumed part of a line, so subtract rather than
				// delete outright.
				for (const line of stored?.lines ?? []) {
					const existing = cartRef.current.find(
						(item) =>
							item.id === line.id &&
							item.variant_id === line.variantId &&
							item.bundle_tier_id === line.bundleTierId
					);
					const remaining = existing
						? existing.quantity - line.quantity
						: 0;
					if (remaining > 0) {
						updateQuantity(
							line.id,
							remaining,
							line.variantId,
							line.bundleTierId
						);
					} else {
						removeFromCart(line.id, line.variantId, line.bundleTierId);
					}
				}

				clearPaypalHandoff();

				const data = result.data ?? {};
				const orderRef =
					data.order_tracking_number ||
					data.order_number ||
					(orderId != null ? String(orderId) : "");
				router.replace(ABSOLUTE_ROUTES.PAYMENT_SUCCESS(orderRef));
			})
			.catch(() => {
				fail(
					t("checkout.paypalCaptureFailed") ||
						"PayPal payment could not be completed."
				);
			});
		// Intentionally runs once on mount; every dependency is read via refs
		// or is stable for the lifetime of this page.
	}, []);

	return (
		<main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
			<Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
			<h1 className="text-xl font-semibold">
				{t("checkout.paypalCapturing") || "Confirming your payment…"}
			</h1>
			<p className="mt-2 max-w-sm text-sm text-muted-foreground">
				{t("checkout.paypalCapturingDescription") ||
					"Please keep this page open. Do not close the browser or press back."}
			</p>
		</main>
	);
}
