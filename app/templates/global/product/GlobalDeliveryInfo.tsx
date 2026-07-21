"use client";

import { BadgeCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * International delivery / guarantee card for the global PDP. Market-neutral
 * (no Dhaka-specific rates or hardcoded currency) — reuses the same service
 * promises shown in the footer strip.
 */
export function GlobalDeliveryInfo() {
	const { t } = useTranslation();

	const rows = [
		{ icon: Truck, label: t("global.services.delivery") },
		{ icon: RotateCcw, label: t("global.services.returns") },
		{ icon: ShieldCheck, label: t("global.services.payment") },
		{ icon: BadgeCheck, label: t("global.services.authentic") },
	];

	return (
		<div className="divide-y rounded-md border bg-card">
			{rows.map(({ icon: Icon, label }) => (
				<div key={label} className="flex items-center gap-3 px-4 py-2.5 text-sm">
					<Icon className="h-4 w-4 shrink-0 text-primary" />
					<span className="font-medium">{label}</span>
				</div>
			))}
		</div>
	);
}
