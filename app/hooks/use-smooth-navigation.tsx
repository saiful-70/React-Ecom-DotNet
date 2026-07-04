"use client";

import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { useCallback } from "react";

/**
 * Custom hook that provides smooth scroll navigation
 * Wraps Next.js router.push with smooth scroll behavior
 */
export function useSmoothNavigation() {
	const router = useRouter();

	const smoothPush = useCallback(
		(href: string, options?: { scroll?: boolean }) => {
			// Perform the navigation
			router.push(href, options);

			// After navigation, smooth scroll to top
			// Use setTimeout to ensure the new page has loaded
			setTimeout(() => {
				window.scrollTo({
					top: 0,
					behavior: "smooth",
				});
			}, 100);
		},
		[router]
	);

	return {
		...router,
		push: smoothPush,
		smoothPush, // Alternative name if you want to use both
	};
}
