"use client";

import { businessSettingsAtom } from "@/store/ui-atoms";
import { getCurrencySymbol } from "@/lib/utils/business-settings";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

type Props = {
	amount: number | string | null | undefined;
};

/**
 * Locale tag used for grouping separators. Bengali deployments keep LATIN
 * digits for money (the convention on every major BD storefront) while still
 * using South-Asian grouping — `1,00,000`, not `100,000` — which is exactly
 * what the `-u-nu-latn` numbering-system extension on `bn-BD` produces.
 * Separators therefore come from the locale, never from a hardcoded string.
 */
function localeTag(language: string | undefined): string {
	if (!language) return "en";
	return language.startsWith("bn") ? "bn-BD-u-nu-latn" : language;
}

export default function Price({ amount }: Props) {
	const businessSettings = useAtomValue(businessSettingsAtom);
	const { i18n } = useTranslation();
	const currencyPosition = businessSettings?.currency_position ?? "left";
	// Map the currency code (e.g. "BDT", "USD", or a loose "tk") to its symbol.
	const symbol = getCurrencySymbol(businessSettings?.currency || "BDT");

	// A missing/NaN amount used to render literally as "undefined৳" to the
	// shopper whenever an upstream field was absent. Treat any non-finite value
	// as 0 so a data gap degrades to a price rather than to broken text.
	const parsed = typeof amount === "string" ? Number(amount) : amount;
	const isNumeric = Number.isFinite(parsed);
	const numeric = isNumeric ? (parsed as number) : 0;
	const digits = parseInt(businessSettings?.decimal_digits || "2");

	// Whole amounts drop their decimals: retail prices here read "৳1,200",
	// never "৳1200.00" — two dead zeros steal weight from the price, which is
	// the heaviest thing in its block by design.
	const hasFraction = Math.abs(numeric % 1) > Number.EPSILON;
	const formatted = new Intl.NumberFormat(localeTag(i18n?.language), {
		minimumFractionDigits: hasFraction ? digits : 0,
		maximumFractionDigits: hasFraction ? digits : 0,
	}).format(numeric);

	// A non-numeric, non-empty string (e.g. a pre-formatted range from the API)
	// is passed through untouched rather than coerced to 0.
	const display =
		!isNumeric && typeof amount === "string" && amount.trim()
			? amount
			: formatted;

	return (
		<span>
			{currencyPosition === "left"
				? `${symbol}${display}`
				: `${display}${symbol}`}
		</span>
	);
}
