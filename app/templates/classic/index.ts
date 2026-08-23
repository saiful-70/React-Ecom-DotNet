import type { Template } from "../types";
import { KhataHeader } from "./chrome/KhataHeader";
import { KhataNavigation } from "./chrome/KhataNavigation";
import { KhataFooter } from "./chrome/KhataFooter";
import { KhataMobileNav } from "./chrome/KhataMobileNav";
import { ClassicHome } from "./ClassicHome";
import { ClassicProductListing } from "./ClassicProductListing";
import { KhataProductDetails } from "./product/KhataProductDetails";

/**
 * CLASSIC — "The Mudir Dokan Khata".
 *
 * The neighbourhood grocer's ruled ledger: kraft-board masthead chrome, a
 * ruled category strip, ledger-entry product surfaces, and a printed ledger
 * close. Tap-to-call lives in the header trust line and the mobile bottom
 * nav, so there is no separate floating action.
 */
export const classicTemplate: Template = {
	id: "classic",
	chrome: {
		Header: KhataHeader,
		Navigation: KhataNavigation,
		Footer: KhataFooter,
		MobileNav: KhataMobileNav,
		FloatingActions: null,
	},
	HomeLayout: ClassicHome,
	ProductListingLayout: ClassicProductListing,
	ProductDetailsLayout: KhataProductDetails,
};
