"use client";

import { useTranslation } from "react-i18next";
import Price from "@/components/shared/Price";
import { useCities } from "@/hooks/use-cities";

/**
 * PDP delivery-charge table, driven by `GET /cities?country_id=` — one row per
 * backend city with its `shipping_cost`. Renders nothing until the list loads
 * (no client-side rate table to fall back on).
 */
export function ProductDeliveryInfo() {
	const { t } = useTranslation();
	const cities = useCities();

	const rows = cities
		.map((city) => {
			const raw =
				typeof city.shipping_cost === "string"
					? Number(city.shipping_cost)
					: city.shipping_cost;
			return {
				id: city.id,
				label: city.name,
				amount:
					typeof raw === "number" && Number.isFinite(raw) ? raw : null,
			};
		})
		.filter((row) => row.amount != null);

	if (rows.length === 0) return null;

	return (
		<div className="border rounded-md divide-y bg-card">
			<div className="px-4 py-2.5 text-sm font-medium text-foreground">
				{t("checkout.shipping")}
			</div>
			{rows.map((row) => (
				<div
					key={row.id}
					className="flex items-center justify-between px-4 py-2.5 text-sm"
				>
					<span className="text-foreground font-medium">{row.label}</span>
					<span className="text-foreground font-semibold">
						<Price amount={row.amount as number} />
					</span>
				</div>
			))}
		</div>
	);
}
