"use client";

import { useAtomValue } from "jotai";
import { Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { businessSettingsAtom } from "@/store/ui-atoms";

/** Floating call FAB; hidden when the business has no phone number. */
export function BazarFloatingCall() {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);

	if (!settings?.contact_phone) return null;

	return (
		<a
			href={`tel:${settings.contact_phone}`}
			aria-label={t("bazar.call")}
			className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-8 ring-primary/20 transition-transform hover:scale-105 md:bottom-8 md:right-8"
		>
			<Phone className="h-6 w-6" />
		</a>
	);
}
