"use client";

import { useEffect, useState } from "react";
import { getCities } from "@/(app-routes)/checkout/action";
import { BANGLADESH_COUNTRY_ID } from "@/lib/constants/delivery";
import type { City } from "@/(app-routes)/checkout/model";

/** Delivery cities from `GET /cities?country_id=` (name + shipping_cost). */
export function useCities(countryId: number = BANGLADESH_COUNTRY_ID): City[] {
	const [cities, setCities] = useState<City[]>([]);

	useEffect(() => {
		let active = true;
		getCities(countryId).then((res) => {
			if (active && res.success && Array.isArray(res.data)) {
				setCities(res.data);
			}
		});
		return () => {
			active = false;
		};
	}, [countryId]);

	return cities;
}
