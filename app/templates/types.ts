import type { ComponentType } from "react";
import type { Banner, FeaturedCategory } from "@/components/home/_data/types";
import type { Product, PaginationMeta } from "@/(app-routes)/products/model";
import type { Category } from "@/components/shared/models/category";
import type { Brand } from "@/components/shared/models/brand";
import type { FeatureFlags, TemplateId } from "@/variants/types";
import type { Bundle } from "@/lib/bundles/types";

/**
 * Template system types.
 *
 * A template is a layout PARADIGM: chrome (header/footer/nav) plus page-level
 * layouts. Templates are presentation only — data is fetched by the shared
 * routes/actions and passed in as serializable props. Exception: page-level
 * layouts (like chrome slots, see below) MAY be async Server Components that
 * call the shared cached actions themselves, as BazarHome does. A variant
 * picks a template by id; a client deployment is template × theme × branding
 * × flags.
 *
 * Chrome slots take no props: each slot may be an async Server Component that
 * reads its own data through the shared cached actions (the same pattern as
 * HeaderWrapper/FooterWrapper today), or a client component reading atoms.
 */

export interface HomeLayoutProps {
  banners: Banner[];
  featuredCategories: FeaturedCategory[];
  features: FeatureFlags;
}

export type ProductsQuery = Record<
  string,
  string | number | (string | number)[]
>;

export interface ProductListingLayoutProps {
  products: Product[];
  meta: PaginationMeta | null;
  categories: Category[];
  brands: Brand[];
  activeFiltersCount: number;
  baseQuery: ProductsQuery;
  /** Remount key: any filter/sort/search change resets the infinite list. */
  infiniteListKey: string;
  viewMode: "grid" | "list";
  perPage: number;
  /** Selected category's name when exactly one category_id filter is active. */
  selectedCategoryName: string | null;
}

export interface ProductDetailsLayoutProps {
  product: Product;
  /**
   * Quantity bundle attached to this product, when the `bundles` feature flag is
   * on and the backend/mock returns one. Optional so templates that don't render
   * bundles simply ignore it.
   */
  bundle?: Bundle | null;
}

export interface TemplateChrome {
  Header: ComponentType;
  /** Secondary nav bar under the header; null when the template has none. */
  Navigation: ComponentType | null;
  Footer: ComponentType;
  /** Fixed bottom navigation on mobile; null when the template has none. */
  MobileNav: ComponentType | null;
  /** Floating action button(s), e.g. a call FAB; null when none. */
  FloatingActions: ComponentType | null;
}

export interface Template {
  id: TemplateId;
  chrome: TemplateChrome;
  HomeLayout: ComponentType<HomeLayoutProps>;
  ProductListingLayout: ComponentType<ProductListingLayoutProps>;
  ProductDetailsLayout: ComponentType<ProductDetailsLayoutProps>;
}
