# Template Layer + bn-02 "Bazar" Paradigm Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a template layer (reusable layout paradigms) to the variant system and implement the "bazar" template (theme-1 reference style) as the real UI for variant `bn-02`.

**Architecture:** A `Template` is a typed registry object of presentation components (chrome + page layouts). Shared routes (`app/layout.tsx`, `app/page.tsx`, products pages) resolve `getTemplate(variant.template)` and render through its slots. `classic` re-exports the existing components (zero visual change for bn-01/intl-01); `bazar` implements the new paradigm. Data fetching stays in shared server actions/pages.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind, shadcn/ui, Jotai, react-i18next.

**Spec:** `docs/superpowers/specs/2026-07-04-template-layer-bn02-bazar-design.md`

## Global Constraints

- No test runner exists. The test cycle for every task is: `npm run type-check` then `npm run lint`. Never claim tests pass.
- All imports use the `@/*` alias (maps to `app/*`). No `../../` imports.
- Internal links MUST use `VariantLink` (import as `Link` from `@/components/shared/ui/variant-link`) and `useVariantRouter` (import as `useRouter` from `@/hooks/use-variant-router`) so `/demo/<id>` prefixes survive navigation.
- All user-facing strings via `react-i18next` `t()` keys. Currency via the `Price` component (`@/components/shared/Price`) — never hardcode `৳` or USD.
- No hardcoded contact info/brand text — read from `businessSettingsAtom` (client) or normalized business settings (server). The reference screenshots' ProDevs details are visual reference only.
- `app/variants/*` is imported by edge middleware. It must NEVER import runtime code from `app/templates/*` (the `TemplateId` type lives in `app/variants/types.ts` for exactly this reason).
- Server Components by default; `"use client"` only where hooks/browser APIs are needed.
- Images: always `next/image` `<Image>`.
- Windows environment; run commands from repo root `D:\me-dev\ashraful-vai\React-Ecom-DotNet`.
- Commit after every task with the trailer:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: `TemplateId` type + `template` field on all variant descriptors

**Files:**
- Modify: `app/variants/types.ts`
- Modify: `app/variants/bn-01/index.ts`
- Modify: `app/variants/bn-02/index.ts`
- Modify: `app/variants/intl-01/index.ts`

**Interfaces:**
- Produces: `TemplateId = "classic" | "bazar"` exported from `@/variants/types`; `VariantDescriptor.template: TemplateId` (required). All three descriptors get `template: "classic"` for now (bn-02 flips to `"bazar"` in Task 12).

- [ ] **Step 1: Add the type and field to `app/variants/types.ts`**

After the `VariantLanguage` type declaration, add:

```ts
/**
 * Which layout paradigm (template) a variant renders through. A template is a
 * registry of presentation components (chrome + page layouts) under
 * app/templates/<id>/. Templates are code; variants select one by id, so this
 * union — not component imports — is all the variant layer knows about them.
 */
export type TemplateId = "classic" | "bazar";
```

In `VariantDescriptor`, after the `market: Market;` line, add:

```ts
  /** Layout paradigm rendered for this variant (see app/templates/registry.ts). */
  template: TemplateId;
```

- [ ] **Step 2: Set `template: "classic"` in all three descriptors**

In each of `app/variants/bn-01/index.ts`, `app/variants/bn-02/index.ts`, `app/variants/intl-01/index.ts`, add one line directly under `market:`:

```ts
  template: "classic",
```

- [ ] **Step 3: Verify**

Run: `npm run type-check` — Expected: exit 0, no errors.
Run: `npm run lint` — Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add app/variants
git commit -m "feat(templates): add TemplateId and template field to variant descriptors"
```

---

### Task 2: Template contract, classic template, registry

**Files:**
- Create: `app/templates/types.ts`
- Create: `app/templates/classic/ClassicHome.tsx`
- Create: `app/templates/classic/ClassicProductListing.tsx`
- Create: `app/templates/classic/index.ts`
- Create: `app/templates/registry.ts`

**Interfaces:**
- Consumes: `TemplateId` from Task 1; existing components `HeaderWrapper`, `Navigation`, `FooterWrapper`, `ProductDetails`, and the JSX currently inline in `app/page.tsx` / `app/(app-routes)/products/page.tsx`.
- Produces: `Template`, `HomeLayoutProps`, `ProductListingLayoutProps`, `ProductDetailsLayoutProps`, `ProductsQuery` types from `@/templates/types`; `getTemplate(id: TemplateId): Template` from `@/templates/registry`; `classicTemplate` from `@/templates/classic`.

- [ ] **Step 1: Write `app/templates/types.ts`**

```ts
import type { ComponentType } from "react";
import type { Banner, FeaturedCategory } from "@/components/home/_data/types";
import type { Product, PaginationMeta } from "@/(app-routes)/products/model";
import type { Category } from "@/components/shared/models/category";
import type { Brand } from "@/components/shared/models/brand";
import type { FeatureFlags, TemplateId } from "@/variants/types";

/**
 * Template system types.
 *
 * A template is a layout PARADIGM: chrome (header/footer/nav) plus page-level
 * layouts. Templates are presentation only — data is fetched by the shared
 * routes/actions and passed in as serializable props. A variant picks a
 * template by id; a client deployment is template × theme × branding × flags.
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
```

- [ ] **Step 2: Write `app/templates/classic/ClassicHome.tsx`**

This is the current body of `app/page.tsx` moved verbatim into a layout component (the page keeps metadata + structured data):

```tsx
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { ProductSection } from "@/components/home/ProductSection";
import { Features } from "@/components/home/Features";
import { NavigationSchema } from "@/components/layout/NavigationSchema";
import type { HomeLayoutProps } from "../types";

/** The pre-template homepage composition, unchanged. */
export function ClassicHome({
	banners,
	featuredCategories,
	features,
}: HomeLayoutProps) {
	return (
		<div className="min-h-screen bg-background">
			<NavigationSchema />
			<main>
				<HeroCarousel banners={banners} />
				<FeaturedCategories categories={featuredCategories} />
				{features.topSelling && (
					<ProductSection
						id="top-selling"
						type="top-selling"
						titleKey="products.topSelling"
						descriptionKey="products.topSellingDescription"
						viewAllHref="/products?top_selling=1"
						perPage={12}
						bgClass="bg-muted/30"
					/>
				)}
				{features.featuredProducts && (
					<ProductSection
						id="featured-products"
						type="featured"
						titleKey="products.featured"
						descriptionKey="products.featuredDescription"
						viewAllHref="/products?is_featured=1"
						perPage={12}
					/>
				)}
				{features.todaysDeals && (
					<ProductSection
						id="today-deals"
						type="today-deals"
						titleKey="products.todayDeals"
						descriptionKey="products.todayDealsDescription"
						viewAllHref="/products?today_deal=1"
						perPage={12}
					/>
				)}
				<Features />
			</main>
		</div>
	);
}
```

- [ ] **Step 3: Write `app/templates/classic/ClassicProductListing.tsx`**

The current `<main>` JSX of `app/(app-routes)/products/page.tsx` moved verbatim:

```tsx
import { ProductToolbar } from "@/components/product/ProductToolbar";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductsInfiniteList } from "@/components/product/ProductsInfiniteList";
import { ProductsEmptyState } from "@/components/product/ProductsEmptyState";
import type { ProductListingLayoutProps } from "../types";

/** The pre-template products page composition, unchanged. */
export function ClassicProductListing({
	products,
	meta,
	categories,
	brands,
	activeFiltersCount,
	baseQuery,
	infiniteListKey,
	viewMode,
	perPage,
}: ProductListingLayoutProps) {
	return (
		<main className="container mx-auto px-4 py-8">
			<ProductToolbar
				totalProducts={meta?.total || 0}
				displayedProducts={products.length}
				filterButton={
					<ProductFilters
						categories={categories}
						brands={brands}
						activeFiltersCount={activeFiltersCount}
						buttonOnly
					/>
				}
			/>
			<div className="flex flex-col lg:flex-row gap-6 lg:items-start">
				<ProductFilters
					categories={categories}
					brands={brands}
					activeFiltersCount={activeFiltersCount}
				/>
				<div className="flex-1 min-w-0">
					{products.length === 0 ? (
						<ProductsEmptyState />
					) : (
						<ProductsInfiniteList
							key={infiniteListKey}
							initialProducts={products}
							initialMeta={
								meta ?? {
									current_page: 1,
									per_page: perPage,
									total: products.length,
									last_page: 1,
									from: 1,
									to: products.length,
								}
							}
							baseQuery={baseQuery}
							viewMode={viewMode}
						/>
					)}
				</div>
			</div>
		</main>
	);
}
```

- [ ] **Step 4: Write `app/templates/classic/index.ts`**

```ts
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
```

Note: React 19 typings allow async Server Components where `ComponentType` is expected. If `tsc` still rejects `HeaderWrapper`/`Navigation`/`FooterWrapper` here, change the chrome slot types in `app/templates/types.ts` from `ComponentType` to `(props: Record<string, never>) => React.ReactNode | Promise<React.ReactNode>` — do not cast with `as`.

- [ ] **Step 5: Write `app/templates/registry.ts`**

```ts
import type { TemplateId } from "@/variants/types";
import type { Template } from "./types";
import { classicTemplate } from "./classic";

