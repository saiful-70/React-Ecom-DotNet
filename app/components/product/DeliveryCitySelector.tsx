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
import { CITY_OPTIONS, getCityOptionByValue } from "@/lib/constants/delivery";
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
	const [deliveryCity, setDeliveryCity] = useAtom(deliveryCityAtom);

	if (variant.template === "global") {
		return null;
	}

	// The atom is localStorage-backed, so only trust its value once hydrated
	// to keep the first client render matching the server-rendered markup.
	const selected = isHydrated ? deliveryCity : null;

	const handleChange = (value: string) => {
		const option = getCityOptionByValue(value);
		if (!option) return;
		setDeliveryCity({
			value: option.value,
			cityId: option.backendCityId,
			rate: option.rate,
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
					{CITY_OPTIONS.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{t(option.labelKey)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{selected && (
				<p className="text-sm text-muted-foreground">
					{t("checkout.shipping")}: <Price amount={selected.rate} />
				</p>
			)}
		</div>
	);
}
