"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shared/ui/card";
import { Slider } from "@/components/shared/ui/slider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shared/ui/select";
import { Badge } from "@/components/shared/ui/badge";
import {
	Search,
	Filter,
	X,
	Grid2x2 as Grid,
	List,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { ProductsGrid } from "@/components/product/ProductsGrid";
import { ProductsGridSkeleton } from "@/components/product/ProductsGridSkeleton";
import { ProductCardItem } from "@/components/product/ProductCardItem";
import type { PaginationMeta, Product } from "@/(app-routes)/products/model";
import { useTranslation } from "react-i18next";
import { Category } from "../shared/models/category";
import { Brand } from "../shared/models/brand";
import Price from "@/components/shared/Price";

interface InitialFilters {
	category?: string;
	is_featured?: boolean;
	today_deal?: boolean;
	top_selling?: boolean;
	page?: number;
	per_page?: number;
}

interface ProductsPageClientProps {
	initialProducts: Product[];
	categories: Category[];
	brands: Brand[];
	initialFilters?: InitialFilters;
	pagination?: PaginationMeta;
}

export function ProductsPageClient({
	initialProducts,
	categories,
	brands,
	initialFilters = {},
	pagination,
}: ProductsPageClientProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<number | null>(
		initialFilters.category ? parseInt(initialFilters.category) : null
	);
	const [selectedBrand, setSelectedBrand] = useState<string>("");
	const [priceRange, setPriceRange] = useState([0, 500000]);
	const [sortBy, setSortBy] = useState("name_asc");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [showFilters, setShowFilters] = useState(false);
	const [isFeatured, setIsFeatured] = useState(
		initialFilters.is_featured || false
	);
	const [isTodayDeal, setIsTodayDeal] = useState(
		initialFilters.today_deal || false
	);
	const [isTopSelling, setIsTopSelling] = useState(
		initialFilters.top_selling || false
	);
	const [isLoading, setIsLoading] = useState(false);

	// Count active filters
	const activeFiltersCount =
		(selectedCategory ? 1 : 0) +
		(selectedBrand ? 1 : 0) +
		(priceRange[0] > 0 || priceRange[1] < 500000 ? 1 : 0) +
		(isFeatured ? 1 : 0) +
		(isTodayDeal ? 1 : 0) +
		(isTopSelling ? 1 : 0);

	// Filter categories to show only parents, with their children nested
	const categoriesWithHierarchy = useMemo(() => {
		const parents = categories.filter((cat) => {
			const hasNoParent =
				!cat.parent_id ||
				cat.parent_id === null ||
				cat.parent_id === "null" ||
				cat.parent_id === "" ||
				cat.parent_id === "0";
			return hasNoParent;
		});

		return parents;
	}, [categories]);

	// Debounced search effect - auto-search after 500ms delay
	useEffect(() => {
		if (searchQuery === "") return; // Don't search on empty query

		const timeoutId = setTimeout(() => {
			// The search is already handled by the filteredProducts useMemo
			// This just logs when the debounce triggers
			// If you want to trigger a server-side search, you could call updateURL here
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [searchQuery]);

	// Turn off loading state when products change
	useEffect(() => {
		setIsLoading(false);
	}, [initialProducts]);

	// Function to update URL with filters
	type FilterValue =
		| string
		| number
		| boolean
		| null
		| undefined
		| Array<string | number>;
	const updateURL = (updates: Record<string, FilterValue>) => {
		const params = new URLSearchParams(searchParams.toString());

		Object.entries(updates).forEach(([key, value]) => {
			if (
				value === null ||
				value === undefined ||
				value === "" ||
				value === false
			) {
				params.delete(key);
			} else if (Array.isArray(value)) {
				if (value.length === 0) {
					params.delete(key);
				} else {
					params.set(key, value.join(","));
				}
			} else {
				params.set(key, value.toString());
			}
		});

		setIsLoading(true);
		router.push(`/products?${params.toString()}`, { scroll: false });
	};

	const handleCategoryChange = (categoryId: number) => {
		const newCategory = selectedCategory === categoryId ? null : categoryId;
		setSelectedCategory(newCategory);
		updateURL({
			category: newCategory,
			page: 1,
		});
	};

	const handleBrandChange = (brandId: string) => {
		// Toggle brand selection - click again to deselect
		const newBrand = selectedBrand === brandId ? "" : brandId;
		setSelectedBrand(newBrand);
		updateURL({
			brand_id: newBrand,
			page: 1,
		});
	};

	const handleFeatureFilterChange = (
		type: "featured" | "today_deal" | "top_selling"
	) => {
		// Toggle special offer selection - click again to deselect
		const isSameType =
			(type === "featured" && isFeatured) ||
			(type === "today_deal" && isTodayDeal) ||
			(type === "top_selling" && isTopSelling);

		if (isSameType) {
			// Deselect all
			setIsFeatured(false);
			setIsTodayDeal(false);
			setIsTopSelling(false);
			updateURL({
				is_featured: null,
				today_deal: null,
				top_selling: null,
				page: 1,
			});
		} else {
			// Select the clicked one
			setIsFeatured(type === "featured");
			setIsTodayDeal(type === "today_deal");
			setIsTopSelling(type === "top_selling");
			updateURL({
				is_featured: type === "featured" ? "1" : null,
				today_deal: type === "today_deal" ? "1" : null,
				top_selling: type === "top_selling" ? "1" : null,
				page: 1,
			});
		}
	};

	const handlePageChange = (newPage: number) => {
		updateURL({ page: newPage });
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const clearFilters = () => {
		setSelectedCategory(null);
		setSelectedBrand("");
		setPriceRange([0, 500000]);
		setSearchQuery("");
		setIsFeatured(false);
		setIsTodayDeal(false);
		setIsTopSelling(false);
		setIsLoading(true);
		router.push("/products");
	};

	const filteredProducts = useMemo(() => {
		if (!initialProducts) return [];
		const filtered = initialProducts.filter((product) => {
			const matchesSearch =
				product.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				product.category.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				product.brand.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesBrand =
				!selectedBrand || product.brand === selectedBrand;

			const matchesCategory =
				!selectedCategory || product.category.id === selectedCategory;

			const price = parseFloat(product.price.toString());
			const matchesPrice =
				price >= priceRange[0] && price <= priceRange[1];

			return (
				matchesSearch && matchesBrand && matchesCategory && matchesPrice
			);
		});

		// Note: Sorting is now handled by server, but we keep local sorting for search results
		if (searchQuery) {
			filtered.sort((a, b) => {
				const priceA = parseFloat(a.price.toString());
				const priceB = parseFloat(b.price.toString());

				switch (sortBy) {
					case "price_low_high":
						return priceA - priceB;
					case "price_high_low":
						return priceB - priceA;
					case "name_asc":
						return a.name.localeCompare(b.name);
					case "name_desc":
						return b.name.localeCompare(a.name);
					default:
						return 0;
				}
			});
		}

		return filtered;
	}, [
		initialProducts,
		searchQuery,
		selectedBrand,
		selectedCategory,
		priceRange,
		sortBy,
	]);

	return (
		<main className="container mx-auto px-4 py-4 md:py-6">
			<div className="mb-8">
				<h1 className="text-sm md:text-3xl font-bold mb-4">
					{t("products.allProducts") || "All Products"}
				</h1>
				<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
						<Input
							placeholder={
								t("products.searchPlaceholder") ||
								"Search products..."
							}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							onClick={() => setShowFilters(!showFilters)}
							className="md:hidden"
						>
							<Filter className="w-4 h-4 mr-2" />
							{t("products.filters") || "Filters"}
							{activeFiltersCount > 0 && (
								<Badge variant="secondary" className="ml-2">
									{activeFiltersCount}
								</Badge>
							)}
						</Button>
						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className="w-48">
								<SelectValue
									placeholder={
										t("products.sortBy") || "Sort by"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="name_asc">
									{t("products.nameAZ") || "Name A-Z"}
								</SelectItem>
								<SelectItem value="name_desc">
									{t("products.nameZA") || "Name Z-A"}
								</SelectItem>
								<SelectItem value="price_low_high">
									{t("products.priceLowHigh") ||
										"Price: Low to High"}
								</SelectItem>
								<SelectItem value="price_high_low">
									{t("products.priceHighLow") ||
										"Price: High to Low"}
								</SelectItem>
							</SelectContent>
						</Select>
						<div className="flex border rounded-md">
							<Button
								variant={
									viewMode === "grid" ? "default" : "ghost"
								}
								size="sm"
								onClick={() => setViewMode("grid")}
							>
								<Grid className="w-4 h-4" />
							</Button>
							<Button
								variant={
									viewMode === "list" ? "default" : "ghost"
								}
								size="sm"
								onClick={() => setViewMode("list")}
							>
								<List className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>
			<div className="flex flex-col lg:flex-row gap-8">
				<div
					className={`lg:w-64 space-y-6 ${showFilters ? "block" : "hidden lg:block"
						}`}
				>
					<Card>
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">
									{t("products.filters") || "Filters"}
								</CardTitle>
								{activeFiltersCount > 0 && (
									<Button
										variant="outline"
										size="sm"
										onClick={clearFilters}
									>
										<X className="w-4 h-4 mr-1" />
										{t("products.clear") || "Clear"}
									</Button>
								)}
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Special Filters */}
							<div>
								<h3 className="font-medium mb-3">
									{t("products.specialOffers") ||
										"Special Offers"}
								</h3>
								<div className="space-y-2">
									<div
										className="flex items-center space-x-2 cursor-pointer"
										onClick={() =>
											handleFeatureFilterChange(
												"featured"
											)
										}
									>
										<div
											className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isFeatured
												? "border-primary bg-primary"
												: "border-muted-foreground"
												}`}
										>
											{isFeatured && (
												<div className="w-2 h-2 rounded-full bg-white" />
											)}
										</div>
										<label className="text-sm cursor-pointer">
											{t("products.featured") ||
												"Featured Products"}
										</label>
									</div>
									<div
										className="flex items-center space-x-2 cursor-pointer"
										onClick={() =>
											handleFeatureFilterChange(
												"today_deal"
											)
										}
									>
										<div
											className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isTodayDeal
												? "border-primary bg-primary"
												: "border-muted-foreground"
												}`}
										>
											{isTodayDeal && (
												<div className="w-2 h-2 rounded-full bg-white" />
											)}
										</div>
										<label className="text-sm cursor-pointer">
											{t("products.todayDeals") ||
												"Today's Deals"}
										</label>
									</div>
									<div
										className="flex items-center space-x-2 cursor-pointer"
										onClick={() =>
											handleFeatureFilterChange(
												"top_selling"
											)
										}
									>
										<div
											className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isTopSelling
												? "border-primary bg-primary"
												: "border-muted-foreground"
												}`}
										>
											{isTopSelling && (
												<div className="w-2 h-2 rounded-full bg-white" />
											)}
										</div>
										<label className="text-sm cursor-pointer">
											{t("products.topSelling") ||
												"Top Selling"}
										</label>
									</div>
								</div>
							</div>
							<div>
								<h3 className="font-medium mb-3">
									{t("products.categories") || "Categories"}
								</h3>
								<div className="space-y-3">
									{categoriesWithHierarchy.map((category) => (
										<div key={category.id}>
											{/* Parent Category */}
											<div
												className="flex items-center space-x-2 cursor-pointer"
												onClick={(e) => {
													e.stopPropagation();
													handleCategoryChange(
														category.id
													);
												}}
											>
												<div
													className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedCategory ===
														category.id
														? "border-primary bg-primary"
														: "border-muted-foreground"
														}`}
												>
													{selectedCategory ===
														category.id && (
															<div className="w-2 h-2 rounded-full bg-white" />
														)}
												</div>
												<label className="text-sm cursor-pointer font-medium">
													{category.name}
												</label>
											</div>

											{/* Child Categories: show directly below parent, no extra margin */}
											{category.child_category &&
												category.child_category.length >
												0 && (
													<div className="space-y-2">
														{category.child_category.map(
															(child) => (
																<div
																	key={
																		child.id
																	}
																	className="flex items-center space-x-2 cursor-pointer mt-2"
																	onClick={(
																		e
																	) => {
																		e.stopPropagation();
																		handleCategoryChange(
																			child.id
																		);
																	}}
																>
																	<div
																		className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedCategory ===
																			child.id
																			? "border-primary bg-primary"
																			: "border-muted-foreground"
																			}`}
																	>
																		{selectedCategory ===
																			child.id && (
																				<div className="w-2 h-2 rounded-full bg-white" />
																			)}
																	</div>
																	<label className="text-sm cursor-pointer text-muted-foreground">
																		{
																			child.name
																		}
																	</label>
																</div>
															)
														)}
													</div>
												)}
										</div>
									))}
								</div>
							</div>
							<div>
								<h3 className="font-medium mb-3">
									{t("products.brands") || "Brands"}
								</h3>
								<div className="space-y-2">
									{brands.map((brand) => (
										<div
											key={brand.id}
											className="flex items-center space-x-2 cursor-pointer"
											onClick={() =>
												handleBrandChange(
													brand.id.toString()
												)
											}
										>
											<div
												className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedBrand ===
													brand.id.toString()
													? "border-primary bg-primary"
													: "border-muted-foreground"
													}`}
											>
												{selectedBrand ===
													brand.id.toString() && (
														<div className="w-2 h-2 rounded-full bg-white" />
													)}
											</div>
											<label className="text-sm cursor-pointer">
												{brand.name}
											</label>
										</div>
									))}
								</div>
							</div>
							<div>
								<h3 className="font-medium mb-3">
									{t("products.priceRange") || "Price Range"}
								</h3>
								<div className="space-y-4">
									<Slider
										value={priceRange}
										onValueChange={setPriceRange}
										max={500000}
										step={5000}
										className="w-full"
									/>
									<div className="flex items-center justify-between text-sm text-muted-foreground">
										<span>
											<Price amount={priceRange[0]} />
										</span>
										<span>
											<Price amount={priceRange[1]} />
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
				<div className="flex-1">
					<div className="mb-4 flex items-center justify-between">
						<p className="text-muted-foreground">
							{t("products.showing") || "Showing"}{" "}
							{filteredProducts.length} {t("products.of") || "of"}{" "}
							{initialProducts.length}{" "}
							{t("products.products") || "products"}
						</p>
					</div>
					{isLoading ? (
						<ProductsGridSkeleton count={12} />
					) : filteredProducts.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground">
								{t("products.noProductsFound") ||
									"No products found matching your filters."}
							</p>
							<Button
								variant="destructive"
								onClick={clearFilters}
								className="mt-4"
							>
								{t("products.clearFilters") || "Clear Filters"}
							</Button>
						</div>
					) : (
						<>
							{viewMode === "grid" ? (
								<ProductsGrid products={filteredProducts} />
							) : (
								<div className="space-y-4">
									{filteredProducts.map((product) => (
										<ProductCardItem
											key={product.id}
											product={product}
										/>
									))}
								</div>
							)}
							{/* Pagination */}
							{pagination?.last_page &&
								pagination.last_page > 1 && (
									<div className="mt-8 flex items-center justify-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												handlePageChange(
													pagination?.current_page
														? pagination.current_page -
														1
														: 1
												)
											}
											disabled={
												pagination?.current_page === 1
											}
										>
											<ChevronLeft className="w-4 h-4 mr-1" />
											{t("products.previous") ||
												"Previous"}
										</Button>
										<div className="flex items-center gap-1">
											{Array.from(
												{
													length: pagination.last_page,
												},
												(_, i) => i + 1
											)
												.filter((page) => {
													// Show first page, last page, current page, and pages around current
													return (
														page === 1 ||
														page ===
														pagination.last_page ||
														Math.abs(
															page -
															pagination.current_page
														) <= 1
													);
												})
												.map((page, index, array) => (
													<React.Fragment key={page}>
														{index > 0 &&
															array[index - 1] !==
															page - 1 && (
																<span
																	key={`ellipsis-${page}`}
																	className="px-2"
																>
																	...
																</span>
															)}
														<Button
															variant={
																page ===
																	pagination.current_page
																	? "default"
																	: "outline"
															}
															size="sm"
															onClick={() =>
																handlePageChange(
																	page
																)
															}
														>
															{page}
														</Button>
													</React.Fragment>
												))}
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												handlePageChange(
													pagination?.current_page
														? pagination.current_page +
														1
														: 1
												)
											}
											disabled={
												pagination?.current_page ===
												pagination?.last_page
											}
										>
											{t("products.next") || "Next"}
											<ChevronRight className="w-4 h-4 ml-1" />
										</Button>
									</div>
								)}
						</>
					)}
				</div>
			</div>
		</main>
	);
}
