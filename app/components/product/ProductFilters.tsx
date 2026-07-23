"use client";

import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shared/ui/card";
import { Checkbox } from "@/components/shared/ui/checkbox";
import { Slider } from "@/components/shared/ui/slider";
import { cn } from "@/lib/utils/utils";
import Price from "@/components/shared/Price";
import { filterDrawerOpenAtom } from "@/store/ui-atoms";
import { useAtom } from "jotai";
import { Filter, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Brand } from "../shared/models/brand";
import { Category, ChildCategory } from "../shared/models/category";

interface ProductFiltersProps {
	categories: Category[];
	brands: Brand[];
	activeFiltersCount: number;
	buttonOnly?: boolean;
}

export function ProductFilters({
	categories,
	brands,
	activeFiltersCount,
	buttonOnly = false,
}: ProductFiltersProps) {
	const { t } = useTranslation();
	const [, startTransition] = useTransition();
	const scrollRef = useRef<number>(0);
	const isNavigatingRef = useRef<boolean>(false);

	const [isDrawerOpen, setIsDrawerOpen] = useAtom(filterDrawerOpenAtom);
	const router = useRouter();
	const searchParams = useSearchParams();

	// Restore scroll position after navigation
	useLayoutEffect(() => {
		if (isNavigatingRef.current) {
			window.scrollTo({ top: scrollRef.current, behavior: "instant" });
			isNavigatingRef.current = false;
		}
	}, [searchParams]);

	const selectedCategories = useMemo(() => {
		const categoryParam = searchParams.get("category_id");
		return categoryParam ? categoryParam.split(",").filter(Boolean) : [];
	}, [searchParams]);

	const selectedBrands = useMemo(() => {
		const brandParam = searchParams.get("brand_id");
		return brandParam ? brandParam.split(",").filter(Boolean) : [];
	}, [searchParams]);

	const priceRangeParam = searchParams.get("price_range");
	const initialPriceRange = priceRangeParam
		? priceRangeParam.split("-").map(Number)
		: [0, 100000];
	const [priceRange, setPriceRange] = useState<[number, number]>([
		initialPriceRange[0],
		initialPriceRange[1],
	]);
	const [isPriceRangeModified, setIsPriceRangeModified] = useState(false);

	useEffect(() => {
		if (priceRangeParam && !isPriceRangeModified) {
			const [min, max] = priceRangeParam.split("-").map(Number);
			setPriceRange([min, max]);
		} else if (!priceRangeParam && !isPriceRangeModified) {
			// Reset to default when price_range is cleared (e.g., when clear filters is clicked)
			setPriceRange([0, 100000]);
		}
	}, [priceRangeParam]);

	const isFeatured = searchParams.get("is_featured") === "1";
	const isTodayDeal = searchParams.get("today_deal") === "1";
	const isTopSelling = searchParams.get("top_selling") === "1";

	// Prepare categories with parent-child structure for display (3 levels)
	const structuredCategories = useMemo(() => {
		const result: Array<{ category: Category; depth: number }> = [];

		const processCategory = (cat: Category | ChildCategory, depth: number = 0) => {
			result.push({
				category: { ...cat, child_category: [] } as Category,
				depth,
			});

			if ('child_category' in cat && cat.child_category && Array.isArray(cat.child_category)) {
				cat.child_category.forEach((child) => {
					processCategory(child, depth + 1);
				});
			}
		};

		categories.forEach((cat) => processCategory(cat, 0));
		return result;
	}, [categories]);

	const updateURL = useCallback(
		(updates: Record<string, string | number | null>) => {
			const params = new URLSearchParams(searchParams.toString());

			Object.entries(updates).forEach(([key, value]) => {
				if (value === null || value === undefined || value === "") {
					params.delete(key);
				} else {
					params.set(key, value.toString());
				}
			});

			scrollRef.current = window.scrollY;
			isNavigatingRef.current = true;

			startTransition(() => {
				router.push(`/products?${params.toString()}`, { scroll: false });
			});
		},
		[searchParams, router]
	);

	const handleCategoryChange = (categoryId: string, checked: boolean) => {
		const updated = checked
			? [...selectedCategories, categoryId]
			: selectedCategories.filter((id) => id !== categoryId);

		const categoryParam = updated.length > 0 ? updated.join(",") : null;
		updateURL({ category_id: categoryParam, page: "1" });
	};

	const handleBrandChange = (brandId: string, checked: boolean) => {
		const updated = checked
			? [...selectedBrands, brandId]
			: selectedBrands.filter((id) => id !== brandId);

		const brandParam = updated.length > 0 ? updated.join(",") : null;
		updateURL({ brand_id: brandParam, page: "1" });
	};

	const handlePriceRangeChange = (value: number[]) => {
		setPriceRange([value[0], value[1]]);
		setIsPriceRangeModified(true);
	};

	useEffect(() => {
		if (!isPriceRangeModified) {
			return;
		}

		const timer = setTimeout(() => {
			const priceParam = `${priceRange[0]}-${priceRange[1]}`;
			const currentPriceRange = searchParams.get("price_range");

			if (currentPriceRange !== priceParam) {
				const params = new URLSearchParams(searchParams.toString());
				params.set("price_range", priceParam);
				params.set("page", "1");

				scrollRef.current = window.scrollY;
				isNavigatingRef.current = true;

				startTransition(() => {
					router.push(`/products?${params.toString()}`, { scroll: false });
				});
			}

			setIsPriceRangeModified(false);
		}, 800);

		return () => clearTimeout(timer);
	}, [priceRange, isPriceRangeModified, searchParams, router]);

	const handleFeatureFilterChange = (type: string) => {
		updateURL({
			is_featured: type === "featured" ? "1" : null,
			today_deal: type === "today_deal" ? "1" : null,
			top_selling: type === "top_selling" ? "1" : null,
			page: "1",
		});
	};

	const handleClearFilters = () => {
		scrollRef.current = window.scrollY;
		isNavigatingRef.current = true;
		router.push("/products", { scroll: false });
	};

	// Filter content component (reused for both desktop and mobile)
	const filterContent = (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">
						{t("products.filters") || "Filters"}
					</CardTitle>
					{activeFiltersCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleClearFilters}
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
						{t("products.specialOffers") || "Special Offers"}
					</h3>
					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							<Checkbox
								id="featured"
								checked={isFeatured}
								onCheckedChange={(checked) => {
									if (checked) {
										handleFeatureFilterChange("featured");
									} else {
										handleFeatureFilterChange("");
									}
								}}
							/>
							<label
								htmlFor="featured"
								className="text-sm cursor-pointer"
							>
								{t("products.featured") || "Featured Products"}
							</label>
						</div>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="today_deal"
								checked={isTodayDeal}
								onCheckedChange={(checked) => {
									if (checked) {
										handleFeatureFilterChange("today_deal");
									} else {
										handleFeatureFilterChange("");
									}
								}}
							/>
							<label
								htmlFor="today_deal"
								className="text-sm cursor-pointer"
							>
								{t("products.todayDeals") || "Today's Deals"}
							</label>
						</div>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="top_selling"
								checked={isTopSelling}
								onCheckedChange={(checked) => {
									if (checked) {
										handleFeatureFilterChange(
											"top_selling"
										);
									} else {
										handleFeatureFilterChange("");
									}
								}}
							/>
							<label
								htmlFor="top_selling"
								className="text-sm cursor-pointer"
							>
								{t("products.topSelling") || "Top Selling"}
							</label>
						</div>
					</div>
				</div>

				{/* Categories */}
				<div>
					<h3 className="font-medium mb-3">
						{t("products.categories") || "Categories"}
					</h3>
					<div className="space-y-2">
						{structuredCategories.map(({ category, depth }) => {
							const indentClass = depth === 0 ? "" : depth === 1 ? "ml-6" : "ml-12";
							const textClass = depth === 0 ? "font-medium" : depth === 1 ? "text-gray-600" : "text-gray-500 text-sm";

							return (
								<div
									key={category.id}
									className={`flex items-center space-x-2 ${indentClass} ${depth > 0 ? "mt-1" : ""}`}
								>
									<Checkbox
										id={`category-${category.id}`}
										checked={selectedCategories.includes(
											category.id.toString()
										)}
										onCheckedChange={(checked) => {
											handleCategoryChange(
												category.id.toString(),
												checked as boolean
											);
										}}
									/>
									<div className="flex items-center space-x-2">
										<label
											htmlFor={`category-${category.id}`}
											className={`text-sm cursor-pointer ${textClass}`}
										>
											{depth > 0 && <span className="text-muted-foreground mr-1"></span>}
											{category.name}
										</label>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Brands */}
				<div>
					<h3 className="font-medium mb-3">
						{t("products.brands") || "Brands"}
					</h3>
					<div className="space-y-2">
						{brands.map((brand) => (
							<div
								key={brand.id}
								className="flex items-center space-x-2"
							>
								<Checkbox
									id={`brand-${brand.slug}`}
									checked={selectedBrands.includes(
										brand.id.toString()
									)}
									onCheckedChange={(checked) => {
										handleBrandChange(
											brand.id.toString(),
											checked as boolean
										);
									}}
								/>
								<label
									htmlFor={`brand-${brand.slug}`}
									className="text-sm cursor-pointer"
								>
									{brand.name}
								</label>
							</div>
						))}
					</div>
				</div>

				{/* Price Range */}
				<div>
					<h3 className="font-medium mb-3">
						{t("products.priceRange") || "Price Range"}
					</h3>
					<div className="space-y-4">
						<Slider
							value={priceRange}
							onValueChange={handlePriceRangeChange}
							max={100000}
							step={500}
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
	);

	// If buttonOnly mode, just return the button
	if (buttonOnly) {
		return (
			<Button
				variant="outline"
				onClick={() => setIsDrawerOpen(true)}
				className="lg:hidden h-8"
			>
				<Filter className="w-4 h-4 mr-2" />
				{t("products.filters") || "Filters"}
				{activeFiltersCount > 0 && (
					<Badge variant="secondary" className="ml-2 text-xs px-1.5">
						{activeFiltersCount}
					</Badge>
				)}
			</Button>
		);
	}

	return (
		<>
			{/* Mobile/Tablet Drawer Overlay */}

			<div
				className={cn(
					"fixed inset-0 bg-black/50 z-40 lg:hidden transition-all duration-300",
					isDrawerOpen ? "translate-x-0" : "-translate-x-full"
				)}
				onClick={() => setIsDrawerOpen(false)}
			/>

			{/* Drawer Panel */}
			<div
				className={`fixed top-0 left-0 h-full w-80 bg-background z-50 shadow-xl lg:hidden transform transition-transform duration-300 overflow-y-auto ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"
					}`}
			>
				{/* Compact Drawer Header */}
				<div className="sticky top-0 bg-background border-b px-3 py-2 flex items-center justify-between z-10">
					<h2 className="text-base font-semibold flex items-center gap-2">
						<Filter className="w-4 h-4" />
						{t("products.filters") || "Filters"}
						{activeFiltersCount > 0 && (
							<Badge variant="secondary" className="text-xs px-1.5 py-0">
								{activeFiltersCount}
							</Badge>
						)}
					</h2>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => setIsDrawerOpen(false)}
					>
						<X className="w-4 h-4" />
					</Button>
				</div>

				{/* Drawer Content */}
				<div className="p-3">
					{filterContent}
				</div>
			</div>

			{/* Desktop Sidebar - Hidden on mobile/tablet, visible on lg+ */}
			<aside className="hidden lg:block lg:w-64 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto lg:flex-shrink-0">
				{filterContent}
			</aside>
		</>
	);
}
