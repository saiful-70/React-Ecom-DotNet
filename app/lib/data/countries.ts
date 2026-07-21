/**
 * Bundled ISO country dataset for the international phone-code picker. Static
 * reference data — no network, works offline. Flags are derived from the ISO
 * alpha-2 code (regional-indicator code points) so we don't ship image assets.
 *
 * Phone validation itself is delegated to libphonenumber-js in the caller; this
 * list only drives the country selector and the dial-code prefix.
 */
export interface Country {
	/** ISO 3166-1 alpha-2 code (uppercase), e.g. "US". */
	code: string;
	/** English display name. */
	name: string;
	/** International dial code without the leading "+", e.g. "1", "44", "880". */
	dialCode: string;
}

/** Convert an ISO alpha-2 code into its flag emoji. */
export function countryToFlag(code: string): string {
	return code
		.toUpperCase()
		.replace(/./g, (char) =>
			String.fromCodePoint(127397 + char.charCodeAt(0))
		);
}

/** Curated list of commonly-served markets, sorted by name. */
export const COUNTRIES: Country[] = [
	{ code: "AU", name: "Australia", dialCode: "61" },
	{ code: "AT", name: "Austria", dialCode: "43" },
	{ code: "BD", name: "Bangladesh", dialCode: "880" },
	{ code: "BE", name: "Belgium", dialCode: "32" },
	{ code: "BR", name: "Brazil", dialCode: "55" },
	{ code: "CA", name: "Canada", dialCode: "1" },
	{ code: "CN", name: "China", dialCode: "86" },
	{ code: "CZ", name: "Czechia", dialCode: "420" },
	{ code: "DK", name: "Denmark", dialCode: "45" },
	{ code: "EG", name: "Egypt", dialCode: "20" },
	{ code: "FI", name: "Finland", dialCode: "358" },
	{ code: "FR", name: "France", dialCode: "33" },
	{ code: "DE", name: "Germany", dialCode: "49" },
	{ code: "GR", name: "Greece", dialCode: "30" },
	{ code: "HK", name: "Hong Kong", dialCode: "852" },
	{ code: "IN", name: "India", dialCode: "91" },
	{ code: "ID", name: "Indonesia", dialCode: "62" },
	{ code: "IE", name: "Ireland", dialCode: "353" },
	{ code: "IL", name: "Israel", dialCode: "972" },
	{ code: "IT", name: "Italy", dialCode: "39" },
	{ code: "JP", name: "Japan", dialCode: "81" },
	{ code: "JO", name: "Jordan", dialCode: "962" },
	{ code: "KE", name: "Kenya", dialCode: "254" },
	{ code: "KW", name: "Kuwait", dialCode: "965" },
	{ code: "MY", name: "Malaysia", dialCode: "60" },
	{ code: "MX", name: "Mexico", dialCode: "52" },
	{ code: "NL", name: "Netherlands", dialCode: "31" },
	{ code: "NZ", name: "New Zealand", dialCode: "64" },
	{ code: "NG", name: "Nigeria", dialCode: "234" },
	{ code: "NO", name: "Norway", dialCode: "47" },
	{ code: "PK", name: "Pakistan", dialCode: "92" },
	{ code: "PH", name: "Philippines", dialCode: "63" },
	{ code: "PL", name: "Poland", dialCode: "48" },
	{ code: "PT", name: "Portugal", dialCode: "351" },
	{ code: "QA", name: "Qatar", dialCode: "974" },
	{ code: "RO", name: "Romania", dialCode: "40" },
	{ code: "RU", name: "Russia", dialCode: "7" },
	{ code: "SA", name: "Saudi Arabia", dialCode: "966" },
	{ code: "SG", name: "Singapore", dialCode: "65" },
	{ code: "ZA", name: "South Africa", dialCode: "27" },
	{ code: "KR", name: "South Korea", dialCode: "82" },
	{ code: "ES", name: "Spain", dialCode: "34" },
	{ code: "LK", name: "Sri Lanka", dialCode: "94" },
	{ code: "SE", name: "Sweden", dialCode: "46" },
	{ code: "CH", name: "Switzerland", dialCode: "41" },
	{ code: "TW", name: "Taiwan", dialCode: "886" },
	{ code: "TH", name: "Thailand", dialCode: "66" },
	{ code: "TR", name: "Türkiye", dialCode: "90" },
	{ code: "AE", name: "United Arab Emirates", dialCode: "971" },
	{ code: "GB", name: "United Kingdom", dialCode: "44" },
	{ code: "US", name: "United States", dialCode: "1" },
	{ code: "VN", name: "Vietnam", dialCode: "84" },
];

/** Default selected country for the international storefront. */
export const DEFAULT_COUNTRY_CODE = "US";

/** Look up a country by ISO alpha-2 code. */
export function findCountry(code: string): Country | undefined {
	return COUNTRIES.find((c) => c.code === code.toUpperCase());
}
