import { usePathname, useSearchParams } from "next/navigation";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";

/**
 * Custom hook for managing tab navigation with URL parameters
 * Provides a reusable way to handle tab switching and URL state sync
 */
export const useTabNavigation = () => {
	const searchParams = useSearchParams();
	const { replace } = useRouter();
	const pathname = usePathname();
	const tab = searchParams.get("tab");

	/**
	 * Generic tab click handler that updates URL parameters
	 * @param tabId - The tab identifier to set (or undefined to remove)
	 */
	const handleTabClick = (tabId?: string) => {
		const params = new URLSearchParams(searchParams);

		if (tabId) {
			params.set("tab", tabId);
		} else {
			params.delete("tab");
		}

		replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	return {
		tab,
		handleTabClick,
	};
};
