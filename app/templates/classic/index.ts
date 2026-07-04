import { HeaderWrapper } from "@/components/layout/HeaderWrapper";
import { Navigation } from "@/components/layout/Navigation";
import FooterWrapper from "@/components/layout/FooterWrapper";
import { ProductDetails } from "@/components/pages/ProductDetails";
import type { Template } from "../types";
import { ClassicHome } from "./ClassicHome";
import { ClassicProductListing } from "./ClassicProductListing";

/**
 * The original storefront paradigm. Chrome slots are the existing wrapper
 * components (each fetches its own categories via the 1h-cached action, so
 * there is no extra backend cost). Mobile nav lives inside Header, hence null.
 */
export const classicTemplate: Template = {
	id: "classic",
	chrome: {
		Header: HeaderWrapper,
		Navigation: Navigation,
		Footer: FooterWrapper,
		MobileNav: null,
		FloatingActions: null,
	},
	HomeLayout: ClassicHome,
	ProductListingLayout: ClassicProductListing,
	ProductDetailsLayout: ProductDetails,
};
