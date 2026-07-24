"use client";

import { Badge } from "@/components/shared/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shared/ui/card";
import { PackageIcon } from "lucide-react";
import { OrderHistoryModel } from "../orders/model";
import { useTranslation } from "react-i18next";
import { getBadgeVariant } from "@/lib/utils/utils";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import Price from "@/components/shared/Price";

type Props = {
	orders: OrderHistoryModel[];
};

export default function RecentOrders({ orders }: Props) {
	const { t } = useTranslation();

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<PackageIcon className="w-5 h-5" />
					{t("profile.recentOrders")}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{orders.slice(0, 3).map((order) => (
						<div
							key={order.id}
							className="flex justify-between items-center p-3 border rounded-lg"
						>
							<div>
								<Link
									href={ABSOLUTE_ROUTES.ORDER_DETAILS(
										order.id
									)}
									className="font-medium"
								>
									#{order.order_tracking_number}
								</Link>
								<p className="text-sm text-muted-foreground">
									{order.order_placed}
								</p>
							</div>
							<div className="text-right">
								<Badge
									variant={getBadgeVariant(
										order.order_status ?? ""
									)}
								>
									{t(
										`orderInfo.${(
											order.order_status || ""
										).toLowerCase()}`
									)}
								</Badge>
								<p className="text-sm font-medium mt-1">
									<Price
										amount={(
											order.total_amount ?? 0
										).toFixed(2)}
									/>
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
