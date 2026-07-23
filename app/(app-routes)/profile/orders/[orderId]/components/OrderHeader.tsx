"use client";

import { Badge } from "@/components/shared/ui/badge";
import Price from "@/components/shared/Price";
import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OrderDetailsModel } from "@/(app-routes)/profile/orders/model";
import { getBadgeVariant } from "@/lib/utils/utils";

type Props = {
	orderDetails: OrderDetailsModel;
};

export default function OrderHeader({ orderDetails }: Props) {
	const { t } = useTranslation();

	return (
		<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 className="text-2xl font-bold">
					{t("orderDetails.title")}
				</h1>
				<div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
					<span className="flex items-center gap-1">
						<Calendar className="h-4 w-4" />
						{t("orderDetails.orderId")} #{orderDetails.order_tracking_number}
					</span>
					<span>|</span>
					<span>
						{t("orderDetails.orderPlaced")}{" "}
						{orderDetails.order_placed}
					</span>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<Badge
					variant={getBadgeVariant(orderDetails.order_status ?? "")}
					className="text-base px-4 py-1"
				>
					{t(
						`orderInfo.${(
							orderDetails.order_status || ""
						).toLowerCase()}`
					) || orderDetails.order_status}
				</Badge>
				<span className="text-2xl font-bold">
					{t("orderDetails.total")}:{" "}
					<Price
						amount={(orderDetails.total_amount ?? 0).toFixed(2)}
					/>
				</span>
			</div>
		</div>
	);
}
