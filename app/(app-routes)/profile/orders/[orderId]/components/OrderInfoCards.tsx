"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shared/ui/card";
import { MapPin, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OrderDetailsModel } from "../../model";
import { Separator } from "@/components/shared/ui/separator";
import { formatText } from "@/lib/utils/utils";
import { Button } from "@/components/shared/ui/button";
import { useTransition } from "react";
import { getStripeRedirectLink } from "@/(app-routes)/checkout/action";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { toast } from "sonner";

type Props = { orderDetails: OrderDetailsModel };

export default function OrderInfoCards({ orderDetails }: Props) {
	const { t } = useTranslation();
	const [loading, startTransition] = useTransition();
	const router = useRouter();
	const handlePayNow = () => {
		startTransition(async () => {
			const response = await getStripeRedirectLink(
				orderDetails.id
			);


			if (response.success) {
				router.push(response.data);
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
								{orderDetails.payment_method === "stripe" ? (
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
