"use client";

import React, { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { Button } from "./ui/button";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { cookieConsentAtom } from "@/store/cookie-consent.atom";
import { useFeature } from "@/components/shared/providers/variant-provider";

interface BackToTopButtonProps {
	className?: string;
}

export default function BackToTopButton({ className }: BackToTopButtonProps = {}) {
	const [isVisible, setIsVisible] = useState(false);
	const cookieConsent = useAtomValue(cookieConsentAtom);
	const cookieConsentEnabled = useFeature("cookieConsent");
	// The cookie-consent banner is fixed to the bottom of the viewport and, on
	// smaller screens, spans the full width — overlapping this button and
	// swallowing its click. Lift the button clear of the banner while it's shown.
	const bannerVisible = cookieConsentEnabled && !cookieConsent.consentGiven;

	useEffect(() => {
		const checkScroll = () => {
			// Simply check if user has scrolled down more than 50px
			const scrollY =
				window.pageYOffset ||
				window.scrollY ||
				document.documentElement.scrollTop;

			// Show button if scrolled more than 100px
			setIsVisible(scrollY > 100);
		};

		// Check on mount
		checkScroll();

		// Add scroll listener
		window.addEventListener("scroll", checkScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", checkScroll);
		};
	}, []);

	// Don't render button if not visible
	if (!isVisible) return null;
	return (
		<Button
			variant={"default"}
			className={cn(
				"fixed bottom-4 md:bottom-3 right-4 z-50 transition-[opacity,bottom] duration-300 shadow-lg",
				className
			)}
			// Sit above whichever fixed bottom UI is on screen. Two publishers may
			// contribute: the cookie banner (`--cookie-banner-height`) and a page's
			// bottom action bar (`--combo-actionbar-height`, e.g. the combo landing).
			// An inline style wins over the Tailwind bottom-* classes at every
			// breakpoint, so the button adapts to their real heights instead of
			// guessing. Falls back to 9rem for the banner before measurement.
			style={{
				bottom: `calc(1rem + var(--combo-actionbar-height, 0px) + ${
					bannerVisible ? "var(--cookie-banner-height, 9rem)" : "0px"
				})`,
			}}
			onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
			aria-label="Back to top"
			size="icon"
		>
			<ChevronUp className="size-5 sm:size-7" strokeWidth={4} />
		</Button>
	);
}