/**
 * Template registry. Add a paradigm by adding a folder under app/templates/
 * and one entry here; variants opt in via `template: "<id>"`.
 *
 * NOTE: never import this from app/variants/* or middleware — templates pull
 * in the whole component tree, and the variant layer must stay edge-safe.
 */
const TEMPLATES: Record<TemplateId, Template> = {
	classic: classicTemplate,
	// Placeholder until the bazar template lands (Task 12 replaces this).
	bazar: classicTemplate,
};

export function getTemplate(id: TemplateId): Template {
	return TEMPLATES[id] ?? TEMPLATES.classic;
}
```

- [ ] **Step 6: Verify**

Run: `npm run type-check` — Expected: exit 0.
Run: `npm run lint` — Expected: no new errors (new files unused so far is fine).

- [ ] **Step 7: Commit**

```bash
git add app/templates
git commit -m "feat(templates): template contract, registry, classic template"
```

---

### Task 3: Route shared pages and layout through the template registry

**Files:**
- Modify: `app/layout.tsx` (chrome section, ~lines 106–213)
- Modify: `app/page.tsx`
- Modify: `app/(app-routes)/products/page.tsx`
- Modify: `app/(app-routes)/products/[id]/page.tsx`

**Interfaces:**
- Consumes: `getTemplate` (Task 2), `variant.template` (Task 1).
- Produces: nothing new — after this task the app renders identically to before (all variants are `classic`), but through the registry.

- [ ] **Step 1: Edit `app/layout.tsx`**

Remove these imports (now supplied by the template):

```ts
import { HeaderWrapper } from "./components/layout/HeaderWrapper";
import { Navigation } from "./components/layout/Navigation";
import FooterWrapper from "./components/layout/FooterWrapper";
```

Add:

```ts
import { getTemplate } from "./templates/registry";
```

In `RootLayout`, directly after `const variantThemeCss = buildVariantThemeCss(variant);`, add:

```ts
	// Resolve the layout paradigm (chrome + page layouts) for this variant.
	const template = getTemplate(variant.template);
	const { Header, Navigation, Footer, MobileNav, FloatingActions } =
		template.chrome;
```

Replace the chrome block inside `<GlobalProvider>` (currently `{!isBareLayoutRoute && (<> <HeaderWrapper /> ... </>)}` through `{!isBareLayoutRoute && <FooterWrapper />}`) with:

```tsx
					{!isBareLayoutRoute && (
						<>
							<Header />
							{Navigation && <Navigation />}
							<BackToTopButton />
							{variant.features.chatWidget && <ChatWidget />}
							{variant.features.cookieConsent && <CookieBanner />}
						</>
					)}
					{children}
					{!isBareLayoutRoute && (
						<>
							<Footer />
							{MobileNav && <MobileNav />}
							{FloatingActions && <FloatingActions />}
						</>
					)}
```

- [ ] **Step 2: Edit `app/page.tsx`**

Remove the now-unused imports (`HeroCarousel`, `FeaturedCategories`, `ProductSection`, `Features`, `NavigationSchema`) and add:

```ts
import { getTemplate } from "@/templates/registry";
```

Replace the `HomePage` component body from `const { features } = await getActiveVariant();` to the end with:

```tsx
	const variant = await getActiveVariant();
	const template = getTemplate(variant.template);

	return (
		<>
			{renderStructuredData(organizationSchema)}
			{renderStructuredData(websiteSchema)}
			<template.HomeLayout
				banners={banners}
				featuredCategories={featuredCategories}
				features={variant.features}
			/>
		</>
	);
```

- [ ] **Step 3: Edit `app/(app-routes)/products/page.tsx`**

Remove the now-unused imports (`ProductToolbar`, `ProductFilters`, `ProductsInfiniteList`, `ProductsEmptyState`) and add:

```ts
import { getActiveVariant } from "@/variants/server";
import { getTemplate } from "@/templates/registry";
```

Directly after the `const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);` line, add:

```ts
	const variant = await getActiveVariant();
	const template = getTemplate(variant.template);

	// Breadcrumb label for templates that show "Home > <Category>": only when
	// exactly one category filter is active.
	const selectedCategoryName =
		categoryParam && !String(categoryParam).includes(",")
			? categories.find((c) => String(c.id) === String(categoryParam))
					?.name ?? null
			: null;
```

Replace the returned JSX (`<main ...>` block) with:

```tsx
	return (
		<>
			{renderStructuredData(breadcrumbSchema)}
			<template.ProductListingLayout
				products={products}
				meta={meta ?? null}
				categories={categories}
				brands={brands}
				activeFiltersCount={activeFiltersCount}
				baseQuery={query}
				infiniteListKey={infiniteListKey}
				viewMode={viewMode}
				perPage={perPage}
				selectedCategoryName={selectedCategoryName}
			/>
		</>
	);
```

- [ ] **Step 4: Edit `app/(app-routes)/products/[id]/page.tsx`**

Remove `import { ProductDetails } from "@/components/pages/ProductDetails";` and add:

```ts
import { getActiveVariant } from "@/variants/server";
import { getTemplate } from "@/templates/registry";
```

In `ProductDetailsPage`, before the `return`, add:

```ts
	const variant = await getActiveVariant();
	const template = getTemplate(variant.template);
```

Replace `<ProductDetails product={product} />` with:

```tsx
			<template.ProductDetailsLayout product={product} />
```

- [ ] **Step 5: Verify — this is the no-regression gate**

Run: `npm run type-check` — Expected: exit 0.
Run: `npm run lint` — Expected: no new errors.
Run the dev server (`npm run dev`) with `NEXT_PUBLIC_SHOWCASE=true` already present in the user's `.env.local` (do NOT edit env files — Claude is denied; ask the user if it is missing). Check `http://localhost:3000/demo/bn-01` and `/demo/bn-01/products`: identical to production today (header, nav bar, footer, homepage sections, filters, PDP).

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/page.tsx "app/(app-routes)/products/page.tsx" "app/(app-routes)/products/[id]/page.tsx"
git commit -m "refactor(templates): render layout and pages through the template registry"
```

---

### Task 4: i18n keys for the bazar template

**Files:**
- Modify: `app/i18n/locales/en.json`, `bn.json`, `es.json`, `fr.json`, `hi.json`, `ar.json`

**Interfaces:**
- Produces: top-level `"bazar"` namespace in every locale. Later tasks call `t("bazar.<key>")`.

- [ ] **Step 1: Add the `bazar` namespace**

Append this object as a new top-level key in `en.json`, `es.json`, `fr.json`, `hi.json`, and `ar.json` (English values everywhere per spec; keep valid JSON — mind the comma on the previous last key):

```json
"bazar": {
	"allDepartments": "All Departments",
	"trackOrder": "Track Order",
	"welcome": "Welcome to {{siteName}}",
	"categories": "Categories",
	"featuredProduct": "Featured Product",
	"relatedProducts": "Related Products",
	"showMore": "Show More",
	"products": "Products",
	"stockIn": "Stock In",
	"stockOut": "Stock Out",
	"save": "Save",
	"addToCart": "Add to Cart",
	"buyNow": "Buy Now",
	"usefulLinks": "Useful Links",
	"joinNewsletter": "Join Our Newsletter",
	"enterEmail": "Enter your email",
	"subscribe": "Subscribe",
	"category": "Category",
	"call": "Call",
	"home": "Home",
	"cart": "Cart",
	"login": "Login",
	"profile": "Profile",
	"wishlist": "Wishlist",
	"inStock": "In Stock",
	"sku": "SKU",
	"shareOn": "Share on"
}
```

In `bn.json`, add the translated version:

```json
"bazar": {
	"allDepartments": "সকল বিভাগ",
	"trackOrder": "অর্ডার ট্র্যাক করুন",
	"welcome": "{{siteName}}-এ স্বাগতম",
	"categories": "ক্যাটাগরি",
	"featuredProduct": "ফিচার্ড পণ্য",
	"relatedProducts": "সম্পর্কিত পণ্য",
	"showMore": "আরও দেখুন",
	"products": "পণ্যসমূহ",
	"stockIn": "স্টকে আছে",
	"stockOut": "স্টক নেই",
	"save": "ছাড়",
	"addToCart": "কার্টে যোগ করুন",
	"buyNow": "এখনই কিনুন",
	"usefulLinks": "প্রয়োজনীয় লিংক",
	"joinNewsletter": "নিউজলেটারে যোগ দিন",
	"enterEmail": "আপনার ইমেইল লিখুন",
	"subscribe": "সাবস্ক্রাইব",
	"category": "ক্যাটাগরি",
	"call": "কল",
	"home": "হোম",
	"cart": "কার্ট",
	"login": "লগইন",
	"profile": "প্রোফাইল",
	"wishlist": "উইশলিস্ট",
	"inStock": "স্টকে আছে",
	"sku": "এসকেইউ",
	"shareOn": "শেয়ার করুন"
}
```

- [ ] **Step 2: Verify**

Run: `node -e "['en','bn','es','fr','hi','ar'].forEach(l=>{const d=require('./app/i18n/locales/'+l+'.json'); if(!d.bazar) throw new Error(l); console.log(l,'ok')})"`
Expected: six `ok` lines.
Run: `npm run type-check` — Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/i18n/locales
git commit -m "feat(i18n): bazar template strings (bn translated, others English)"
```

