import { Metadata } from "next";
import { getAllProducts } from "./action";
import { getAllCategories } from "@/components/shared/actions/categories";
import { getAllBrands } from "@/components/shared/actions/brands";
import { getBusinessSettings } from "@/components/shared/actions/business-settings";
import {
	generateMetadata as genMeta,
	generateBreadcrumbSchema,
	renderStructuredData,
} from "@/lib/utils/seo.utils";
import { getActiveVariant } from "@/variants/server";
import { getTemplate } from "@/templates/registry";

interface SearchParams {
	category_id?: string;
	brand_id?: string;
	page?: string;
	per_page?: string;
	is_featured?: string;
	today_deal?: string;
	top_selling?: string;
	sort?: string;
	search?: string;
	price_range?: string;
	view?: string;
}

export async function generateMetadata({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
	const params = await searchParams;
	const businessSettings = await getBusinessSettings();

	// Dynamic metadata based on filters
	let title = "Products";
	let description =
		"Browse our extensive collection of products across all categories. Find electronics, fashion, home & garden items, and more.";

	const paramsAny = params as Record<string, string | undefined>;

	if (paramsAny["today-deals"] === "true" || params.today_deal === "1") {
		title = "Today's Deals";
		description =
			"Don't miss out on today's special deals! Limited time offers on top products.";
	} else if (paramsAny["featured"] === "true" || params.is_featured === "1") {
		title = "Featured Products";
		description =
			"Explore our handpicked featured products. Quality items selected just for you.";
	} else if (
		paramsAny["top-selling"] === "true" ||
		params.top_selling === "1"
	) {
		title = "Top Selling Products";
		description =
			"Discover our best-selling products. Popular choices loved by customers.";
	} else if (params.search) {
		title = `Search Results for "${params.search}"`;
		description = `Find products matching "${params.search}".`;
	} else if (params.category_id) {
		title = `Category Products`;
		description = `Browse products in this category.`;
	}

	return genMeta({
		title,
		description,
		url: "/products",
		keywords: ["products", "shop", "buy online", "e-commerce"],
		businessSettings,
	});
}

export default async function Products({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const resolvedSearchParams = await searchParams;
	const page = parseInt(resolvedSearchParams.page || "1");
	const perPage = parseInt(resolvedSearchParams.per_page || "12");

	// Extract view mode from searchParams
	const viewMode = (resolvedSearchParams.view as "grid" | "list") || "grid";

	// Build query parameters
	const query: Record<string, string | number | (string | number)[]> = {
		per_page: perPage,
		page: page,
	};

	// Add filters if provided
	// Support both category (legacy) and category_id (new)
	const categoryParam = resolvedSearchParams.category_id;
	if (categoryParam) {
		// Send category IDs as comma-separated string to API
		query.category_id = categoryParam;
	}

	// Handle comma-separated brand IDs (send as string)
	if (resolvedSearchParams.brand_id) {
		query.brand_id = resolvedSearchParams.brand_id;
	}

	// Handle price range
	if (resolvedSearchParams.price_range) {
		query.price_range = resolvedSearchParams.price_range;
	}

	const resolvedParamsAny = resolvedSearchParams as Record<
		string,
		string | undefined
	>;

	// Support both is_featured=1 and featured=true
	if (
		resolvedSearchParams.is_featured === "1" ||
		resolvedParamsAny["featured"] === "true"
	) {
		query.is_featured = 1;
	}
	// Support both today_deal=1 and today-deals=true
	if (
		resolvedSearchParams.today_deal === "1" ||
		resolvedParamsAny["today-deals"] === "true"
	) {
		query.today_deal = 1;
	}
	// Support both top_selling=1 and top-selling=true
	if (
		resolvedSearchParams.top_selling === "1" ||
		resolvedParamsAny["top-selling"] === "true"
	) {
		query.top_selling = 1;
	}
	if (resolvedSearchParams.sort) {
		query.sort = resolvedSearchParams.sort;
	}
	if (resolvedSearchParams.search) {
		query.search_key = resolvedSearchParams.search;
	}
	// Remount key: any filter/sort/search change (everything except `page`)
	// resets the infinite list to a fresh first page.
	const infiniteListKey = JSON.stringify(
		Object.fromEntries(
			Object.entries(query).filter(([key]) => key !== "page")
		)
	);

	const productsResponse = await getAllProducts(query);

	const categoriesResponse = await getAllCategories();
	const brandsResponse = await getAllBrands();

	const products = productsResponse?.data?.products || [];
	const categories = categoriesResponse?.data?.categories || [];
	const brands = brandsResponse?.data || [];
	const meta = productsResponse?.data?.meta;

	// Support both formats for query params
	const todayDealSelected =
		resolvedSearchParams.today_deal === "1" ||
		resolvedParamsAny["today-deals"] === "true";
	const featuredSelected =
		resolvedSearchParams.is_featured === "1" ||
		resolvedParamsAny["featured"] === "true";
	const topSellingSelected =
		resolvedSearchParams.top_selling === "1" ||
		resolvedParamsAny["top-selling"] === "true";

	// Count active filters
	const activeFiltersCount =
		(resolvedSearchParams.category_id ? 1 : 0) +
		(resolvedSearchParams.brand_id ? 1 : 0) +
		(resolvedSearchParams.price_range ? 1 : 0) +
		(featuredSelected ? 1 : 0) +
		(todayDealSelected ? 1 : 0) +
		(topSellingSelected ? 1 : 0);

	// Generate breadcrumb schema
	const breadcrumbItems = [
		{ name: "Home", url: "/" },
		{ name: "Products", url: "/products" },
	];

	const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

	const variant = await getActiveVariant();
	const template = getTemplate(variant.template);

	// Breadcrumb label for templates that show "Home > <Category>": only when
	// exactly one category filter is active.
	const selectedCategoryName =
		categoryParam && !String(categoryParam).includes(",")
			? categories.find((c) => String(c.id) === String(categoryParam))
					?.name ?? null
			: null;

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
}
