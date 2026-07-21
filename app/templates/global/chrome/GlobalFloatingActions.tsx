"use client";

import { useAtomValue } from "jotai";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { businessSettingsAtom } from "@/store/ui-atoms";

/**
 * Floating WhatsApp action. Placed bottom-left (clear of the shared
 * back-to-top button, which sits bottom-right). Hidden when the business has
 * no contact phone. Reuses the contact number as the WhatsApp target.
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
			className="fixed bottom-20 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg ring-8 ring-[#25d366]/20 transition-transform hover:scale-105 md:bottom-8 md:left-8"
		>
			<MessageCircle className="h-7 w-7" />
		</a>
	);
}
