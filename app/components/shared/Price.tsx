"use client";

import { businessSettingsAtom } from "@/store/ui-atoms";
import { getCurrencySymbol } from "@/lib/utils/business-settings";
import { useAtomValue } from "jotai";

type Props = {
	amount: number | string | null | undefined;
};

export default function Price({ amount }: Props) {
	const businessSettings = useAtomValue(businessSettingsAtom);
	const currencyPosition = businessSettings?.currency_position ?? "left";
	// Map the currency code (e.g. "BDT", "USD") to its symbol; defaults to ৳.
	const symbol = getCurrencySymbol(businessSettings?.currency || "BDT");

	// A missing/NaN amount used to render literally as "undefined৳" to the
	// shopper whenever an upstream field was absent. Treat any non-finite value
	// as 0 so a data gap degrades to a price rather than to broken text.
	const numeric = typeof amount === "string" ? Number(amount) : amount;
	const formatted = Number.isFinite(numeric)
		? (numeric as number).toFixed(
				parseInt(businessSettings?.decimal_digits || "2")
			)
		: typeof amount === "string" && amount.trim()
			? amount
			: (0).toFixed(parseInt(businessSettings?.decimal_digits || "2"));
	return (
		<span>
			{currencyPosition === "left"
				? `${symbol}${formatted}`
				: `${formatted}${symbol}`}
		</span>
	);
}
