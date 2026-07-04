"use client";

import { Button } from "@/components/shared/ui/button";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { CheckIcon, PackageIcon } from "lucide-react";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useTranslation } from "react-i18next";

interface PaymentSuccessProps {
	orderId?: string | string[];
	orderTrackingNo?: string | string[];
}

export function PaymentSuccess({ orderId, orderTrackingNo }: PaymentSuccessProps) {
	const { t } = useTranslation();

	// Format order ID (take first if array)
	const orderIdString = Array.isArray(orderId) ? orderId[0] : orderId;
	const orderTrackingNoString = Array.isArray(orderTrackingNo) ? orderTrackingNo[0] : orderTrackingNo;

	return (
		<div className=" flex items-center justify-center px-4 bg-muted/30">
			<div className="max-w-md w-full">
				<div className="pt-6 pb-8 px-6 text-center space-y-3">
					{/* Success Icon */}
					<div className="flex justify-center">
						<div className="relative">
							<PackageIcon
								className="w-24 h-24 text-orange-500"
								strokeWidth={1.5}
							/>
							<div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
								<CheckIcon className="size-8 " />
							</div>
						</div>
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
							{t("paymentSuccess.title")}
						</h1>
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">
								{t("paymentSuccess.description")}
							</p>
							{/* <p className="text-sm text-muted-foreground">
								{t("paymentSuccess.detailInfo")}
							</p> */}
						</div>
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
