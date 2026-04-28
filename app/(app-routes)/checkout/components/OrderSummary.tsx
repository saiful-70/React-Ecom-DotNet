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
import { businessSettingsAtom } from "@/store/ui-atoms";
import { useAtomValue } from "jotai";
import { Clock } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface OrderSummaryProps {
	isProcessing: boolean;
	onSubmit: () => void;
	shippingCost?: number;
	estimatedDelivery?: number;
	subtotal?: number;
	tax?: number;
	total?: number;
	isFormValid?: boolean;
	isShippingFree?: boolean;
	isLocationBased?: boolean;
	isLoadingPrices?: boolean;
}

export function OrderSummary({
	isProcessing,
	onSubmit,
	shippingCost,
	estimatedDelivery,
	subtotal: propSubtotal,
	tax: propTax,
	total: propTotal,
	isFormValid = true,
	isShippingFree = false,
	isLocationBased = false,
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
	const businessSettings = useAtomValue(businessSettingsAtom);

	// Use provided props or fall back to cart context values
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
						<span>{t("checkout.shipping") || "Shipping"}</span>
						<span
							className={
								isShippingFree
									? "text-green-600 font-medium"
									: "text-foreground"
							}
						>
							{isShippingFree ? (
								t("checkout.free") || "Free"
							) : businessSettings?.shipping_type ===
								"flat_rate" ? (
								<>
									<span className="text-sm italic pr-1">
										({t("checkout.flatRateShipping")})
									</span>
									<Price
										amount={businessSettings.flat_cost}
									/>
								</>
							) : isLocationBased && shippingCost === 0 ? (
								<span className="text-muted-foreground italic">
									{t("checkout.locationBased") ||
										"Location Based"}
								</span>
							) : (
								<Price amount={shippingCost ?? 0} />
							)}
						</span>
					</div>

					{/* Estimated Delivery */}
					{estimatedDelivery && estimatedDelivery > 0 ? (
						<div className="flex items-center justify-between text-sm text-muted-foreground">
							<span className="flex items-center gap-1">
								<Clock className="w-4 h-4" />
								{t("checkout.estimatedDelivery") ||
									"Est. Delivery"}
							</span>
							<span>
								{estimatedDelivery}{" "}
								{estimatedDelivery === 1
									? t("checkout.day") || "day"
									: t("checkout.days") || "days"}
							</span>
						</div>
					) : null}

					<div className="flex justify-between">
						<span>{t("checkout.tax") || "Tax (VAT)"}</span>
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
