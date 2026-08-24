"use client";

import "../classic.css";

import { useAtomValue } from "jotai";
import { BadgeCheck, Phone, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import Price from "@/components/shared/Price";
import { useCities } from "@/hooks/use-cities";
import { getBusinessSettingAsNumber } from "@/lib/utils/business-settings";
import { businessSettingsAtom } from "@/store/ui-atoms";

/**
 * What the shopper needs before any order button on this page: cash on
 * delivery, the delivery window, the per-zone delivery fee straight from the
 * cities API, the free-shipping threshold, and the phone number to call. It
 * sits directly under the carousel so the cost is known before the first
 * "order" in the offer rail below.
 */
export function ClassicDeliveryStrip() {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);
	const cities = useCities();

	const freeShippingOver = settings
		? getBusinessSettingAsNumber(settings, "free_shipping_on_over", 0)
		: 0;

	// Zone fees from the backend city table. Two zones keep the strip to one
	// line on a phone; the rest are counted so a merchant with more zones is
	// never silently under-quoted here — the full table prints on the PDP,
	// above the order button. Absent data degrades to the promise line alone.
	const allFees = cities
		.map((city) => ({
			id: city.id,
			name: city.name,
			amount:
				typeof city.shipping_cost === "string"
					? Number(city.shipping_cost)
					: city.shipping_cost,
		}))
		.filter(
			(row): row is { id: number; name: string; amount: number } =>
				typeof row.amount === "number" && Number.isFinite(row.amount)
		);
	const feeRows = allFees.slice(0, 2);
	const hiddenZones = allFees.length - feeRows.length;

	return (
		<section
			aria-label={t("classic2.deliveryTerms", "ডেলিভারি ও পেমেন্ট")}
			className="border-b border-border bg-background"
		>
			{/* Every fact stays; only its vertical cost changes. On a phone the
			    strip is three tight rows (terms / zone fees / threshold + call);
			    from `md` the wrapper rows go `display: contents` so the leaves
			    become flex items of one single line again. */}
			<div className="container mx-auto grid gap-y-1 py-2 text-xs leading-snug md:flex md:flex-wrap md:items-center md:gap-x-6 md:gap-y-2 md:py-3 md:text-sm">
				<div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 md:contents">
					<span className="flex items-center gap-1.5 font-bold text-success">
						<BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
						{t("classic2.codBadge", "ক্যাশ অন ডেলিভারি")}
					</span>
					<span className="flex items-center gap-1.5 text-success">
						<Truck
							className="hidden h-4 w-4 shrink-0 md:block"
							aria-hidden
						/>
						{t(
							"classic2.deliveryPromise",
							"ঢাকায় ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ২–৩ দিন"
						)}
					</span>
				</div>
				{feeRows.length > 0 && (
					<div className="grid grid-cols-2 gap-x-4 md:contents">
						{feeRows.map((row) => (
							<span
								key={row.id}
								className="flex items-center justify-between gap-1.5 text-muted-foreground md:justify-start"
							>
								<span className="truncate">
									<span className="hidden md:inline">
										{t(
											"classic2.deliveryFeeZone",
											"ডেলিভারি চার্জ"
										)}{" "}
										—{" "}
									</span>
									{row.name}
								</span>
								<span className="classic-price font-bold text-foreground">
									<Price amount={row.amount} />
								</span>
							</span>
						))}
						{hiddenZones > 0 && (
							<span className="col-span-2 text-muted-foreground md:col-auto">
								{t(
									"classic2.moreZones",
									"+{{count}} আরও এলাকার চার্জ পণ্যের পাতায়",
									{ count: hiddenZones }
								)}
							</span>
						)}
					</div>
				)}
				<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5 md:contents">
					{freeShippingOver > 0 && (
						<span className="text-muted-foreground">
							<span className="classic-price font-bold text-foreground">
								<Price amount={freeShippingOver} />
							</span>
							{"+ "}
							{t(
								"classic2.freeShippingOver",
								"অর্ডারে ডেলিভারি ফ্রি"
							)}
						</span>
					)}
					{settings?.contact_phone && (
						<a
							href={`tel:${settings.contact_phone}`}
							className="ring-warm-focus flex min-h-11 items-center gap-1.5 rounded-md font-bold text-primary underline-offset-4 hover:underline md:ml-auto"
						>
							<Phone className="h-4 w-4 shrink-0" aria-hidden />
							<span className="hidden md:inline">
								{t("classic2.callToOrder", "ফোনে অর্ডার")}
							</span>
							<span className="classic-price">
								{settings.contact_phone}
							</span>
						</a>
					)}
				</div>
			</div>
		</section>
	);
}
