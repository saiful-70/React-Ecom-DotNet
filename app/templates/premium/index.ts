import type { Template } from "../types";
import { PremiumHeader } from "./chrome/PremiumHeader";
import { PremiumFooter } from "./chrome/PremiumFooter";
import { PremiumHome } from "./home/PremiumHome";
import { PremiumProductListing } from "./product/PremiumProductListing";
import { PremiumProductDetails } from "./product/PremiumProductDetails";

/**
 * `premium` — single-brand editorial paradigm ("The Batch Label" world).
 * No secondary navigation bar (the header carries a compact collection nav),
 * no mobile bottom nav (a sticky buy bar owns the thumb zone on PDPs).
 */
export const premiumTemplate: Template = {
	id: "premium",
	chrome: {
		Header: PremiumHeader,
		Navigation: null,
		Footer: PremiumFooter,
		MobileNav: null,
		FloatingActions: null,
	},
	HomeLayout: PremiumHome,
	ProductListingLayout: PremiumProductListing,
	ProductDetailsLayout: PremiumProductDetails,
};
