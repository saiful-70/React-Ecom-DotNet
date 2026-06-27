"use client";

import { Button } from "@/components/shared/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shared/ui/card";
import { Separator } from "@/components/shared/ui/separator";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import Price from "@/components/shared/Price";
import { getCurrencySymbol } from "@/lib/utils/business-settings";
import Link from "next/link";
import { Badge } from "../shared/ui/badge";
import { useAtomValue } from "jotai";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { useCart } from "@/contexts/CartContext";

interface OrderSummaryProps {
	subtotal: number;
	tax: number;
	total: number;
}

export function OrderSummary({ subtotal, tax, total }: OrderSummaryProps) {
	const { t } = useTranslation();
	const businessSettings = useAtomValue(businessSettingsAtom);
	const { taxType } = useCart();
	const freeShippingThreshold =
		businessSettings?.free_shipping_on_over || "5000";

	// Determine display values based on tax type
	const displaySubtotal = taxType === "include" ? subtotal : subtotal;
	const displayTax = taxType === "include" ? tax : tax;
	const displayTotal = taxType === "include" ? subtotal : total;

	const taxTypeLabel = taxType === "include" ? "(Included)" : "(Excluded)";

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{t("cart.orderSummary") || "Order Summary"}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex justify-between ">
					<span>{t("cart.subtotal") || "Subtotal"}</span>
					<Price amount={displaySubtotal} />
				</div>
				<div className="flex justify-between">
					<span>
						{t("cart.tax") || "Tax"} <span className="text-xs text-muted-foreground">{taxTypeLabel}</span>
					</span>
					<Price amount={displayTax} />
				</div>
				<Separator />
				<div className="flex justify-between font-bold text-lg">
					<span>{t("cart.total") || "Total"}</span>
					<Price amount={displayTotal} />
				</div>

				<div className="space-y-2">
					<Button className="w-full" asChild>
						<Link href="/checkout">
							{t("cart.checkout") || "Proceed to Checkout"}
							<ArrowRight className="w-4 h-4 ml-2" />
						</Link>
					</Button>

					<Button variant="outline" className="w-full" asChild>
						<Link href="/products">
							{t("cart.continueShopping") || "Continue Shopping"}
						</Link>
					</Button>
				</div>

				<div className="text-center">
					<Badge variant="secondary" className="text-xs">
						{t("cart.freeShippingBadge", {
							amount: `${getCurrencySymbol(
								businessSettings?.currency || "BDT"
							)}${freeShippingThreshold}`,
						})}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}
