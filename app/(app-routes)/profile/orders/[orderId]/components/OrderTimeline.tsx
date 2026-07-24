"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shared/ui/card";
import { Separator } from "@/components/shared/ui/separator";
import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OrderDetailsModel, MiniOrderHistory } from "@/(app-routes)/profile/orders/model";
import { formatText } from "@/lib/utils/utils";

type Props = { orderDetails: OrderDetailsModel };

export default function OrderTimeline({ orderDetails }: Props) {
	const { t } = useTranslation();

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("orderDetails.orderStatus")}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
							<Package className="h-5 w-5 text-primary" />
						</div>
						<div className="flex-1">
							<p className="font-medium">
								{t("orderDetails.deliveryType")}
							</p>
							<p className="text-sm text-muted-foreground capitalize">
								{formatText(
									orderDetails.shipping_method ||
										t("orderDetails.standard") ||
										"standard"
								)}
							</p>
						</div>
					</div>

					<Separator />

					<div className="space-y-4">
						{orderDetails.order_histories &&
						orderDetails.order_histories.length > 0 ? (
							orderDetails.order_histories.map(
								(step: MiniOrderHistory, index: number) => (
									<div
										key={step.id}
										className="relative flex gap-3"
									>
										{index <
											(orderDetails.order_histories
												?.length ?? 0) -
												1 && (
											<div className="absolute left-2 top-8 h-12 w-0.5 bg-border" />
										)}

										<div
											className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 flex-shrink-0 ${
												index ===
												(orderDetails.order_histories
													?.length ?? 0) -
													1
													? "border-primary bg-primary"
													: "border-primary bg-primary"
											}`}
										>
											<div className="h-2 w-2 rounded-full bg-white" />
										</div>

										<div className="flex-1 pb-4">
											<p className="font-medium text-foreground capitalize">
												{formatText(step.status || "")}
											</p>
											{step.changed_at && (
												<p className="text-sm text-muted-foreground">
													{new Date(
														step.changed_at
													).toLocaleDateString()}{" "}
													{new Date(
														step.changed_at
													).toLocaleTimeString()}
												</p>
											)}
										</div>
									</div>
								)
							)
						) : (
							<p className="text-sm text-muted-foreground">
								{t("orderDetails.noHistory")}
							</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
