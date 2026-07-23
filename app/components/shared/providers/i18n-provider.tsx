"use client";

import { useMemo } from "react";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { i18nOptions } from "@/i18n";

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
	// Build a fresh i18next instance per render, keyed on the resolved
	// `language`, instead of mutating the shared `@/i18n` singleton. Two
	// concurrent SSR requests rendering in different languages used to share
	// (and race on) that singleton, so request A could render in request B's
	// language. Each request/render now gets its own isolated instance, and
	// server + client compute it from the same `language` value so the
	// markup still matches on hydration.
	const instance = useMemo(() => {
		const i18nInstance = createInstance();
		i18nInstance.use(initReactI18next).init({
			...i18nOptions,
			lng: language ?? i18nOptions.lng,
		});
		return i18nInstance;
	}, [language]);

	return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
