"use client";

import { useSetAtom } from "jotai";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";

/**
 * Hook to handle authentication errors in client components
 * Clears profile state and redirects to login
 */
export function useAuthErrorHandler() {
	const setMiniProfile = useSetAtom(miniProfileAtom);
	const router = useRouter();

	const handleAuthError = (
		error: { needsLogin?: boolean; message?: string },
		currentPath?: string
	) => {
		if (error.needsLogin) {
			// Clear profile atom
			setMiniProfile(null);

			// Clear localStorage
			if (typeof window !== "undefined") {
				localStorage.removeItem("mini-profile");
			}

			// Redirect to login
			const loginUrl = currentPath
				? `/login?redirect=${encodeURIComponent(currentPath)}`
				: "/login";

			router.push(loginUrl);
			return true; // Indicates error was handled
		}

		return false; // Not an auth error
	};

	return { handleAuthError };
}
