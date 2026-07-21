import type { Template } from "../types";
import { GlobalHeader } from "./chrome/GlobalHeader";
import { GlobalNavbar } from "./chrome/GlobalNavbar";
import { GlobalFooter } from "./chrome/GlobalFooter";
import { GlobalMobileNav } from "./chrome/GlobalMobileNav";
import { GlobalFloatingActions } from "./chrome/GlobalFloatingActions";
import { GlobalHome } from "./home/GlobalHome";
import { GlobalProductListing } from "./product/GlobalProductListing";
import { GlobalProductDetails } from "./product/GlobalProductDetails";

/**
 * The "global" paradigm — a 6Valley-style international marketplace: utility
 * top bar (contact · currency · language), category mega-menu, department-rail
 * hero, flash-deal countdown, category showcases, brand strip, best-selling /
 * top-rated split, service-guarantee footer, mobile bottom nav, WhatsApp FAB.
 * Used by the intl-01 variant.
 */
export const globalTemplate: Template = {
	id: "global",
	chrome: {
		Header: GlobalHeader,
		Navigation: GlobalNavbar,
		Footer: GlobalFooter,
		MobileNav: GlobalMobileNav,
		FloatingActions: GlobalFloatingActions,
	},
	HomeLayout: GlobalHome,
	ProductListingLayout: GlobalProductListing,
	ProductDetailsLayout: GlobalProductDetails,
};
