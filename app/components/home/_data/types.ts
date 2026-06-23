/**
 * Demo-data types for homepage sections that have no backend API yet:
 *  - Hero banner carousel
 *  - Featured categories strip
 *
 * Copy is stored bilingually (bn primary + en) so the components can resolve
 * by the active i18n language without extra translation keys. When the backend
 * endpoints described in `docs/api/banners-and-featured-categories.md` land,
 * these shapes map 1:1 onto the API responses (localized `title`/`name` etc.).
 */

export interface HeroBanner {
	id: number;
	title_bn: string;
	title_en: string;
	subtitle_bn: string;
	subtitle_en: string;
	/** Full-bleed banner image (remote URLs are allowed via next.config wildcard). */
	image: string;
	cta_label_bn: string;
	cta_label_en: string;
	/** Internal route the CTA links to, e.g. "/products?is_featured=1". */
	cta_href: string;
	sort_order: number;
}

export interface FeaturedCategory {
	id: number;
	slug: string;
	name_bn: string;
	name_en: string;
	/** Icon/illustration image for the category tile. */
	icon: string;
	/** Listing route the tile links to. */
	href: string;
	sort_order: number;
}
