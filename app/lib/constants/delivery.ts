export const DELIVERY_RATES = {
	insideDhaka: 80,
	outsideDhaka: 130,
} as const;

export const isInsideDhaka = (cityName: string | undefined): boolean => {
	if (!cityName) return false;
	const normalized = cityName.trim().toLowerCase();
	return normalized.includes("dhaka") || cityName.includes("ঢাকা");
};

export const getDeliveryCharge = (cityName: string | undefined): number =>
	isInsideDhaka(cityName)
		? DELIVERY_RATES.insideDhaka
		: DELIVERY_RATES.outsideDhaka;
