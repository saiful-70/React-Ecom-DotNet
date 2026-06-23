"use client";

import { businessSettingsAtom } from "@/store/ui-atoms";
import { getCurrencySymbol } from "@/lib/utils/business-settings";
import { useAtomValue } from "jotai";

type Props = {
	amount: number | string;
};

export default function Price({ amount }: Props) {
	const businessSettings = useAtomValue(businessSettingsAtom);
	const currencyPosition = businessSettings?.currency_position ?? "left";
	// Map the currency code (e.g. "BDT", "USD") to its symbol; defaults to ৳.
	const symbol = getCurrencySymbol(businessSettings?.currency || "BDT");

	amount =
		typeof amount === "number"
			? amount.toFixed(parseInt(businessSettings?.decimal_digits || "2"))
			: amount;
	return (
		<span>
			{currencyPosition === "left"
				? `${symbol}${amount}`
				: `${amount}${symbol}`}
		</span>
	);
}
