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
import { useCart, type CartItem } from "@/contexts/CartContext";
import { Minus, Plus } from "lucide-react";
import { CartLineImage } from "@/components/shared/CartLineImage";
import { useTranslation } from "react-i18next";

interface OrderSummaryProps {
	isProcessing: boolean;
	onSubmit: () => void;
	shippingCost?: number;
	/**
	 * True once shipping has genuinely been determined (global template, a
	 * chosen city, a bundle free-delivery perk, or the subtotal clearing the
	 * free-shipping threshold). When false, a shippingCost of 0 is just the
	 * not-yet-resolved default and should show the "select city" hint instead
	 * of "Free".
	 */
	shippingResolved?: boolean;
	subtotal?: number;
	tax?: number;
	total?: number;
	isFormValid?: boolean;
	isLoadingPrices?: boolean;
	/**
	 * Lines to display. Defaults to the whole cart; a Buy Now checkout passes the
	 * single scoped line so the summary matches what is being ordered.
	 */
	items?: CartItem[];
}

export function OrderSummary({
	isProcessing,
	onSubmit,
	shippingCost,
	shippingResolved = false,
	subtotal: propSubtotal,
	tax: propTax,
	total: propTotal,
	isFormValid = true,
	isLoadingPrices = false,
	items: propItems,
}: OrderSummaryProps) {
	const { t } = useTranslation();
	const {
		items: cartItems,
		total: cartTotal,
		itemCount: cartItemCount,
		subtotal: cartSubtotal,
		tax: cartTax,
		updateQuantity,
	} = useCart();

	const items = propItems ?? cartItems;
	const itemCount = propItems
		? propItems.reduce((sum, i) => sum + i.quantity, 0)
		: cartItemCount;

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
					{items.map((item) => {
						const atStockLimit =
							typeof item.stock === "number" &&
							item.stock > 0 &&
							item.quantity >= item.stock;
						const handleDecrease = () => {
							if (item.quantity > 1) {
								updateQuantity(
									item.id,
									item.quantity - 1,
									item.variant_id,
									item.bundle_tier_id
								);
							}
						};
						const handleIncrease = () => {
							if (!atStockLimit) {
								updateQuantity(
									item.id,
									item.quantity + 1,
									item.variant_id,
									item.bundle_tier_id
								);
							}
						};
						return (
							<div
								key={`${item.id}-${item.variant_id ?? "base"}`}
								className="flex gap-3 items-start"
							>
								<CartLineImage
									src={item.image}
									alt={item.name}
									width={48}
									height={48}
									className="w-12 h-12 object-cover rounded shrink-0"
								/>
								<div className="flex-1 min-w-0 space-y-2">
									<p className="font-medium text-sm break-words">
										{item.name}
									</p>
									<div className="flex items-center justify-between gap-2 flex-wrap">
										{item.bundle_tier_id != null ? (
											<span
												className="w-7 text-center text-sm font-medium tabular-nums shrink-0"
												title={t("bundle.fixedQuantity") || "Combo — fixed quantity"}
												aria-label={
													t("bundle.fixedQuantity") || "Combo — fixed quantity"
												}
											>
												×1
											</span>
										) : (
											<div className="flex items-center gap-1 shrink-0">
												<Button
													type="button"
													variant="outline"
													size="icon"
													className="h-7 w-7"
													onClick={handleDecrease}
													disabled={item.quantity <= 1}
													aria-label="decrease quantity"
												>
													<Minus className="w-3.5 h-3.5" />
												</Button>
												<span className="w-7 text-center text-sm font-medium tabular-nums">
													{item.quantity}
												</span>
												<Button
													type="button"
													variant="outline"
													size="icon"
													className="h-7 w-7"
													onClick={handleIncrease}
													disabled={atStockLimit}
													aria-label="increase quantity"
												>
													<Plus className="w-3.5 h-3.5" />
												</Button>
											</div>
										)}
										<p className="font-medium text-sm shrink-0">
											<Price amount={item.price * item.quantity} />
										</p>
									</div>
								</div>
							</div>
						);
					})}
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
							{!shippingResolved ? (
								<span className="text-muted-foreground italic text-sm">
									{t("checkout.selectCity")}
								</span>
							) : shippingCost && shippingCost > 0 ? (
								<Price amount={shippingCost} />
							) : (
								<span>{t("checkout.free")}</span>
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
