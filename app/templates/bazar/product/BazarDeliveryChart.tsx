"use client";

import { useAtomValue } from "jotai";
import { Banknote, PhoneCall, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import Price from "@/components/shared/Price";
import { useCities } from "@/hooks/use-cities";
import { businessSettingsAtom } from "@/store/ui-atoms";
import "../bazar.css";

/**
 * Delivery-fee transparency, printed BEFORE the buy keys in the chart
 * grammar: one row per delivery zone from `GET /cities` (backend-priced),
 * the free-delivery threshold from business settings, and the COD promise.
 * When the cities API has nothing (backend down), the chart degrades to the
 * COD + delivery-promise lines — the trust content never disappears.
 */
export function BazarDeliveryChart() {
	const { t } = useTranslation();
	const cities = useCities();
	const settings = useAtomValue(businessSettingsAtom);

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

	const freeOver = Number(settings?.free_shipping_on_over);
	const hasFreeOver = Number.isFinite(freeOver) && freeOver > 0;

	return (
		<div className="overflow-hidden rounded-lg border border-border bg-card shadow-warm-sm">
			<p className="flex items-center gap-2 bg-secondary px-4 py-2.5 text-sm font-bold text-secondary-foreground">
				<Truck className="h-4 w-4 text-primary" aria-hidden="true" />
				{t("bazar.deliveryChargeTitle", "ডেলিভারি চার্জ")}
			</p>
			<div className="bz-chart-divide">
				{rows.map((row) => (
					<div
						key={row.id}
						className="flex items-center justify-between px-4 py-2.5 text-sm"
					>
						<span className="font-semibold">{row.label}</span>
						<span className="bz-num font-display font-bold">
							<Price amount={row.amount as number} />
						</span>
					</div>
				))}
				{hasFreeOver && (
					<div className="flex items-center justify-between px-4 py-2.5 text-sm">
						<span className="font-semibold text-success">
							{t("bazar.freeDeliveryOver", "এর বেশি অর্ডারে ডেলিভারি ফ্রি")}
						</span>
						<span className="bz-num font-display font-bold text-success">
							<Price amount={freeOver} />+
						</span>
					</div>
				)}
				<div className="space-y-1.5 px-4 py-3 text-sm">
					<p className="flex items-center gap-2 font-bold">
						<Banknote
							className="h-4 w-4 shrink-0 text-primary"
							aria-hidden="true"
						/>
						{t("bazar.codBadge", "ক্যাশ অন ডেলিভারি")}
					</p>
					<p className="flex items-center gap-2 text-muted-foreground">
						<Truck
							className="h-4 w-4 shrink-0 text-primary"
							aria-hidden="true"
						/>
						{t(
							"bazar.deliveryPromise",
							"ঢাকায় ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ২–৩ দিন"
						)}
					</p>
					<p className="flex items-center gap-2 text-muted-foreground">
						<PhoneCall
							className="h-4 w-4 shrink-0 text-primary"
							aria-hidden="true"
						/>
						{t(
							"bazar.confirmCallNote",
							"অর্ডার কনফার্ম করতে আমরা ফোনে কল করব"
						)}
					</p>
				</div>
			</div>
		</div>
	);
}