---

### Task 5: Bazar chrome — top bar + main header

**Files:**
- Create: `app/templates/bazar/chrome/BazarHeader.tsx`

**Interfaces:**
- Consumes: `useCart().total`, `wishlistAtom`, `miniProfileAtom`, `businessSettingsAtom`, `HeaderSearch` (reuse exactly as `app/components/layout/Header.tsx` uses it — check its import/usage there and mirror it; it is self-contained), `VariantSwitcher`, `Price`, `bazar.*` i18n keys.
- Produces: `BazarHeader: () => JSX` (client, no props) — used by `bazarTemplate.chrome.Header` in Task 12.

- [ ] **Step 1: Write `app/templates/bazar/chrome/BazarHeader.tsx`**

```tsx
"use client";

import { useAtomValue } from "jotai";
import {
	Heart,
	Mail,
	Phone,
	ShoppingBag,
	Truck,
	User,
} from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { VariantSwitcher } from "@/components/shared/VariantSwitcher";
import HeaderSearch from "@/components/layout/HeaderSearch";
import Price from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";

/**
 * Bazar chrome: utility top bar (contact · welcome · track order · login) and
 * main header (logo · search · wishlist/cart · cart total). Department nav
 * lives in the home sidebar, so this template has no secondary nav bar.
 */
export function BazarHeader() {
	const { t } = useTranslation();
	const { total } = useCart();
	const wishlistIds = useAtomValue(wishlistAtom);
	const profile = useAtomValue(miniProfileAtom);
	const settings = useAtomValue(businessSettingsAtom);

	return (
		<header className="bg-background">
			{/* Utility top bar (desktop only) */}
			<div className="hidden border-b bg-muted/40 text-xs md:block">
				<div className="container mx-auto flex h-9 items-center justify-between px-4">
					<div className="flex items-center gap-5 text-muted-foreground">
						{settings?.contact_email && (
							<a
								href={`mailto:${settings.contact_email}`}
								className="flex items-center gap-1.5 hover:text-foreground"
							>
								<Mail className="h-3.5 w-3.5" />
								{settings.contact_email}
							</a>
						)}
						{settings?.contact_phone && (
							<a
								href={`tel:${settings.contact_phone}`}
								className="flex items-center gap-1.5 hover:text-foreground"
							>
								<Phone className="h-3.5 w-3.5" />
								{settings.contact_phone}
							</a>
						)}
					</div>
					<div className="flex items-center gap-5">
						<span className="text-muted-foreground">
							{t("bazar.welcome", {
								siteName: settings?.site_name ?? "",
							})}
						</span>
						<Link
							href={ABSOLUTE_ROUTES.ORDERS}
							className="flex items-center gap-1.5 font-medium hover:text-primary"
						>
							<Truck className="h-4 w-4" />
							{t("bazar.trackOrder")}
						</Link>
						{profile ? (
							<Link
								href={ABSOLUTE_ROUTES.PROFILE}
								className="flex items-center gap-1.5 font-medium hover:text-primary"
							>
								<User className="h-4 w-4" />
								{t("bazar.profile")}
							</Link>
						) : (
							<Link
								href={ABSOLUTE_ROUTES.LOGIN}
								className="flex items-center gap-1.5 font-medium hover:text-primary"
							>
								<User className="h-4 w-4" />
								{t("bazar.login")}
							</Link>
						)}
						<VariantSwitcher />
					</div>
				</div>
			</div>

			{/* Main header */}
			<div className="border-b shadow-sm">
				<div className="container mx-auto flex h-16 items-center gap-4 px-4 md:h-20">
					<Link
						href="/"
						className="flex shrink-0 items-center rounded-md bg-secondary px-4 py-2"
					>
						{settings?.header_logo ? (
							<Image
								src={settings.header_logo}
								alt={settings.site_name || "Logo"}
								width={140}
								height={40}
								className="h-8 w-auto object-contain"
							/>
						) : (
							<span className="text-lg font-bold text-secondary-foreground">
								{settings?.site_name ?? ""}
							</span>
						)}
					</Link>
					<div className="hidden flex-1 md:block">
						<HeaderSearch />
					</div>
					<div className="ml-auto flex items-center gap-2 md:gap-3">
						<Link
							href={ABSOLUTE_ROUTES.WISHLIST}
							className="relative rounded-full border bg-card p-2.5 hover:border-primary"
							aria-label={t("bazar.wishlist")}
						>
							<Heart className="h-5 w-5" />
							<span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
								{wishlistIds.length}
							</span>
						</Link>
						<Link
							href={ABSOLUTE_ROUTES.CART}
							className="rounded-full border bg-card p-2.5 hover:border-primary"
							aria-label={t("bazar.cart")}
						>
							<ShoppingBag className="h-5 w-5" />
						</Link>
						<span className="hidden font-semibold tabular-nums md:inline">
							<Price amount={total} />
						</span>
					</div>
				</div>
				{/* Mobile search row */}
				<div className="px-4 pb-3 md:hidden">
					<HeaderSearch />
				</div>
			</div>
		</header>
	);
}
```

Note: if `HeaderSearch` turns out to require props (check `app/components/layout/Header.tsx` usage), pass exactly what Header passes.

- [ ] **Step 2: Verify**

Run: `npm run type-check` — Expected: exit 0.
Run: `npm run lint` — Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/templates/bazar
git commit -m "feat(bazar): top bar and main header chrome"
```

---

### Task 6: Bazar chrome — footer with newsletter

**Files:**
- Create: `app/templates/bazar/chrome/BazarFooter.tsx`

**Interfaces:**
- Consumes: `businessSettingsAtom`, `subscribeNewsletter` from `@/lib/actions/newsletter` (existing — returns `{ success, message }`-shaped `ApiResponse`), shadcn `Input`/`Button`, `toast` from `@/components/shared/ui/sonner`, `bazar.*` + `footer.newsletter.*` i18n keys.
- Produces: `BazarFooter: () => JSX` (client, no props).

- [ ] **Step 1: Write `app/templates/bazar/chrome/BazarFooter.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import { useAtomValue } from "jotai";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { toast } from "@/components/shared/ui/sonner";
import { subscribeNewsletter } from "@/lib/actions/newsletter";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";

