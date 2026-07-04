"use client";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { Button } from "@/components/shared/ui/button";
import { PackageIcon, XCircleIcon } from "lucide-react";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";

interface PaymentFailedProps {
	message?: string | string[];
	orderId?: string | string[];
	orderTrackingNo?: string | string[];
}

export default function PaymentFailed({ message, orderId, orderTrackingNo }: PaymentFailedProps) {
	const { t } = useTranslation();

	// Handle array case (if message comes as array from URL params)
	const errorMessage = Array.isArray(message) ? message[0] : message;
	const orderIdString = Array.isArray(orderId) ? orderId[0] : orderId;
	const orderTrackingNoString = Array.isArray(orderTrackingNo) ? orderTrackingNo[0] : orderTrackingNo;

	return (
		<div className="container mx-auto px-4 py-4 flex items-center justify-center ">
			<div className="max-w-md w-full px-8 text-center space-y-3">
				{/* Icon with Error Overlay */}
				<div className="flex justify-center">
					<div className="relative">
						<PackageIcon className="w-24 h-24 text-muted-foreground" />
						<XCircleIcon className="w-8 h-8 text-destructive absolute bottom-1 -right-1 bg-background rounded-full" />
					</div>
				</div>

				{/* Order ID (if available) */}
				{orderTrackingNoString ? (
					<div className="flex items-center gap-2 justify-center text-base text-muted-foreground">
						<p>{t("paymentFailed.orderId")}</p>
						<p className="font-semibold">{orderTrackingNoString}</p>
					</div>
				) : orderIdString ? (
					<div className="flex items-center gap-2 justify-center text-base text-muted-foreground">
						<p>{t("paymentFailed.orderId")}</p>
						<p className="font-semibold">{orderIdString}</p>
					</div>
				) : null}

				{/* Title */}
				<div className="space-y-2">
					<h1 className="text-2xl font-bold text-destructive">
						{t("paymentFailed.title")}
					</h1>
					<p className="text-muted-foreground">
						{t("paymentFailed.description")}
					</p>
				</div>

				{/* Error Message */}
				{errorMessage ? (
					<div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2">
						<p className="text-sm font-medium text-destructive">
							{t("paymentFailed.errorMessage")}
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							{errorMessage}
						</p>
					</div>
				) : null}

				{/* Additional Info */}
				<p className="text-sm text-muted-foreground">
					{t("paymentFailed.detailInfo")}
				</p>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-3 pt-4">
					<Button asChild variant="outline" className="w-full sm:flex-1" size="lg">
						<Link href={ABSOLUTE_ROUTES.PRODUCTS}>
							{t("paymentFailed.continueShopping")}
						</Link>
					</Button>
					{orderIdString ? (
						<Button asChild className="w-full sm:flex-1" size="lg">
							<Link href={ABSOLUTE_ROUTES.ORDER_DETAILS(orderIdString)}>
								{t("paymentFailed.viewOrderDetails")}
							</Link>
						</Button>
					) : (
						<Button asChild className="w-full sm:flex-1" size="lg">
							<Link href={ABSOLUTE_ROUTES.ORDERS}>
								{t("paymentFailed.viewOrders")}
							</Link>
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
