import type { Template } from "../types";
import { BazarHeader } from "./chrome/BazarHeader";
import { BazarFooter } from "./chrome/BazarFooter";
import { BazarMobileNav } from "./chrome/BazarMobileNav";
import { BazarFloatingCall } from "./chrome/BazarFloatingCall";
import { BazarHome } from "./home/BazarHome";
import { BazarProductListing } from "./product/BazarProductListing";
import { BazarProductDetails } from "./product/BazarProductDetails";

/**
 * The "bazar" paradigm — adapted from the theme-1 reference: contact top bar,
 * department sidebar home, ribbon product cards with Buy Now, breadcrumb
 * listing, mobile bottom nav with a raised Home button, floating call FAB.
 */
export const bazarTemplate: Template = {
	id: "bazar",
	chrome: {
		Header: BazarHeader,
		Navigation: null,
		Footer: BazarFooter,
		MobileNav: BazarMobileNav,
		FloatingActions: BazarFloatingCall,
	},
	HomeLayout: BazarHome,
	ProductListingLayout: BazarProductListing,
	ProductDetailsLayout: BazarProductDetails,
};