/** Bazar chrome: brand/contact block · useful links · newsletter form. */
export function BazarFooter() {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);
	const [email, setEmail] = useState("");
	const [isPending, startTransition] = useTransition();

	const onSubscribe = (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim()) {
			toast.error(t("footer.newsletter.emptyEmail"));
			return;
		}
		startTransition(async () => {
			const response = await subscribeNewsletter(email);
			if (response.success) {
				toast.success(t("footer.newsletter.subscribeSuccess"));
				setEmail("");
			} else {
				toast.error(
					response.message || t("footer.newsletter.subscribeError")
				);
			}
		});
	};

	// All internal routes so the demo has no dead links.
	const usefulLinks = [
		{ href: "/", label: t("bazar.home") },
		{ href: ABSOLUTE_ROUTES.PRODUCTS, label: t("bazar.products") },
		{ href: ABSOLUTE_ROUTES.CART, label: t("bazar.cart") },
		{ href: ABSOLUTE_ROUTES.ORDERS, label: t("bazar.trackOrder") },
	];

	return (
		<footer className="border-t bg-muted/40 pb-20 md:pb-0">
			<div className="container mx-auto grid gap-10 px-4 py-10 md:grid-cols-3">
				{/* Brand + contact */}
				<div className="space-y-4">
					<div className="inline-flex items-center rounded-md bg-secondary px-4 py-2">
						{settings?.footer_logo || settings?.header_logo ? (
							<Image
								src={
									settings.footer_logo ||
									settings.header_logo
								}
								alt={settings.site_name || "Logo"}
								width={140}
								height={40}
								className="h-8 w-auto object-contain"
							/>
						) : (
							<span className="text-lg font-bold text-secondary-foreground">
								{settings?.site_name ?? ""}
							</span>
						)}
					</div>
					{settings?.address && (
						<p className="flex items-start gap-2 text-sm text-muted-foreground">
							<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							{settings.address}
						</p>
					)}
					{settings?.contact_phone && (
						<a
							href={`tel:${settings.contact_phone}`}
							className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
						>
							<Phone className="h-4 w-4 shrink-0 text-primary" />
							{settings.contact_phone}
						</a>
					)}
					{settings?.contact_email && (
						<a
							href={`mailto:${settings.contact_email}`}
							className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
						>
							<Mail className="h-4 w-4 shrink-0 text-primary" />
							{settings.contact_email}
						</a>
					)}
				</div>

				{/* Useful links */}
				<div>
					<h3 className="mb-4 font-semibold">
						{t("bazar.usefulLinks")}
					</h3>
					<ul className="space-y-2.5">
						{usefulLinks.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className="text-sm text-muted-foreground hover:text-primary"
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</div>

				{/* Newsletter */}
				<div>
					<h3 className="mb-4 font-semibold">
						{t("bazar.joinNewsletter")}
					</h3>
					<form onSubmit={onSubscribe} className="flex gap-2">
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder={t("bazar.enterEmail")}
							className="rounded-full"
						/>
						<Button
							type="submit"
							disabled={isPending}
							className="shrink-0 rounded-full px-6"
						>
							{t("bazar.subscribe")}
						</Button>
					</form>
				</div>
			</div>
			{settings?.copyright_text && (
				<div className="border-t py-4 text-center text-xs text-muted-foreground">
					{settings.copyright_text}
				</div>
			)}
		</footer>
	);
}
```

Note: `pb-20 md:pb-0` reserves space for the fixed mobile bottom nav (Task 7). Verify `subscribeNewsletter`'s exact return shape in `app/lib/actions/newsletter.ts` and adjust the success/message access if it differs.

- [ ] **Step 2: Verify**

Run: `npm run type-check` && `npm run lint` — Expected: exit 0 / no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/templates/bazar
git commit -m "feat(bazar): footer with contact block, links, newsletter"
```

---

### Task 7: Bazar chrome — mobile bottom nav + floating call FAB

**Files:**
- Create: `app/templates/bazar/chrome/BazarMobileNav.tsx`
- Create: `app/templates/bazar/chrome/BazarFloatingCall.tsx`

**Interfaces:**
- Consumes: `useCart().itemCount`, `businessSettingsAtom`, `miniProfileAtom`, `bazar.*` keys.
- Produces: `BazarMobileNav`, `BazarFloatingCall` (client, no props).

- [ ] **Step 1: Write `app/templates/bazar/chrome/BazarMobileNav.tsx`**

```tsx
"use client";

import { useAtomValue } from "jotai";
import {
	Home,
	LayoutGrid,
	Phone,
	ShoppingCart,
	User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { miniProfileAtom } from "@/store/mini-profile.atom";

/**
 * Fixed bottom navigation (mobile only): CATEGORY · CALL · HOME (raised) ·
 * CART · LOGIN/PROFILE. The footer reserves bottom padding for it.
 */
export function BazarMobileNav() {
	const { t } = useTranslation();
	const { itemCount } = useCart();
	const settings = useAtomValue(businessSettingsAtom);
	const profile = useAtomValue(miniProfileAtom);

	const itemClass =
		"flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium uppercase";

	return (
		<nav
			className="fixed inset-x-0 bottom-0 z-50 border-t bg-background md:hidden"
			aria-label={t("bazar.category")}
		>
			<div className="grid h-16 grid-cols-5 items-center">
				<Link href={ABSOLUTE_ROUTES.PRODUCTS} className={itemClass}>
					<LayoutGrid className="h-5 w-5" />
					{t("bazar.category")}
				</Link>
				{settings?.contact_phone ? (
					<a
						href={`tel:${settings.contact_phone}`}
						className={itemClass}
					>
						<Phone className="h-5 w-5" />
						{t("bazar.call")}
					</a>
				) : (
					<span aria-hidden="true" />
				)}
				<Link
					href="/"
					className="flex flex-col items-center justify-end gap-0.5 text-[11px] font-medium uppercase"
				>
					<span className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg">
						<Home className="h-6 w-6" />
					</span>
					{t("bazar.home")}
				</Link>
				<Link href={ABSOLUTE_ROUTES.CART} className={itemClass}>
					<span className="relative">
						<ShoppingCart className="h-5 w-5" />
						{itemCount > 0 && (
							<span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
								{itemCount}
							</span>
						)}
					</span>
					{t("bazar.cart")}
				</Link>
				<Link
					href={
						profile
							? ABSOLUTE_ROUTES.PROFILE
							: ABSOLUTE_ROUTES.LOGIN
					}
					className={itemClass}
				>
					<User className="h-5 w-5" />
					{profile ? t("bazar.profile") : t("bazar.login")}
				</Link>
			</div>
		</nav>
	);
}
```

- [ ] **Step 2: Write `app/templates/bazar/chrome/BazarFloatingCall.tsx`**

```tsx
"use client";

import { useAtomValue } from "jotai";
import { Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { businessSettingsAtom } from "@/store/ui-atoms";

/** Floating call FAB; hidden when the business has no phone number. */
export function BazarFloatingCall() {
	const { t } = useTranslation();
	const settings = useAtomValue(businessSettingsAtom);

	if (!settings?.contact_phone) return null;

	return (
		<a
			href={`tel:${settings.contact_phone}`}
			aria-label={t("bazar.call")}
			className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-8 ring-primary/20 transition-transform hover:scale-105 md:bottom-8 md:right-8"
		>
			<Phone className="h-6 w-6" />
		</a>
	);
}
```

- [ ] **Step 3: Verify**

Run: `npm run type-check` && `npm run lint` — Expected: exit 0 / no new errors.

- [ ] **Step 4: Commit**

```bash
git add app/templates/bazar
git commit -m "feat(bazar): mobile bottom nav and floating call FAB"
```

---

### Task 8: Bazar product card + pluggable card in the shared infinite list

**Files:**
- Create: `app/templates/bazar/product/BazarProductCard.tsx`
- Create: `app/templates/bazar/product/BazarProductsGrid.tsx`
- Modify: `app/components/product/ProductsGrid.tsx`
- Modify: `app/components/product/ProductsInfiniteList.tsx`

**Interfaces:**
- Consumes: `Product` model, `useCart`, `wishlistAtom`/`miniProfileAtom`, `toggleWishlist` from `@/(app-routes)/(auth)/action`, `Price`, `bazar.*` keys.
- Produces: `BazarProductCard: ComponentType<{ product: Product }>`; `BazarProductsGrid: ComponentType<{ products: Product[] }>`; `ProductsGrid` and `ProductsInfiniteList` gain an optional `CardComponent?: ComponentType<{ product: Product }>` prop (default `ProductCardItem` — pass it only from client components, never across the server→client boundary).

- [ ] **Step 1: Add `CardComponent` to `app/components/product/ProductsGrid.tsx`**

