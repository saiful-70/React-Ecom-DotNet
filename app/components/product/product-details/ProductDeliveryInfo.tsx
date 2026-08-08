"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Price from "@/components/shared/Price";
import { getShippingCost } from "@/(app-routes)/checkout/action";
import {
	BANGLADESH_COUNTRY_ID,
	CITY_INSIDE_DHAKA,
	CITY_OUTSIDE_DHAKA,
	DELIVERY_RATES,
	getCityOptionByValue,
} from "@/lib/constants/delivery";

// Same backend zones the checkout city selector uses (Bangladesh country +
// inside/outside Dhaka city ids), so the PDP shows the real shipping cost.
const INSIDE_CITY_ID = getCityOptionByValue(CITY_INSIDE_DHAKA)?.backendCityId;
const OUTSIDE_CITY_ID = getCityOptionByValue(CITY_OUTSIDE_DHAKA)?.backendCityId;

export function ProductDeliveryInfo() {
	const { t } = useTranslation();
	// Seed with the built-in rates; replace with the live `shipping-cost` API
	// values once fetched (falls back to the seed if the request fails).
	const [insideDhaka, setInsideDhaka] = useState<number>(
		DELIVERY_RATES.insideDhaka
	);
	const [outsideDhaka, setOutsideDhaka] = useState<number>(
		DELIVERY_RATES.outsideDhaka
	);

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const [inside, outside] = await Promise.all([
					INSIDE_CITY_ID
						? getShippingCost(BANGLADESH_COUNTRY_ID, INSIDE_CITY_ID)
						: null,
					OUTSIDE_CITY_ID
						? getShippingCost(BANGLADESH_COUNTRY_ID, OUTSIDE_CITY_ID)
						: null,
				]);
				if (!active) return;
				// The API can answer `success: true` with `shipping_cost`
				// missing; adopting that would blank out the rate, so only a
				// real number replaces the seeded fallback.
				const rate = (res: typeof inside): number | null => {
					const value = res?.success ? res.data?.shipping_cost : null;
					return typeof value === "number" && Number.isFinite(value)
						? value
						: null;
				};
				const insideRate = rate(inside);
				const outsideRate = rate(outside);
				if (insideRate !== null) setInsideDhaka(insideRate);
				if (outsideRate !== null) setOutsideDhaka(outsideRate);
			} catch {
				// Keep the seeded fallback rates on failure.
			}
		})();
		return () => {
			active = false;
		};
	}, []);

	const rows = [
		{
			label: t("productDetails.deliveryOutsideDhaka"),
			amount: outsideDhaka,
		},
		{
			label: t("productDetails.deliveryInsideDhaka"),
			amount: insideDhaka,
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
