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
 * The "global" paradigm — THE MAIL-ORDER INDEX. An international marketplace
 * set as a great mail-order catalogue: masthead with dominant search,
 * index-tab department rail, one composed hero tableau on a horizon datum
 * (never a carousel), a sale-red deals insert with an honest validity line,
 * numbered plates with printed availability, filter chips + facet buttons,
 * guest-first PDP with a sticky mobile buy bar, colophon footer, mobile
 * bottom nav, WhatsApp action. Used by the intl-01 variant.
 * See DESIGN.md in this folder for the committed visual world.
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