```tsx
"use client";

import type { ComponentType } from "react";
import type { Product } from "@/(app-routes)/products/model";
import { ProductCardItem } from "./ProductCardItem";
import { cn } from "@/lib/utils/utils";

interface ProductsGridProps {
	products: Product[];
	viewMode?: "grid" | "list";
	/**
	 * Card renderer override (defaults to ProductCardItem). Only pass this
	 * from client components — component functions cannot cross the
	 * server→client serialization boundary.
	 */
	CardComponent?: ComponentType<{ product: Product }>;
}

export function ProductsGrid({
	products,
	viewMode = "grid",
	CardComponent = ProductCardItem,
}: ProductsGridProps) {
	return (
		<div
			className={cn(
				// Mobile always uses grid (2 cols even on smallest screens)
				"grid grid-cols-2 gap-3",
				// On md+ screens, list view becomes 1 column, grid stays multi-column
				viewMode === "grid"
					? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
					: "md:grid-cols-1"
			)}
		>
			{products.map((product) => (
				<CardComponent key={product.id} product={product} />
			))}
		</div>
	);
}
```

(Keep the rest of the file unchanged if it contains more than shown; only the props interface, defaulting, and the map callsite change.)

- [ ] **Step 2: Thread `CardComponent` through `app/components/product/ProductsInfiniteList.tsx`**

Add to the props interface:

```ts
	/** Card renderer override, forwarded to ProductsGrid (client-only prop). */
	CardComponent?: ComponentType<{ product: Product }>;
```

Add `CardComponent` to the destructured props, import `type { ComponentType }` from `react`, and pass `CardComponent={CardComponent}` to every `<ProductsGrid ... />` render inside the file.

- [ ] **Step 3: Write `app/templates/bazar/product/BazarProductCard.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { Button } from "@/components/shared/ui/button";
import { toast } from "@/components/shared/ui/sonner";
import Price from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { toggleWishlist } from "@/(app-routes)/(auth)/action";
import type { Product } from "@/(app-routes)/products/model";
import { cn } from "@/lib/utils/utils";

const FALLBACK_IMAGE =
	"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&q=80";

/**
 * Bazar product card: stock ribbon, wishlist heart, image, name, price with
 * strike-through + save badge, and always-visible Add to Cart / Buy Now.
 */
export function BazarProductCard({ product }: { product: Product }) {
	const { t } = useTranslation();
	const router = useRouter();
	const { addToCart } = useCart();
	const [userProfile] = useAtom(miniProfileAtom);
	const [wishlistIds, setWishlistIds] = useAtom(wishlistAtom);
	const [isWishlistLoading, setIsWishlistLoading] = useState(false);

	const isWishlisted = wishlistIds.includes(product.id);
	const imageSource =
		product.thumbnail_image && product.thumbnail_image.trim() !== ""
			? product.thumbnail_image
			: FALLBACK_IMAGE;

	const isOutOfStock = product.stock <= 0;
	const hasDiscount =
		product.price > product.discounted_price &&
		product.discount_type !== "none";
	const saveAmount = hasDiscount
		? product.price - product.discounted_price
		: 0;

	// Same variant-aware add-to-cart behaviour as ProductCardItem.
	const doAddToCart = (): boolean => {
		const variant =
			product.variants && product.variants.length > 0
				? product.variants[0]
				: null;
		const price = variant
			? parseFloat(variant.discount_price.toString())
			: parseFloat(product.discounted_price.toString());
		const stock = variant ? variant.stock : product.stock;

		if (stock <= 0) {
			toast.error(t("products.outOfStock"));
			return false;
		}
		addToCart({
			id: product.id,
			name: variant
				? `${product.name} - ${variant.combination_text}`
				: product.name,
			price,
			image: imageSource,
			variant_id: variant?.id,
			stock,
			tax: product.tax ? parseFloat(product.tax) : 0,
			tax_type: product.tax_type || "exclude",
		});
		return true;
	};

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		if (doAddToCart()) {
			toast.success(t("bazar.addToCart"), {
				description: `${product.name} ${t("productCard.addedToCart")}`,
			});
		}
	};

	const handleBuyNow = (e: React.MouseEvent) => {
		e.preventDefault();
		if (doAddToCart()) {
			router.push(ABSOLUTE_ROUTES.CHECKOUT);
		}
	};

	const handleToggleWishlist = async (e: React.MouseEvent) => {
		e.preventDefault();
		if (!userProfile) {
			toast.error(t("productCard.loginRequired"));
			router.push(
				`/login?redirect=${encodeURIComponent(
					window.location.pathname
				)}`
			);
			return;
		}
		setIsWishlistLoading(true);
		try {
			const response = await toggleWishlist(product.id);
			if (response.success) {
				setWishlistIds(
					isWishlisted
						? wishlistIds.filter((id) => id !== product.id)
						: [...wishlistIds, product.id]
				);
				toast.success(
					isWishlisted
						? t("productCard.wishlistRemoved")
						: t("productCard.wishlistAdded")
				);
			} else {
				toast.error(
					response.message || t("productCard.wishlistUpdateFailed")
				);
			}
		} catch {
			toast.error(t("productCard.wishlistUpdateFailed"));
		} finally {
			setIsWishlistLoading(false);
		}
	};

	return (
		<div className="group relative flex h-full flex-col overflow-hidden rounded-md border bg-card shadow-sm transition-shadow hover:shadow-md">
			{/* Stock ribbon */}
			<span
				className={cn(
					"absolute -left-9 top-4 z-10 -rotate-45 px-10 py-1 text-[10px] font-bold uppercase tracking-wider shadow",
					isOutOfStock
						? "bg-destructive text-destructive-foreground"
						: "bg-primary text-primary-foreground"
				)}
			>
				{isOutOfStock ? t("bazar.stockOut") : t("bazar.stockIn")}
			</span>

			{/* Wishlist heart */}
			<button
				type="button"
				onClick={handleToggleWishlist}
				disabled={isWishlistLoading}
				aria-label={t("bazar.wishlist")}
				aria-pressed={isWishlisted}
				className={cn(
					"absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border bg-background/90 transition-colors",
					isWishlisted
						? "text-primary"
						: "text-muted-foreground hover:text-primary"
				)}
			>
				<Heart
					className={cn("h-4 w-4", isWishlisted && "fill-current")}
				/>
			</button>

			<Link
				href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}
				className="block bg-white"
			>
				<Image
					src={imageSource}
					alt={product.name}
					width={400}
					height={400}
					className="h-40 w-full object-cover sm:h-56"
					sizes="(max-width: 1024px) 50vw, 20vw"
				/>
			</Link>

			<div className="flex flex-1 flex-col gap-2 p-3">
				<Link href={ABSOLUTE_ROUTES.PRODUCT_DETAILS(product.id)}>
					<h3 className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary">
						{product.name}
					</h3>
				</Link>
				<div className="mt-auto flex flex-wrap items-center gap-2">
					<span className="text-lg font-bold text-primary tabular-nums">
						<Price amount={product.discounted_price} />
					</span>
					{hasDiscount && (
						<>
							<span className="text-xs text-muted-foreground line-through tabular-nums">
								<Price amount={product.price} />
							</span>
							<span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
								{t("bazar.save")}{" "}
								<Price amount={saveAmount} />
							</span>
						</>
					)}
				</div>
				<div className="grid grid-cols-2 gap-2">
					<Button
						variant="secondary"
						size="sm"
						className="text-[11px] font-bold uppercase"
						onClick={handleAddToCart}
						disabled={isOutOfStock}
					>
						{t("bazar.addToCart")}
					</Button>
					<Button
						size="sm"
						className="text-[11px] font-bold uppercase"
						onClick={handleBuyNow}
						disabled={isOutOfStock}
					>
						{t("bazar.buyNow")}
					</Button>
				</div>
			</div>
		</div>
	);
}
```

- [ ] **Step 4: Write `app/templates/bazar/product/BazarProductsGrid.tsx`**

```tsx
"use client";

import type { Product } from "@/(app-routes)/products/model";
import { BazarProductCard } from "./BazarProductCard";

/** Client grid of bazar cards (usable directly from Server Components). */
export function BazarProductsGrid({ products }: { products: Product[] }) {
	return (
		<div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
			{products.map((product) => (
				<BazarProductCard key={product.id} product={product} />
			))}
		</div>
	);
}
```

- [ ] **Step 5: Verify**

Run: `npm run type-check` && `npm run lint` — Expected: exit 0 / no new errors.

- [ ] **Step 6: Commit**

