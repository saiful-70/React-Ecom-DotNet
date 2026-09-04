import type { Template } from "../types";
import { PantryHeader } from "./chrome/PantryHeader";
import { PantryFooter } from "./chrome/PantryFooter";
import { PantryCallFab } from "./chrome/PantryCallFab";
import { PantryHome } from "./home/PantryHome";
import { PantryProductListing } from "./product/PantryProductListing";
import { PantryProductDetails } from "./product/PantryProductDetails";
import { PantryCombo } from "./product/PantryCombo";

/**
 * `pantry` — single-brand Bengali natural-food paradigm ("The Natural Pantry").
 *
 * No secondary navigation bar: a nine-product pantry needs a category rail on
 * the home page, not a mega-menu. No mobile bottom nav either — the PDP's
 * sticky order bar owns the thumb zone, and two fixed bars on a 360px phone is
 * one too many. Tap-to-call rides as a floating action instead, so the shop's
 * phone number is reachable from every scroll position.
 */
export const pantryTemplate: Template = {
	id: "pantry",
	chrome: {
		Header: PantryHeader,
		Navigation: null,
		Footer: PantryFooter,
		MobileNav: null,
		FloatingActions: PantryCallFab,
	},
	HomeLayout: PantryHome,
	ProductListingLayout: PantryProductListing,
	ProductDetailsLayout: PantryProductDetails,
	ComboLayout: PantryCombo,
};
