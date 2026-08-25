"use client";

import "../pantry.css";

import { useAtomValue } from "jotai";
import { Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { businessSettingsAtom } from "@/store/ui-atoms";

/**
 * The persistent phone affordance. This paradigm has no mobile bottom nav — a
 * nine-product single-brand pantry does not need one — so tap-to-call rides as
 * a floating action instead and the shop's number stays one thumb away from
 * every scroll position.
 *
 * It renders nothing when the business reports no phone number, and it lifts
 * itself clear of the product page's sticky order bar by reading the
 * `--pn-order-bar` variable that bar publishes on <html> while mounted. Anchored
 * right, never the horizontal centre, so back-to-top and any centred bar stay
 * reachable.
 */
export function PantryCallFab() {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);

	if (!settings?.contact_phone) return null;

	return (
		<a
			href={`tel:${settings.contact_phone}`}
			aria-label={t("pantry.callToOrder", "অর্ডারে কল করুন")}
			style={{ bottom: "calc(1rem + var(--pn-order-bar, 0px))" }}
			className="ring-warm-focus group fixed right-4 z-40 flex h-14 items-center overflow-hidden rounded-lg bg-primary text-primary-foreground shadow-warm-lg transition-colors hover:bg-secondary md:right-6"
		>
			<span className="flex h-14 w-14 shrink-0 items-center justify-center">
				<Phone className="h-6 w-6" aria-hidden />
			</span>
			<span className="max-w-0 overflow-hidden whitespace-nowrap pr-0 text-sm font-semibold tabular-nums opacity-0 transition-all duration-300 ease-out motion-reduce:transition-none group-hover:max-w-44 group-hover:pr-4 group-hover:opacity-100 group-focus-visible:max-w-44 group-focus-visible:pr-4 group-focus-visible:opacity-100">
				{settings.contact_phone}
			</span>
		</a>
	);
}
