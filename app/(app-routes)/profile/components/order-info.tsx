"use client";

import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shared/ui/card";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { OrderHistoryModel } from "../orders/model";
import { useTranslation } from "react-i18next";
import { ORDER_STATUS } from "@/lib/enums";
import { getBadgeVariant } from "@/lib/utils/utils";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import Price from "@/components/shared/Price";

type Props = {
	model: OrderHistoryModel[];
};

export default function OrderInfo({ model }: Props) {
	const { t } = useTranslation();

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("orderInfo.orderHistory")}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{model.map((order) => (
						<div key={order.id} className="p-4 border rounded-lg">
							<div className="flex justify-between items-start mb-3">
								<div>
									<h3 className="font-semibold">
										{order.order_tracking_number}
									</h3>
									<p className="text-sm text-muted-foreground">
										{t("orderInfo.placedOn")}{" "}
										{order.order_placed}
									</p>
								</div>
								<Badge
									variant={getBadgeVariant(
										order.order_status ?? ""
									)}
								>
									{order.order_status ===
										ORDER_STATUS.DELIVERED
										? t("orderInfo.delivered")
										: null}
									{order.order_status === ORDER_STATUS.SHIPPED
										? t("orderInfo.shipped")
										: null}
									{order.order_status ===
										ORDER_STATUS.PROCESSING
										? t("orderInfo.processing")
										: null}
									{order.order_status === ORDER_STATUS.PENDING
										? t("orderInfo.pending")
										: null}
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<p className="text-sm">
									{order.products?.length}{" "}
									{order.products?.length === 1
										? t("orderInfo.item")
										: t("orderInfo.items")}
								</p>
								<div className="flex items-center gap-3">
									<span className="font-medium">
										<Price
											amount={order.total_amount || 0}
										/>
									</span>
									<Link
										href={ABSOLUTE_ROUTES.ORDER_DETAILS(
											order.id
										)}
									>
										<Button variant="outline" size="sm">
											{t("orderInfo.viewDetails")}
										</Button>
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
