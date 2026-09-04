import type { Template } from "../types";
import { BazarHeader } from "./chrome/BazarHeader";
import { BazarFooter } from "./chrome/BazarFooter";
import { BazarMobileNav } from "./chrome/BazarMobileNav";
import { BazarFloatingCall } from "./chrome/BazarFloatingCall";
import { BazarHome } from "./home/BazarHome";
import { BazarProductListing } from "./product/BazarProductListing";
import { BazarProductDetails } from "./product/BazarProductDetails";
import { BazarCombo } from "./product/BazarCombo";

/**
 * The "bazar" paradigm — The Flexiload Counter: board-black chrome with
 * tap-to-call, a tariff-board hero of chart-row offers, SIM-coloured
 * department chips (one hue per department, end-to-end), a keypad bottom
 * nav in the thumb zone, and a floating call key. Phone-first, COD-first.
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
	ComboLayout: BazarCombo,
};
