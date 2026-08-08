"use client";

/**
 * Global browser-analytics auto-events. Mounted once in the root layout so
 * every route gets PageView / ScrollDepth / TimeOnPage / ExitPage tracking
 * without each page having to wire it up. Renders nothing — all consent
 * gating and network delivery live in `@/lib/analytics/tracking`.
 *
 * Also captures UTM attribution on first load and replays any events that
 * were queued while the browser was offline.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
	trackPageView,
	trackScrollDepth,
	trackExitPage,
	trackTimeOnPage,
	trackTimeOnPageOnExit,
	captureUtmParams,
	flushQueuedEvents,
} from "@/lib/analytics/tracking";

const SCROLL_DEPTH_THRESHOLDS = [25, 50, 75, 100] as const;

// Heartbeat cadence for TimeOnPage. 30s balances resolution against request
// volume — at 15s a long read would eat the proxy's per-IP rate budget.
const TIME_ON_PAGE_HEARTBEAT_MS = 30_000;

// Don't emit a TimeOnPage for a route the user merely passed through.
const MIN_REPORTABLE_SECONDS = 2;

export function AnalyticsTracker() {
	const pathname = usePathname();

	// Guards against firing PageView twice for the same pathname (e.g. a
	// re-render that doesn't actually change the route).
	const lastTrackedPathRef = useRef<string | null>(null);
	// Reset on every pathname change so TimeOnPage measures time on the
	// current page only.
	const enteredAtRef = useRef<number>(Date.now());
	// Seconds already reported by heartbeats for the current page, so the
	// final report on leave sends only the remainder.
	const reportedSecondsRef = useRef(0);

	// UTM capture + offline replay. Runs once per full page load: UTM params
	// only ever arrive on the entry URL, and a client-side navigation doesn't
	// remount this component.
	useEffect(() => {
		captureUtmParams(window.location.search);
		void flushQueuedEvents();

		const handleOnline = () => void flushQueuedEvents();
		window.addEventListener("online", handleOnline);
		return () => window.removeEventListener("online", handleOnline);
	}, []);

	// PageView — fires on mount (initial page) and on every pathname change.
	// Also flushes TimeOnPage for the page being left, which `pagehide` never
	// sees because App Router navigations don't unload the document.
	useEffect(() => {
		if (lastTrackedPathRef.current === pathname) return;

		const isFirstPage = lastTrackedPathRef.current === null;
		if (!isFirstPage) {
			const unreported =
				Math.round((Date.now() - enteredAtRef.current) / 1000) -
				reportedSecondsRef.current;
			if (unreported >= MIN_REPORTABLE_SECONDS) {
				void trackTimeOnPage(unreported);
			}
		}

		lastTrackedPathRef.current = pathname;
		enteredAtRef.current = Date.now();
		reportedSecondsRef.current = 0;
		void trackPageView(pathname);
	}, [pathname]);

	// TimeOnPage heartbeat — reports the elapsed delta so the backend can sum
	// heartbeats into a total without double-counting.
	useEffect(() => {
		const interval = window.setInterval(() => {
			// A backgrounded tab isn't "time on page" in any useful sense.
			if (document.visibilityState !== "visible") return;

			const elapsed = Math.round((Date.now() - enteredAtRef.current) / 1000);
			const delta = elapsed - reportedSecondsRef.current;
			if (delta < MIN_REPORTABLE_SECONDS) return;

			reportedSecondsRef.current = elapsed;
			void trackTimeOnPage(delta);
		}, TIME_ON_PAGE_HEARTBEAT_MS);

		return () => window.clearInterval(interval);
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
					void trackScrollDepth(mark);
				}
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [pathname]);

	// ExitPage + TimeOnPage — `pagehide` fires reliably on mobile/back-forward
	// cache navigations, unlike `beforeunload`/`unload`. Both go out via
	// sendBeacon, the only transport guaranteed to survive unload.
	useEffect(() => {
		const handlePageHide = () => {
			const unreported =
				Math.round((Date.now() - enteredAtRef.current) / 1000) -
				reportedSecondsRef.current;

			trackExitPage();
			if (unreported >= MIN_REPORTABLE_SECONDS) {
				trackTimeOnPageOnExit(unreported);
			}
		};

		window.addEventListener("pagehide", handlePageHide);
		return () => window.removeEventListener("pagehide", handlePageHide);
	}, [pathname]);

	return null;
}

export default AnalyticsTracker;
