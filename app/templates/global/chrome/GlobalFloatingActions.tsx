"use client";

import { useAtomValue } from "jotai";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { businessSettingsAtom } from "@/store/ui-atoms";
import "../global.css";

/**
 * Floating WhatsApp action, redressed in-world: an ink-navy plate with a 2px
 * print corner and a printed label on wider screens. Bottom-left, clear of the
 * shared back-to-top button (bottom-right). Hidden without a contact phone;
 * behavior (wa.me target from the business phone) is unchanged.
 */
export function GlobalFloatingActions() {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);

	const waNumber = settings?.contact_phone?.replace(/[^\d]/g, "");
	if (!waNumber) return null;

	return (
		<a
			href={`https://wa.me/${waNumber}`}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={t("global.chatWhatsApp")}
			className="g-lift ring-warm-focus fixed bottom-20 left-4 z-40 flex h-12 items-center gap-2 rounded-sm bg-secondary px-3.5 text-secondary-foreground shadow-md md:bottom-8 md:left-8"
		>
			<MessageCircle className="h-5 w-5" />
			<span className="hidden text-xs font-semibold uppercase tracking-[0.08em] md:inline">
				{t("global.chatWhatsApp")}
			</span>
		</a>
	);
}
