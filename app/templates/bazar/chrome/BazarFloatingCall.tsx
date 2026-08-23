"use client";

import { useAtomValue } from "jotai";
import { Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { businessSettingsAtom } from "@/store/ui-atoms";
import "../bazar.css";

/**
 * Floating call key — the counter's "just call us" escape hatch, rebuilt as a
 * board-black keypad key with the azure phone glyph. Hidden when the business
 * has no phone number. Sits above the mobile keypad; bottom-left on desktop.
 */
export function BazarFloatingCall() {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);

	if (!settings?.contact_phone) return null;

	return (
		<a
			href={`tel:${settings.contact_phone}`}
			aria-label={t("bazar.callNow", "এখনই কল করুন")}
			className="bz-key ring-warm-focus group fixed bottom-20 left-4 z-40 flex h-14 items-center gap-0 overflow-hidden rounded-lg border border-primary/50 bg-secondary text-secondary-foreground shadow-warm-lg md:bottom-8 md:left-8"
		>
			<span className="flex h-14 w-14 shrink-0 items-center justify-center">
				<Phone className="h-6 w-6 text-primary" aria-hidden="true" />
			</span>
			<span className="bz-num max-w-0 overflow-hidden whitespace-nowrap pr-0 font-display text-sm font-bold opacity-0 transition-all duration-300 ease-out group-hover:max-w-40 group-hover:pr-4 group-hover:opacity-100 group-focus-visible:max-w-40 group-focus-visible:pr-4 group-focus-visible:opacity-100">
				{settings.contact_phone}
			</span>
		</a>
	);
}
