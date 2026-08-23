"use client";

import { useTranslation } from "react-i18next";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils/utils";
import {
	estimatedDeliveryDate,
	formatCatalogueDate,
	LOW_STOCK_THRESHOLD,
} from "../_data/catalogue";

/**
 * The printed availability course — set as a catalogue line on every plate
 * and on the PDP, never hidden in a tooltip.
 *
 *   In stock — get it by Tue, 2 Sep · Estimated
 *   Only 3 left — get it by Tue, 2 Sep · Estimated
 *   Out of stock
 *
 * The date is computed client-side (order date + SHIPPING_WINDOW_DAYS) after
 * hydration so server and client markup match across timezones; the honest
 * "Only X left" appears only when the API stock field is present and low.
 */
export function GlobalAvailabilityLine({
	stock,
	className,
}: {
	stock: number;
	className?: string;
}) {
	const { t, i18n } = useTranslation();
	const isHydrated = useHydrated();

	if (stock <= 0) {
		return (
			<p className={cn("text-xs text-muted-foreground", className)}>
				{t("global.stockOut", "Out of Stock")}
			</p>
		);
	}

	const isLow = stock <= LOW_STOCK_THRESHOLD;
	const lead = isLow
		? t("global.availability.onlyLeft", "Only {{count}} left", {
				count: stock,
			})
		: t("global.availability.inStock", "In stock");

	return (
		<p
			className={cn("text-xs leading-snug", className)}
			suppressHydrationWarning
		>
			<span className={cn("font-semibold", isLow ? "text-foreground" : "text-success")}>
				{lead}
			</span>
			{isHydrated && (
				<span className="text-muted-foreground">
					{" — "}
					{t("global.availability.getItBy", "get it by")}{" "}
					<span className="font-medium text-foreground tabular-nums">
						{formatCatalogueDate(estimatedDeliveryDate(), i18n.language)}
					</span>
					{" · "}
					{t("global.availability.estimated", "Estimated")}
				</span>
			)}
		</p>
	);
}
