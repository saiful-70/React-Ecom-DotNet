"use client";

import { useTranslation } from "react-i18next";
import Price from "@/components/shared/Price";
import { INTL_SHIPPING } from "@/lib/constants/delivery";
import { useHydrated } from "@/hooks/use-hydrated";
import {
	estimatedDeliveryDate,
	formatCatalogueDate,
} from "../_data/catalogue";

/**
 * Delivery-cost transparency, printed as a catalogue table BEFORE the buy
 * actions: flat international rate, the free-over threshold, and the
 * estimated arrival date. Uses the real INTL_SHIPPING constants and the store
 * currency via <Price> — nothing hardcoded, no unbacked policy claims.
 */
export function GlobalDeliveryInfo() {
	const { t, i18n } = useTranslation();
	const isHydrated = useHydrated();

	const rows: { label: string; value: React.ReactNode }[] = [
		{
			label: t("global.delivery.standard", "Standard international delivery"),
			value: (
				<span className="font-semibold tabular-nums">
					<Price amount={INTL_SHIPPING.flat} />
				</span>
			),
		},
		{
			label: t("global.delivery.freeOver", "Free delivery on orders over"),
			value: (
				<span className="font-semibold tabular-nums">
					<Price amount={INTL_SHIPPING.freeOver} />
				</span>
			),
		},
		{
			label: t("global.delivery.arrives", "Arrives by"),
			value: (
				<span className="font-semibold tabular-nums" suppressHydrationWarning>
					{isHydrated
						? formatCatalogueDate(estimatedDeliveryDate(), i18n.language)
						: "—"}{" "}
					<span className="font-normal text-muted-foreground">
						· {t("global.availability.estimated", "Estimated")}
					</span>
				</span>
			),
		},
		// No returns row: the backend exposes no return-policy field, and the
		// catalogue prints only what it can back. Add the row when a
		// `return_policy` business setting exists.
	];

	return (
		<div className="rounded-sm border border-border">
			<p className="border-b border-border bg-muted px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
				{t("global.delivery.title", "Delivery & returns")}
			</p>
			<dl className="divide-y divide-border">
				{rows.map(({ label, value }) => (
					<div
						key={label}
						className="flex items-baseline justify-between gap-4 px-4 py-2 text-sm"
					>
						<dt className="text-muted-foreground">{label}</dt>
						<dd className="text-right">{value}</dd>
					</div>
				))}
			</dl>
		</div>
	);
}
