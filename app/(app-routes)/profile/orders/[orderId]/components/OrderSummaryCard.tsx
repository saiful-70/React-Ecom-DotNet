"use client";

import {
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shared/ui/card";
import { Separator } from "@/components/shared/ui/separator";
import Price from "@/components/shared/Price";
// import { Button } from "@/components/shared/ui/button";
import { useTranslation } from "react-i18next";
import { OrderDetailsModel, OrderItem } from "@/(app-routes)/profile/orders/model";
import { calculateCartTax } from "@/lib/utils/tax-calculator";

type Props = { orderDetails: OrderDetailsModel };

export default function OrderSummaryCard({ orderDetails }: Props) {
	const { t } = useTranslation();

	// Prepare items for tax calculation with price per item
	const itemsForTaxCalculation = (orderDetails.products || []).map(
		(item: OrderItem) => ({
			price: item.price, // Price per unit
			quantity: item.quantity,
			tax: Number(item.product.tax) || 0,
			tax_type:
				(item.product.tax_type as "include" | "exclude") || "exclude",
		})
	);

	// Calculate tax using the tax calculator
	const taxCalculation = calculateCartTax(itemsForTaxCalculation);

	return (
		<>
			<CardHeader>
				<CardTitle>{t("orderDetails.productPriceDetails")}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">
							{t("orderDetails.subtotalPrice")}
						</span>
						<span>
							<Price
								amount={taxCalculation.subtotal.toFixed(2)}
							/>
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">
							{t("orderDetails.shippingCost")}
						</span>
						<span>
							<Price
								amount={(
									orderDetails.shipping_cost || 0
								).toFixed(2)}
							/>
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">
							{t("orderDetails.tax")}
						</span>
						<span>
							<Price amount={taxCalculation.tax.toFixed(2)} />
						</span>
					</div>
					<Separator />
					<div className="flex justify-between text-lg font-bold">
						<span>{t("orderDetails.total")}</span>
						<span>
							<Price
								amount={(
									taxCalculation.total +
									(orderDetails.shipping_cost || 0)
								).toFixed(2)}
							/>
						</span>
					</div>
				</div>

				{/* <div className="flex gap-3">
					<Button variant="outline" className="flex-1">
						{t("orderDetails.writeReview")}
					</Button> */}
				{/* <Button variant="outline" className="flex-1">
						{t("orderDetails.refundOrder")}
					</Button> */}
				{/* </div> */}
			</CardContent>
		</>
	);
}
