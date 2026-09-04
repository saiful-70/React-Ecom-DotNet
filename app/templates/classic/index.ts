import type { Template } from "../types";
import { ClassicHeader } from "./chrome/ClassicHeader";
import { ClassicNavigation } from "./chrome/ClassicNavigation";
import { ClassicFooter } from "./chrome/ClassicFooter";
import { ClassicMobileNav } from "./chrome/ClassicMobileNav";
import { ClassicHome } from "./ClassicHome";
import { ClassicProductListing } from "./ClassicProductListing";
import { ClassicProductDetails } from "./product/ClassicProductDetails";
import { ClassicCombo } from "./product/ClassicCombo";

/**
 * CLASSIC — "The Open Shopfront".
 *
 * The BD retail standard played straight: a white sticky masthead over a
 * utility strip, a department line, the banner carousel as the first content
 * of the home page, 1:1 photography, and one vermilion-orange carrying every
 * buy action. Tap-to-call lives in the utility strip and the mobile bottom
 * bar, so there is no separate floating action.
 */
export const classicTemplate: Template = {
	id: "classic",
	chrome: {
		Header: ClassicHeader,
		Navigation: ClassicNavigation,
		Footer: ClassicFooter,
		MobileNav: ClassicMobileNav,
		FloatingActions: null,
	},
	HomeLayout: ClassicHome,
	ProductListingLayout: ClassicProductListing,
	ProductDetailsLayout: ClassicProductDetails,
	ComboLayout: ClassicCombo,
};
