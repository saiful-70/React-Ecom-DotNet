"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { cookieConsentAtom } from "@/store/cookie-consent.atom";

/**
 * Rendered instead of CookieBanner when a variant turns `cookieConsent` off.
 * Every cookie category is always on: GA, Meta Pixel and the backend event
 * tracker all stay off until consent is stored, so this stores it (and
 * overrides any earlier rejection saved while the banner was still shown).
 */
export function ImpliedConsent() {
	const [consent, setConsent] = useAtom(cookieConsentAtom);
	const allGranted =
		consent.consentGiven &&
		consent.functional &&
		consent.analytics &&
		consent.marketing;

	useEffect(() => {
		if (allGranted) return;
		setConsent({
			necessary: true,
			functional: true,
			analytics: true,
			marketing: true,
			consentGiven: true,
			consentDate: new Date().toISOString(),
		});
	}, [allGranted, setConsent]);

	return null;
}