```bash
git add app/components/product/ProductsGrid.tsx app/components/product/ProductsInfiniteList.tsx app/templates/bazar
git commit -m "feat(bazar): product card + pluggable card in shared grid/infinite list"
```

---

### Task 9: Bazar home layout

**Files:**
- Create: `app/templates/bazar/home/BazarSectionTitle.tsx`
- Create: `app/templates/bazar/home/DepartmentSidebar.tsx`
- Create: `app/templates/bazar/home/BazarCategoryGrid.tsx`
- Create: `app/templates/bazar/home/BazarShowMore.tsx`
- Create: `app/templates/bazar/home/BazarHome.tsx`

**Interfaces:**
- Consumes: `HomeLayoutProps` (Task 2), `getAllCategories` from `@/components/shared/actions/categories`, `getFeaturedProducts` from `@/(app-routes)/products/action`, `BazarProductsGrid` (Task 8), `NavigationSchema`.
- Produces: `BazarHome: ComponentType<HomeLayoutProps>` (async Server Component).

- [ ] **Step 1: Write `app/templates/bazar/home/BazarSectionTitle.tsx`**

```tsx
"use client";

import { useTranslation } from "react-i18next";

/** Section heading with the bazar underline accent. */
export function BazarSectionTitle({ titleKey }: { titleKey: string }) {
	const { t } = useTranslation();
	return (
		<div className="mb-6">
			<h2 className="text-2xl font-bold md:text-3xl">{t(titleKey)}</h2>
			<div className="mt-2 h-1 w-24 rounded bg-primary" />
		</div>
	);
}
```

- [ ] **Step 2: Write `app/templates/bazar/home/DepartmentSidebar.tsx`**

```tsx
"use client";

import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Category } from "@/components/shared/models/category";

/** Desktop department sidebar next to the hero banner. */
export function DepartmentSidebar({
	categories,
}: {
	categories: Category[];
}) {
	const { t } = useTranslation();

	if (categories.length === 0) return null;

	return (
		<aside className="hidden w-64 shrink-0 self-start border bg-card lg:block">
			<div className="flex items-center gap-2 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
				<Menu className="h-4 w-4" />
				{t("bazar.allDepartments")}
			</div>
			<ul>
				{categories.map((category) => (
					<li
						key={category.id}
						className="border-b last:border-b-0"
					>
						<Link
							href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
								category.id
							)}
							className="block px-4 py-3 text-sm transition-colors hover:bg-muted hover:text-primary"
						>
							{category.name}
						</Link>
					</li>
				))}
			</ul>
		</aside>
	);
}
```

- [ ] **Step 3: Write `app/templates/bazar/home/BazarCategoryGrid.tsx`**

```tsx
"use client";

import Image from "next/image";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { FeaturedCategory } from "@/components/home/_data/types";
import { BazarSectionTitle } from "./BazarSectionTitle";

/** Category cards: image with a dark name band, linking into the listing. */
export function BazarCategoryGrid({
	categories,
}: {
	categories: FeaturedCategory[];
}) {
	if (categories.length === 0) return null;

	return (
		<section>
			<BazarSectionTitle titleKey="bazar.categories" />
			<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
				{categories.map((category) => (
					<Link
						key={category.id}
						href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
							category.category_id
						)}
						className="group overflow-hidden rounded-md border bg-card shadow-sm transition-shadow hover:shadow-md"
					>
						<div className="relative aspect-square bg-white">
							<Image
								src={category.icon_url}
								alt={category.name}
								fill
								className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
								sizes="(max-width: 768px) 50vw, 20vw"
							/>
						</div>
						<div className="bg-secondary/80 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-secondary-foreground">
							{category.name}
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
```

- [ ] **Step 4: Write `app/templates/bazar/home/BazarShowMore.tsx`**

```tsx
"use client";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";

/** Centered dark pill link under a product section. */
export function BazarShowMore({ href }: { href: string }) {
	const { t } = useTranslation();
	return (
		<div className="mt-8 flex justify-center">
			<Link
				href={href}
				className="rounded-full bg-secondary px-8 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90"
			>
				{t("bazar.showMore")}
			</Link>
		</div>
	);
}
```

- [ ] **Step 5: Write `app/templates/bazar/home/BazarHome.tsx`**

```tsx
import Image from "next/image";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { NavigationSchema } from "@/components/layout/NavigationSchema";
import { getAllCategories } from "@/components/shared/actions/categories";
import { getFeaturedProducts } from "@/(app-routes)/products/action";
import type { HomeLayoutProps } from "../../types";
import { DepartmentSidebar } from "./DepartmentSidebar";
import { BazarCategoryGrid } from "./BazarCategoryGrid";
import { BazarSectionTitle } from "./BazarSectionTitle";
import { BazarShowMore } from "./BazarShowMore";
import { BazarProductsGrid } from "../product/BazarProductsGrid";

/**
 * Bazar homepage: department sidebar + hero banner, category grid, featured
 * products, promo banner pair. Server Component — categories and featured
 * products come from the shared cached actions.
 */
export async function BazarHome({
	banners,
	featuredCategories,
	features,
}: HomeLayoutProps) {
	const categoriesResponse = await getAllCategories();
	const categories =
		categoriesResponse.success && categoriesResponse.data.categories
			? categoriesResponse.data.categories.filter(
					(category) => category.parent_id === null
				)
			: [];

	let featuredProducts: Awaited<
		ReturnType<typeof getFeaturedProducts>
	>["data"]["products"] = [];
	if (features.featuredProducts) {
		const response = await getFeaturedProducts(10);
		featuredProducts = response.success
			? response.data?.products ?? []
			: [];
	}

	const [heroBanner, ...promoBanners] = banners;

	return (
		<div className="min-h-screen bg-background">
			<NavigationSchema />
			<main className="container mx-auto space-y-10 px-4 py-6 md:space-y-14">
				{/* Departments + hero */}
				<section className="flex gap-6">
					<DepartmentSidebar categories={categories} />
					{heroBanner && (
						<Link
							href={heroBanner.cta_url || "/products"}
							className="relative block min-h-[240px] flex-1 overflow-hidden rounded-md md:min-h-[360px] lg:min-h-[420px]"
						>
							<Image
								src={heroBanner.image_url}
								alt={heroBanner.title}
								fill
								priority
								className="object-cover"
								sizes="(max-width: 1024px) 100vw, 75vw"
							/>
						</Link>
					)}
				</section>

				<BazarCategoryGrid categories={featuredCategories} />

				{features.featuredProducts && featuredProducts.length > 0 && (
					<section id="featured-products">
						<BazarSectionTitle titleKey="bazar.featuredProduct" />
						<BazarProductsGrid products={featuredProducts} />
						<BazarShowMore href="/products?is_featured=1" />
					</section>
				)}

				{promoBanners.length > 0 && (
					<section className="grid gap-6 md:grid-cols-2">
						{promoBanners.slice(0, 2).map((banner) => (
							<Link
								key={banner.id}
								href={banner.cta_url || "/products"}
								className="relative block h-52 overflow-hidden rounded-md md:h-72"
							>
								<Image
									src={banner.image_url}
									alt={banner.title}
									fill
									className="object-cover"
									sizes="(max-width: 768px) 100vw, 50vw"
								/>
							</Link>
						))}
					</section>
				)}
			</main>
		</div>
	);
}
```

