"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";

interface I18nProviderProps {
	children: React.ReactNode;
	/**
	 * Language resolved server-side from the `language` cookie. Applying it here
	 * (synchronously, on both the SSR pass and the client hydration pass) keeps
	 * the rendered markup identical, so there's no hydration mismatch and no
	 * racing post-mount language switch.
	 */
	language?: string;
}

export function I18nProvider({ children, language }: I18nProviderProps) {
	// Runs during render on server and client with the same `language` value,
	// so the singleton is set before any `useTranslation()` child reads it.
	if (language && i18n.language !== language) {
		i18n.changeLanguage(language);
	}

	return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
