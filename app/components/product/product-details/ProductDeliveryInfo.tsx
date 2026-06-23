"use client";

import { useTranslation } from "react-i18next";
import Price from "@/components/shared/Price";
import { DELIVERY_RATES } from "@/lib/constants/delivery";

export function ProductDeliveryInfo() {
	const { t } = useTranslation();

	const rows = [
		{
			label: t("productDetails.deliveryOutsideDhaka"),
			amount: DELIVERY_RATES.outsideDhaka,
		},
		{
			label: t("productDetails.deliveryInsideDhaka"),
			amount: DELIVERY_RATES.insideDhaka,
		},
	];

	return (
		<div className="border rounded-md divide-y bg-card">
			{rows.map((row) => (
				<div
					key={row.label}
					className="flex items-center justify-between px-4 py-2.5 text-sm"
				>
					<span className="text-foreground font-medium">{row.label}</span>
					<span className="text-foreground font-semibold">
						<Price amount={row.amount} />
					</span>
				</div>
			))}
		</div>
	);
}