Note: if the `featuredProducts` type expression fails to compile (the action's response type may not expose `.data.products` that way), simplify to `let featuredProducts: Product[] = []` with `import type { Product } from "@/(app-routes)/products/model";` and cast from the response accessor the same way `ProductSection.tsx` reads it.

- [ ] **Step 6: Verify**

Run: `npm run type-check` && `npm run lint` — Expected: exit 0 / no new errors.

- [ ] **Step 7: Commit**

```bash
git add app/templates/bazar
git commit -m "feat(bazar): home layout (dept sidebar, hero, category grid, featured, promos)"
```

---

### Task 10: Bazar product listing layout

**Files:**
- Create: `app/templates/bazar/product/BazarProductListing.tsx`

**Interfaces:**
- Consumes: `ProductListingLayoutProps` (Task 2), `ProductsInfiniteList` + `CardComponent` (Task 8), `ProductsEmptyState`.
- Produces: `BazarProductListing: ComponentType<ProductListingLayoutProps>` (client).

- [ ] **Step 1: Write `app/templates/bazar/product/BazarProductListing.tsx`**

```tsx
"use client";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ProductsInfiniteList } from "@/components/product/ProductsInfiniteList";
import { ProductsEmptyState } from "@/components/product/ProductsEmptyState";
import type { ProductListingLayoutProps } from "../../types";
import { BazarProductCard } from "./BazarProductCard";

/**
 * Bazar listing: breadcrumb strip + infinite-scrolling grid of bazar cards.
 * Filters/search still work via URL params (driven by header search and
 * category links); this paradigm has no filter sidebar.
 */
export function BazarProductListing({
	products,
	meta,
	baseQuery,
	infiniteListKey,
	perPage,
	selectedCategoryName,
}: ProductListingLayoutProps) {
	const { t } = useTranslation();

	return (
		<main className="container mx-auto px-4 py-6">
			<nav
				className="mb-6 rounded-md bg-muted/60 px-4 py-3 text-sm"
				aria-label="Breadcrumb"
			>
				<Link href="/" className="font-semibold hover:text-primary">
					{t("bazar.home")}
				</Link>
				<span className="mx-2 text-muted-foreground">&gt;</span>
				<span className="text-muted-foreground">
					{selectedCategoryName ?? t("bazar.products")}
				</span>
			</nav>
			{products.length === 0 ? (
				<ProductsEmptyState />
			) : (
				<ProductsInfiniteList
					key={infiniteListKey}
					initialProducts={products}
					initialMeta={
						meta ?? {
							current_page: 1,
							per_page: perPage,
							total: products.length,
							last_page: 1,
							from: 1,
							to: products.length,
						}
					}
					baseQuery={baseQuery}
					viewMode="grid"
					CardComponent={BazarProductCard}
				/>
			)}
		</main>
	);
}
```

- [ ] **Step 2: Verify**

Run: `npm run type-check` && `npm run lint` — Expected: exit 0 / no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/templates/bazar
git commit -m "feat(bazar): product listing layout with breadcrumb and card grid"
```

---

### Task 11: Bazar product details layout

**Files:**
- Create: `app/templates/bazar/product/BazarProductDetails.tsx`

**Interfaces:**
- Consumes: `ProductDetailsLayoutProps` (Task 2); reused PDP subcomponents `ProductImageGallery` (`{ productName, thumbnailImage, galleryImages?, colorImage? }`), `QuantitySelector` (`{ quantity, onQuantityChange, stock? }`), `ProductDetailsTabs` (`{ product }`), `ProductDeliveryInfo` (verify props in file — expected none), `ProductVariantSelector` (`{ product, onVariantChange, onColorChange? }`); `useCart`, wishlist atoms, `toggleWishlist`, `trackUnifiedAddToCart`/`trackUnifiedViewProduct` from `@/lib/analytics`; `BazarProductsGrid` (Task 8).
- Produces: `BazarProductDetails: ComponentType<ProductDetailsLayoutProps>` (client).

- [ ] **Step 1: Write `app/templates/bazar/product/BazarProductDetails.tsx`**

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { Facebook, Heart, Linkedin, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { Button } from "@/components/shared/ui/button";
import { toast } from "@/components/shared/ui/sonner";
import Price from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { wishlistAtom } from "@/store/wishlist.atom";
import { toggleWishlist } from "@/(app-routes)/(auth)/action";
import {
	trackUnifiedAddToCart,
	trackUnifiedViewProduct,
} from "@/lib/analytics";
import {
	ProductImageGallery,
	QuantitySelector,
	ProductDeliveryInfo,
	ProductDetailsTabs,
} from "@/components/product/product-details";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";
import type {
	Product,
	ProductVariant,
} from "@/(app-routes)/products/model";
import type { ProductDetailsLayoutProps } from "../../types";
import { BazarSectionTitle } from "../home/BazarSectionTitle";
import { BazarProductsGrid } from "./BazarProductsGrid";
import { cn } from "@/lib/utils/utils";

/**
 * Bazar PDP: breadcrumb, gallery left, purchase column right (title, SKU,
 * price + save badge, variant selector, quantity + stock, Add to Cart / Buy
 * Now / wishlist, delivery info, share), tabs, related products.
 */
export function BazarProductDetails({ product }: ProductDetailsLayoutProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const { items, addToCart } = useCart();
	const [userProfile] = useAtom(miniProfileAtom);
	const [wishlistIds, setWishlistIds] = useAtom(wishlistAtom);
	const [isWishlistLoading, setIsWishlistLoading] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [selectedColorId, setSelectedColorId] = useState<number | null>(
		null
	);
	const [selectedVariant, setSelectedVariant] =
		useState<ProductVariant | null>(
			product.variants && product.variants.length > 0
				? product.variants[0]
				: null
		);

	const isWishlisted = wishlistIds.includes(product.id);
	const price = selectedVariant
		? parseFloat(selectedVariant.discount_price.toString())
		: parseFloat(product.discounted_price.toString());
	const originalPrice = selectedVariant
		? parseFloat(selectedVariant.price.toString())
		: parseFloat(product.price.toString());
	const stock = selectedVariant ? selectedVariant.stock : product.stock;
	const saveAmount = originalPrice > price ? originalPrice - price : 0;

	useEffect(() => {
		trackUnifiedViewProduct(
			product.id.toString(),
			product.name,
			price,
			product.category?.name
		);
		// Track once on mount only.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [product.id]);

	// Units of this product/variant already reserved in the cart.
	const reservedQuantity = useMemo(
		() =>
			items
				.filter(
					(item) =>
						item.id === product.id &&
						(selectedVariant
							? item.variant_id === selectedVariant.id
							: !item.variant_id)
				)
				.reduce((sum, item) => sum + item.quantity, 0),
		[items, product.id, selectedVariant]
	);
	const availableStock = Math.max(stock - reservedQuantity, 0);

	const doAddToCart = (): boolean => {
		if (availableStock <= 0 || quantity > availableStock) {
			toast.error(t("products.outOfStock"));
			return false;
		}
		addToCart({
			id: product.id,
			name: selectedVariant
				? `${product.name} - ${selectedVariant.combination_text}`
				: product.name,
			price,
			image: product.thumbnail_image,
			variant_id: selectedVariant?.id,
			stock,
			quantity,
			tax: product.tax ? parseFloat(product.tax) : 0,
			tax_type: product.tax_type || "exclude",
		});
		trackUnifiedAddToCart(
			product.id.toString(),
			product.name,
			price,
			quantity
		);
		return true;
	};

	const handleAddToCart = () => {
		if (doAddToCart()) {
			toast.success(t("bazar.addToCart"), {
				description: `${product.name} ${t(
					"productCard.addedToCart"
				)}`,
			});
		}
	};

	const handleBuyNow = () => {
		if (doAddToCart()) {
			router.push(ABSOLUTE_ROUTES.CHECKOUT);
		}
	};

	const handleToggleWishlist = async () => {
		if (!userProfile) {
			toast.error(t("productCard.loginRequired"));
			router.push(
				`/login?redirect=${encodeURIComponent(
					window.location.pathname
				)}`
			);
			return;
		}
		setIsWishlistLoading(true);
		try {
			const response = await toggleWishlist(product.id);
			if (response.success) {
				setWishlistIds(
					isWishlisted
						? wishlistIds.filter((id) => id !== product.id)
						: [...wishlistIds, product.id]
				);
				toast.success(
					isWishlisted
						? t("productCard.wishlistRemoved")
						: t("productCard.wishlistAdded")
				);
			} else {
				toast.error(
					response.message ||
						t("productCard.wishlistUpdateFailed")
				);
			}
		} catch {
			toast.error(t("productCard.wishlistUpdateFailed"));
		} finally {
			setIsWishlistLoading(false);
		}
	};

	const share = (network: "facebook" | "twitter" | "linkedin") => {
		const url = encodeURIComponent(window.location.href);
		const shareUrls = {
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
			twitter: `https://twitter.com/intent/tweet?url=${url}`,
			linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
		};
		window.open(shareUrls[network], "_blank", "noopener,noreferrer");
	};

	const colorImage = selectedColorId
		? product.colors_image?.find((ci) => ci.id === selectedColorId)
				?.photo
		: undefined;

	return (
		<main className="container mx-auto px-4 py-6">
			<nav
				className="mb-6 rounded-md bg-muted/60 px-4 py-3 text-sm"
				aria-label="Breadcrumb"
			>
				<Link href="/" className="font-semibold hover:text-primary">
					{t("bazar.home")}
				</Link>
				<span className="mx-2 text-muted-foreground">&gt;</span>
				<span className="line-clamp-1 inline text-muted-foreground">
					{product.name}
				</span>
			</nav>

			<div className="grid gap-8 lg:grid-cols-2">
				<ProductImageGallery
					productName={product.name}
					thumbnailImage={product.thumbnail_image}
					galleryImages={product.gallery_images}
					colorImage={colorImage}
				/>

				<div className="space-y-5">
					<h1 className="text-2xl font-bold md:text-3xl">
						{product.name}
					</h1>
					{product.sku && (
						<p className="text-sm text-muted-foreground">
							<span className="font-semibold text-foreground">
								{t("bazar.sku")}:
							</span>{" "}
							{product.sku}
						</p>
					)}

					<div className="flex flex-wrap items-center gap-3">
						<span className="text-3xl font-bold text-primary tabular-nums">
							<Price amount={price} />
						</span>
						{saveAmount > 0 && (
							<>
								<span className="text-muted-foreground line-through tabular-nums">
									<Price amount={originalPrice} />
								</span>
								<span className="rounded bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
									{t("bazar.save")}:{" "}
									<Price amount={saveAmount} />
								</span>
							</>
						)}
					</div>

					{product.variants && product.variants.length > 0 && (
						<ProductVariantSelector
							product={product}
							onVariantChange={(variant) => {
								setSelectedVariant(variant);
								setQuantity(1);
							}}
							onColorChange={(_color, colorId) => {
								setSelectedColorId(colorId || null);
							}}
						/>
					)}

					<div className="flex flex-wrap items-center gap-4">
						<QuantitySelector
							quantity={quantity}
							onQuantityChange={setQuantity}
							stock={availableStock}
						/>
						<span
							className={cn(
								"text-sm font-medium",
								availableStock > 0
									? "text-primary"
									: "text-destructive"
							)}
						>
							{availableStock} {t("bazar.inStock")}
						</span>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<Button
							size="lg"
							variant="secondary"
							className="rounded-full px-8 font-semibold"
							onClick={handleAddToCart}
							disabled={availableStock <= 0}
						>
							{t("bazar.addToCart")}
						</Button>
						<Button
							size="lg"
							className="rounded-full px-8 font-semibold"
							onClick={handleBuyNow}
							disabled={availableStock <= 0}
						>
							{t("bazar.buyNow")}
						</Button>
						<Button
							size="icon"
							variant={isWishlisted ? "default" : "outline"}
							className="rounded-full"
							onClick={handleToggleWishlist}
							disabled={isWishlistLoading}
							aria-label={t("bazar.wishlist")}
							aria-pressed={isWishlisted}
						>
							<Heart
								className={cn(
									"h-5 w-5",
									isWishlisted && "fill-current"
								)}
							/>
						</Button>
					</div>

					<ProductDeliveryInfo />

					<div className="flex items-center gap-3 border-t pt-4">
						<span className="text-sm font-medium">
							{t("bazar.shareOn")}:
						</span>
						<button
							type="button"
							onClick={() => share("facebook")}
							aria-label="Facebook"
							className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground hover:border-primary hover:text-primary"
						>
							<Facebook className="h-4 w-4" />
						</button>
						<button
							type="button"
							onClick={() => share("twitter")}
							aria-label="Twitter"
							className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground hover:border-primary hover:text-primary"
						>
							<Twitter className="h-4 w-4" />
						</button>
						<button
							type="button"
							onClick={() => share("linkedin")}
							aria-label="LinkedIn"
							className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground hover:border-primary hover:text-primary"
						>
							<Linkedin className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>

			<div className="mt-10">
				<ProductDetailsTabs product={product} />
			</div>

			{product.related_products &&
				product.related_products.length > 0 && (
					<section className="mt-12">
						<BazarSectionTitle titleKey="bazar.relatedProducts" />
						<BazarProductsGrid
							products={product.related_products as Product[]}
						/>
					</section>
				)}
		</main>
	);
}
```

Notes for the implementer:
- Before writing, open `app/components/product/product-details/ProductDeliveryInfo.tsx` — if it requires props, mirror the exact usage in `app/components/pages/ProductDetails.tsx`.
- If `addToCart` does not accept a `quantity` field, mirror how `app/components/pages/ProductDetails.tsx` passes quantity (check its `handleAddToCart` at ~line 119) and adjust.
- Check `trackUnifiedAddToCart`'s signature in `@/lib/analytics` and mirror the call from `ProductDetails.tsx`; drop the call if the signature differs materially.

- [ ] **Step 2: Verify**

Run: `npm run type-check` && `npm run lint` — Expected: exit 0 / no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/templates/bazar
git commit -m "feat(bazar): product details layout"
```

