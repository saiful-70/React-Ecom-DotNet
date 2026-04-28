"use client";

import Price from "@/components/shared/Price";
import { Button } from "@/components/shared/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shared/ui/card";
import { Separator } from "@/components/shared/ui/separator";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface OrderSummaryProps {
	isProcessing: boolean;
	onSubmit: () => void;
	shippingCost?: number;
	subtotal?: number;
	tax?: number;
	total?: number;
	isFormValid?: boolean;
	isLoadingPrices?: boolean;
}

export function OrderSummary({
	isProcessing,
	onSubmit,
	shippingCost,
	subtotal: propSubtotal,
	tax: propTax,
	total: propTotal,
	isFormValid = true,
	isLoadingPrices = false,
}: OrderSummaryProps) {
	const { t } = useTranslation();
	const {
		items,
		total: cartTotal,
		itemCount,
		subtotal: cartSubtotal,
		tax: cartTax,
	} = useCart();

	const subtotal = propSubtotal ?? cartSubtotal;
	const tax = propTax ?? cartTax;
	const total = propTotal ?? cartTotal;

	return (
		<Card className="sticky top-4">
			<CardHeader>
				<CardTitle>
					{t("checkout.orderSummary") || "Order Summary"}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-3">
					{items.map((item) => (
						<div
							key={item.id + item.name}
							className="flex items-center space-x-3"
						>
							<Image
								src={item.image}
								alt={item.name}
								width={48}
								height={48}
								className="w-12 h-12 object-cover rounded"
							/>
							<div className="flex-1">
								<p className="font-medium text-sm">
									{item.name}
								</p>
								<p className="text-sm text-muted-foreground">
									{t("checkout.quantity") || "Qty"}:{" "}
									{item.quantity}
								</p>
							</div>
							<p className="font-medium">
								<Price amount={item.price * item.quantity} />
							</p>
						</div>
					))}
				</div>
				<Separator />
				<div className="space-y-2">
					<div className="flex justify-between">
						<span>
							{t("checkout.subtotal") || "Subtotal"} ({itemCount}{" "}
							{itemCount !== 1
								? t("cart.itemCountPlural") || "items"
								: t("cart.itemCount") || "item"}
							)
						</span>
						<span>
							<Price amount={subtotal} />
						</span>
					</div>

					<div className="flex justify-between">
						<span>{t("checkout.shipping")}</span>
						<span className="text-foreground">
							{shippingCost && shippingCost > 0 ? (
								<Price amount={shippingCost} />
							) : (
								<span className="text-muted-foreground italic text-sm">
									{t("checkout.selectCity")}
								</span>
							)}
						</span>
					</div>

					<div className="flex justify-between">
						<span>{t("checkout.tax")}</span>
						<span>
							<Price amount={tax} />
						</span>
					</div>

					<Separator />

					<div className="flex justify-between font-bold text-lg">
						<span>{t("checkout.total") || "Total"}</span>
						<span>
							<Price amount={total} />
						</span>
					</div>
				</div>
				<Button
					type="submit"
					className="w-full"
					disabled={isProcessing || !isFormValid || isLoadingPrices}
					onClick={onSubmit}
				>
					{isLoadingPrices
						? t("checkout.loadingPrices") || "Loading prices..."
						: isProcessing
							? t("checkout.processing") || "Processing..."
							: !isFormValid
								? t("checkout.fillRequiredFields") ||
								"Fill required fields"
								: `${t("checkout.placeOrder") || "Place Order"} - `}
					{!isProcessing && isFormValid && !isLoadingPrices && <Price amount={total} />}
				</Button>
			</CardContent>
		</Card>
	);
}
