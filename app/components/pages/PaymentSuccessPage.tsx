"use client";

import { Button } from "@/components/shared/ui/button";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { CheckIcon, Loader2, PackageIcon } from "lucide-react";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getOrderPaymentStatus } from "@/(app-routes)/profile/orders/actions";

interface PaymentSuccessProps {
	orderId?: string | string[];
	orderTrackingNo?: string | string[];
	/** Set on a Stripe return: the page then waits for the webhook to mark the order paid. */
	sessionId?: string | string[];
}

const POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 1500;

type StripeState = "checking" | "paid" | "pending";

export function PaymentSuccess({ orderId, orderTrackingNo, sessionId }: PaymentSuccessProps) {
	const { t } = useTranslation();

	// Format order ID (take first if array)
	const orderIdString = Array.isArray(orderId) ? orderId[0] : orderId;
	const orderTrackingNoString = Array.isArray(orderTrackingNo) ? orderTrackingNo[0] : orderTrackingNo;
	const isStripeReturn = !!sessionId && !!orderIdString;
	const [stripeState, setStripeState] = useState<StripeState>("checking");

	// The Stripe return is informational; the webhook confirms payment and may
	// lag. Poll the order until it reads paid, then give up and say so.
	useEffect(() => {
		if (!isStripeReturn || !orderIdString) return;
		let cancelled = false;
		(async () => {
			for (let i = 0; i < POLL_ATTEMPTS && !cancelled; i++) {
				const status = await getOrderPaymentStatus(orderIdString).catch(() => null);
				if (cancelled) return;
				if (status === "paid") {
					setStripeState("paid");
					return;
				}
				await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
			}
			if (!cancelled) setStripeState("pending");
		})();
		return () => {
			cancelled = true;
		};
	}, [isStripeReturn, orderIdString]);

	const checking = isStripeReturn && stripeState === "checking";
	const title = !isStripeReturn
		? t("paymentSuccess.title")
		: stripeState === "paid"
			? t("paymentSuccess.paidTitle")
			: checking
				? t("paymentSuccess.confirming")
				: t("paymentSuccess.title");
	const description = !isStripeReturn
		? t("paymentSuccess.description")
		: stripeState === "paid"
			? t("paymentSuccess.paidDescription")
			: checking
				? null
				: t("paymentSuccess.stillProcessing");

	return (
		<div className=" flex items-center justify-center px-4 bg-muted/30">
			<div className="max-w-md w-full">
				<div className="pt-6 pb-8 px-6 text-center space-y-3">
					{/* Success Icon */}
					<div className="flex justify-center">
						{checking ? (
							<Loader2
								className="w-24 h-24 animate-spin text-primary"
								strokeWidth={1.5}
							/>
						) : (
							<div className="relative">
								<PackageIcon
									className="w-24 h-24 text-orange-500"
									strokeWidth={1.5}
								/>
								<div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
									<CheckIcon className="size-8 " />
								</div>
							</div>
						)}
					</div>

					{/* Order ID */}
					{orderTrackingNoString ? (
						<div className="flex items-center gap-2 justify-center text-base text-muted-foreground">
							<p>{t("paymentSuccess.orderId")}</p>
							<p className="font-semibold">{orderTrackingNoString}</p>
						</div>
					) : orderIdString ? (
						<div className="flex items-center gap-2 justify-center text-base text-muted-foreground">
							<p>{t("paymentSuccess.orderId")}</p>
							<p className="font-semibold">{orderIdString}</p>
						</div>
					) : null}

					{/* Success Title */}
					<div className="space-y-2">
						<h1 className="text-2xl font-bold text-foreground">
							{title}
						</h1>
						{description && (
							<p className="text-sm text-muted-foreground">
								{description}
							</p>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-3 pt-4">
						<Button asChild variant="outline" className="w-full sm:flex-1" size="lg">
							<Link href={ABSOLUTE_ROUTES.PRODUCTS}>
								{t("paymentSuccess.continueShopping")}
							</Link>
						</Button>
						{orderIdString ? (
							<Button asChild className="w-full sm:flex-1" size="lg">
								<Link href={ABSOLUTE_ROUTES.ORDER_DETAILS(orderIdString)}>
									{t("paymentSuccess.viewOrderDetails")}
								</Link>
							</Button>
						) : (
							<Button asChild className="w-full sm:flex-1" size="lg">
								<Link href={ABSOLUTE_ROUTES.ORDERS}>
									{t("paymentSuccess.trackOrder")}
								</Link>
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