---

### Task 12: Assemble bazar template, register it, flip bn-02

**Files:**
- Create: `app/templates/bazar/index.ts`
- Modify: `app/templates/registry.ts`
- Modify: `app/variants/bn-02/index.ts`

**Interfaces:**
- Consumes: all Task 5–11 components; `Template` type.
- Produces: `bazarTemplate` registered as `"bazar"`; `bn-02` renders the bazar paradigm.

- [ ] **Step 1: Write `app/templates/bazar/index.ts`**

```ts
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
```

- [ ] **Step 2: Register it in `app/templates/registry.ts`**

Replace the placeholder entry:

```ts
import { bazarTemplate } from "./bazar";
```

```ts
const TEMPLATES: Record<TemplateId, Template> = {
	classic: classicTemplate,
	bazar: bazarTemplate,
};
```

(Remove the placeholder comment.)

- [ ] **Step 3: Flip bn-02**

In `app/variants/bn-02/index.ts`, change `template: "classic",` to:

```ts
  template: "bazar",
```

Also update the descriptor's `description` to mention the paradigm, e.g.:

```ts
  description:
    "Second Bengali demo on the bazar template: contact top bar, department sidebar, ribbon cards with Buy Now, mobile bottom nav.",
```

- [ ] **Step 4: Verify**

Run: `npm run type-check` && `npm run lint` — Expected: exit 0 / no new errors.

- [ ] **Step 5: Commit**

```bash
git add app/templates app/variants/bn-02
git commit -m "feat(variants): bn-02 renders the bazar template"
```

---

### Task 13: Full verification pass

**Files:** none (verification only; fix-forward anything found and commit fixes individually).

- [ ] **Step 1: Static checks**

Run: `npm run type-check` — Expected: exit 0.
Run: `npm run lint` — Expected: exit 0 (or only pre-existing warnings).

- [ ] **Step 2: Production build**

Run: `npm run build` — Expected: build completes without errors.

- [ ] **Step 3: Manual showcase pass (requires `NEXT_PUBLIC_SHOWCASE=true` in the user's `.env.local` — ask the user to set it; never edit env files)**

With `npm run dev` running, verify in a browser (use the verify/run skill or ask the user):

1. `/demo/bn-01` and `/demo/intl-01`: pixel-identical to before (classic header, nav bar, homepage sections, footer; listing with filters; classic PDP).
2. `/demo/bn-02`: bazar paradigm — top bar with email/phone/welcome/track-order/login; logo + search + wishlist/cart + total header; department sidebar + hero; Categories grid; Featured Product grid with ribbon cards + Add to Cart/Buy Now; promo banner pair; footer with address/links/newsletter.
3. `/demo/bn-02/products?category_id=<id>`: breadcrumb "Home > <Category>", bazar cards, infinite scroll works.
4. `/demo/bn-02/products/<id>`: bazar PDP; Add to Cart and Buy Now update the cart and navigate to checkout; quantity/stock behave; tabs render.
5. Mobile width (375px): bottom nav shows CATEGORY/CALL/HOME/CART/LOGIN with raised Home; floating call FAB visible and doesn't cover the bottom nav; header collapses with search row; footer not hidden behind the nav.
6. All internal links on `/demo/bn-02` keep the `/demo/bn-02` prefix.
7. Language switch bn ↔ en on bn-02 translates the bazar strings.
8. Client-deploy mode: ask the user to temporarily set `ACTIVE_VARIANT=bn-02` (and unset/false `NEXT_PUBLIC_SHOWCASE`) in `.env.local`, restart dev, and confirm the bazar UI serves at `/` with no `/demo` prefix and no variant switcher; then restore their previous env values.

- [ ] **Step 4: Update memory + push (if user approves push)**

Update the variant-showcase-architecture memory file with the template layer summary. Then:

```bash
git push origin main
```
