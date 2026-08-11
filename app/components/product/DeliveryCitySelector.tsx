"use client";

import { useAtom } from "jotai";
import { Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import Price from "@/components/shared/Price";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shared/ui/select";
import { useVariant } from "@/components/shared/providers/variant-provider";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCities } from "@/hooks/use-cities";
import { deliveryCityAtom } from "@/store/delivery-city.atom";

/**
 * PDP delivery-zone picker: lets the shopper choose Inside/Outside Dhaka up
 * front, shows the resulting delivery charge, and persists the choice
 * (localStorage-backed atom) so checkout pre-selects the same city. Hidden on
 * the global/international template — Dhaka zones don't apply there.
 */
export function DeliveryCitySelector() {
	const { t } = useTranslation();
	const variant = useVariant();
	const isHydrated = useHydrated();
	// Backend city list (`GET /cities`); each row carries its delivery charge.
	const cities = useCities();
	const [deliveryCity, setDeliveryCity] = useAtom(deliveryCityAtom);

	if (variant.template === "global") {
		return null;
	}

	// The atom is localStorage-backed, so only trust its value once hydrated
	// to keep the first client render matching the server-rendered markup.
	const selected = isHydrated ? deliveryCity : null;

	const handleChange = (value: string) => {
		const city = cities.find((c) => c.name === value);
		if (!city) return;
		const rate =
			typeof city.shipping_cost === "string"
				? Number(city.shipping_cost)
				: city.shipping_cost;
		setDeliveryCity({
			value: city.name,
			cityId: city.id,
			rate: typeof rate === "number" && Number.isFinite(rate) ? rate : 0,
		});
	};

	return (
		<div className="border rounded-md bg-card px-4 py-3 space-y-2.5">
			<div className="flex items-center gap-2 text-sm font-medium text-foreground">
				<Truck className="w-4 h-4" />
				{t("product.deliveryArea")}
			</div>
			<Select value={selected?.value ?? ""} onValueChange={handleChange}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder={t("checkout.selectCity")} />
				</SelectTrigger>
				<SelectContent>
					{cities.map((city) => (
						<SelectItem key={city.id} value={city.name}>
							{city.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{selected && selected.rate > 0 && (
				<p className="text-sm text-muted-foreground">
					{t("checkout.shipping")}: <Price amount={selected.rate} />
				</p>
			)}
		</div>
	);
}
