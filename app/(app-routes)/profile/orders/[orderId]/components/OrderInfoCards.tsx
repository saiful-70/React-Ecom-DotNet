"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shared/ui/card";
import { MapPin, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OrderDetailsModel } from "@/(app-routes)/profile/orders/model";
import { Separator } from "@/components/shared/ui/separator";
import { formatText } from "@/lib/utils/utils";
import { Button } from "@/components/shared/ui/button";
import { useTransition } from "react";
import { initiateGatewayPayment } from "@/(app-routes)/checkout/action";
import { rememberPaypalHandoff } from "@/lib/utils/paypal-handoff";
import { toast } from "sonner";

type Props = { orderDetails: OrderDetailsModel };

// Payment methods that can be retried from the order page. COD has nothing to
// redirect to.
const PAYABLE_METHODS = ["stripe", "paypal"] as const;
type PayableMethod = (typeof PAYABLE_METHODS)[number];

const asPayableMethod = (raw: string | undefined): PayableMethod | null =>
	PAYABLE_METHODS.includes(raw as PayableMethod)
		? (raw as PayableMethod)
		: null;

export default function OrderInfoCards({ orderDetails }: Props) {
	const { t } = useTranslation();
	const [loading, startTransition] = useTransition();
	const payableMethod = asPayableMethod(orderDetails.payment_method);
	const handlePayNow = () => {
		if (!payableMethod) return;
		startTransition(async () => {
			const response = await initiateGatewayPayment(
				payableMethod,
				orderDetails.id
			);

			if (response.success && response.redirectUrl) {
				if (payableMethod === "paypal") {
					// No cart lines to settle on a retry — the order already
					// exists; only the ids the capture call needs are stored.
					rememberPaypalHandoff(
						orderDetails.id,
						response.paypalOrderId
					);
				}
				// External gateway URL: full navigation, not a router push.
				window.location.assign(response.redirectUrl);
			} else {
				toast.error(
					response.message ||
					t("orderDetails.stripeError") ||
					"Payment Error"
				);
			}
		});
	};
	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MapPin className="h-5 w-5" />
						{t("orderDetails.shippingAddress")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						{orderDetails.shipping_address ||
							t("orderDetails.addressNotAvailable")}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("orderDetails.paymentMethod")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-2">
						<CreditCard className="h-5 w-5 text-muted-foreground" />
						<span className="text-sm capitalize">
							{formatText(orderDetails.payment_method || "")}
						</span>
					</div>
					<Separator />
					<div className="flex items-center gap-2">
						{orderDetails.payment_status === "unpaid" ? (
							<div className="flex justify-between items-center w-full">
								<span className="text-base text-destructive font-semibold">
									{t("orderDetails.paymentStatus.unpaid")}
								</span>
								{payableMethod ? (
									<Button
										disabled={loading}
										onClick={handlePayNow}
									>
										{t("orderDetails.payNow")}
									</Button>
								) : null}
							</div>
						) : (
							<>
								<span className="text-sm text-success">
									{t("orderDetails.paymentStatus.paid")}
								</span>
							</>
						)}
					</div>
				</CardContent>
			</Card>
		</>
	);
}
