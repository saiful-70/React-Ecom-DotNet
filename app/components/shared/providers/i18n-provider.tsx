"use client";

import { I18nextProvider } from "react-i18next";
import { useEffect } from "react";
import i18n from "@/i18n";

export function I18nProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		// Apply the user's saved language AFTER hydration. Doing it here (not at
		// init) keeps the SSR and first client render identical, so there's no
		// hydration mismatch; the switch is a normal post-mount client update.
		const saved =
			typeof window !== "undefined"
				? localStorage.getItem("language")
				: null;
		if (saved && saved !== i18n.language) {
			i18n.changeLanguage(saved);
		}
	}, []);

	return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
