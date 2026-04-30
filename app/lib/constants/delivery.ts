export const DELIVERY_RATES = {
	insideDhaka: 80,
	outsideDhaka: 130,
} as const;

export const CITY_INSIDE_DHAKA = "ঢাকার ভিতরে";
export const CITY_OUTSIDE_DHAKA = "ঢাকার বাহিরে";

export const CITY_OPTIONS = [
	{
		value: CITY_INSIDE_DHAKA,
		labelKey: "checkout.cities.insideDhaka",
		rate: DELIVERY_RATES.insideDhaka,
	},
	{
		value: CITY_OUTSIDE_DHAKA,
		labelKey: "checkout.cities.outsideDhaka",
		rate: DELIVERY_RATES.outsideDhaka,
	},
] as const;

export const isInsideDhaka = (cityName: string | undefined): boolean => {
	if (!cityName) return false;
	return cityName.includes("ভিতরে") || cityName.toLowerCase().includes("inside");
};

export const getDeliveryCharge = (cityName: string | undefined): number => {
	if (!cityName) return 0;
	return isInsideDhaka(cityName)
		? DELIVERY_RATES.insideDhaka
		: DELIVERY_RATES.outsideDhaka;
};
