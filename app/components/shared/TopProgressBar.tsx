"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Global top navigation progress bar.
 *
 * The app ships no route-level `loading.tsx`, so a client navigation keeps the
 * current page visible until the next route's data resolves, then swaps. This
 * thin bar is the only "something is happening" feedback during that wait.
 *
 * Start is detected from real navigation signals: a capture-phase click on an
 * internal anchor (immediate feedback for <Link>), a patched History
 * `pushState` (programmatic `router.push`), and `popstate` (back/forward).
 * Completion fires when the resolved pathname + query actually change — which,
 * with no Suspense boundary, means the new page is ready. A safety timeout
 * clears the bar if a navigation is cancelled or resolves to the same URL.
 */
export function TopProgressBar() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [progress, setProgress] = useState(0);
	const [visible, setVisible] = useState(false);

	const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const activeRef = useRef(false);
	const doneFnRef = useRef<() => void>(() => {});

	useEffect(() => {
		const clearTrickle = () => {
			if (trickleRef.current) {
				clearInterval(trickleRef.current);
				trickleRef.current = null;
			}
		};

		const done = () => {
			if (!activeRef.current) return;
			activeRef.current = false;
			clearTrickle();
			if (safetyRef.current) {
				clearTimeout(safetyRef.current);
				safetyRef.current = null;
			}
			setProgress(100);
			hideTimerRef.current = setTimeout(() => {
				setVisible(false);
				setProgress(0);
			}, 250);
		};

		const start = () => {
			if (activeRef.current) return;
			activeRef.current = true;
			if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
			setVisible(true);
			setProgress(8);
			clearTrickle();
			// Trickle toward 90% while we wait for the route to resolve.
			trickleRef.current = setInterval(() => {
				setProgress((p) => (p < 90 ? p + Math.max(0.5, (90 - p) * 0.08) : p));
			}, 200);
			if (safetyRef.current) clearTimeout(safetyRef.current);
			safetyRef.current = setTimeout(done, 10000);
		};

		doneFnRef.current = done;

		// Programmatic navigations (router.push).
		const origPush = history.pushState;
		history.pushState = function (
			...args: Parameters<typeof history.pushState>
		) {
			start();
			return origPush.apply(this, args);
		};

		// Back / forward.
		const onPopState = () => start();
		window.addEventListener("popstate", onPopState);

		// Internal anchor clicks — immediate feedback for <Link>.
		const onClick = (e: MouseEvent) => {
			if (
				e.defaultPrevented ||
				e.button !== 0 ||
				e.metaKey ||
				e.ctrlKey ||
				e.shiftKey ||
				e.altKey
			)
				return;
			const anchor = (e.target as HTMLElement | null)?.closest?.("a");
			if (!anchor) return;
			const href = anchor.getAttribute("href");
			if (!href || anchor.getAttribute("target") === "_blank") return;
			if (anchor.hasAttribute("download")) return;
			let url: URL;
			try {
				url = new URL(href, window.location.href);
			} catch {
				return;
			}
			if (url.origin !== window.location.origin) return;
			// Same route (or hash-only) — nothing to track.
			if (
				url.pathname === window.location.pathname &&
				url.search === window.location.search
			)
				return;
			start();
		};
		document.addEventListener("click", onClick, true);

		return () => {
			history.pushState = origPush;
			window.removeEventListener("popstate", onPopState);
			document.removeEventListener("click", onClick, true);
			clearTrickle();
			if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
			if (safetyRef.current) clearTimeout(safetyRef.current);
		};
	}, []);

	// The resolved route changed → the new page is ready.
	useEffect(() => {
		doneFnRef.current();
	}, [pathname, searchParams]);

	if (!visible) return null;

	return (
		<div
			aria-hidden
			className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-0.5"
		>
			<div
				className="h-full bg-primary shadow-[0_0_8px_hsl(var(--primary)),0_0_4px_hsl(var(--primary))] transition-[width] duration-200 ease-out motion-reduce:transition-none"
				style={{ width: `${progress}%` }}
			/>
		</div>
	);
}
