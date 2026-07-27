"use client";

/**
 * Global browser-analytics auto-events. Mounted once in the root layout so
 * every route gets PageView / ScrollDepth / ExitPage / TimeOnPage tracking
 * without each page having to wire it up. Renders nothing — all consent
 * gating and network delivery live in `@/lib/analytics/tracking`.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
	trackPageView,
	trackScrollDepth,
	trackExitPage,
	trackTimeOnPage,
} from "@/lib/analytics/tracking";

const SCROLL_DEPTH_THRESHOLDS = [25, 50, 75, 100] as const;

export function AnalyticsTracker() {
	const pathname = usePathname();

	// Guards against firing PageView twice for the same pathname (e.g. a
	// re-render that doesn't actually change the route).
	const lastTrackedPathRef = useRef<string | null>(null);
	// Reset on every pathname change so TimeOnPage measures time on the
	// current page only.
	const enteredAtRef = useRef<number>(Date.now());

	// PageView — fires on mount (initial page) and on every pathname change.
	useEffect(() => {
		if (lastTrackedPathRef.current === pathname) return;
		lastTrackedPathRef.current = pathname;
		enteredAtRef.current = Date.now();
		trackPageView(pathname);
	}, [pathname]);

	// ScrollDepth — thresholds are per-page, so the fired set is recreated
	// whenever the pathname changes.
	useEffect(() => {
		const firedMarks = new Set<number>();

		const handleScroll = () => {
			const scrollTop = window.scrollY || document.documentElement.scrollTop;
			const scrollableHeight =
				document.documentElement.scrollHeight - window.innerHeight;

			// Page is shorter than (or equal to) the viewport — nothing to scroll.
			if (scrollableHeight <= 0) return;

			const scrolledPercent = (scrollTop / scrollableHeight) * 100;

			for (const mark of SCROLL_DEPTH_THRESHOLDS) {
				if (scrolledPercent >= mark && !firedMarks.has(mark)) {
					firedMarks.add(mark);
					trackScrollDepth(mark);
				}
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [pathname]);

	// ExitPage + TimeOnPage — `pagehide` fires reliably on mobile/back-forward
	// cache navigations, unlike `beforeunload`/`unload`.
	useEffect(() => {
		const handlePageHide = () => {
			const secondsSinceEnter = Math.round(
				(Date.now() - enteredAtRef.current) / 1000
			);
			trackExitPage();
			trackTimeOnPage(secondsSinceEnter);
		};

		window.addEventListener("pagehide", handlePageHide);
		return () => window.removeEventListener("pagehide", handlePageHide);
	}, [pathname]);

	return null;
}

export default AnalyticsTracker;
