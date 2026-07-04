"use client";

import { useSearchParams } from "next/navigation";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/shared/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shared/ui/select";
import { Search, Grid2x2 as Grid, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";

interface ProductToolbarProps {
	totalProducts: number;
	displayedProducts: number;
	filterButton?: React.ReactNode;
}

export function ProductToolbar({
	totalProducts,
	displayedProducts,
	filterButton,
}: ProductToolbarProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(
		searchParams.get("search") || ""
	);
	const [isUserInput, setIsUserInput] = useState(false);

	const sortBy = searchParams.get("sort") || "name_asc";
	const viewMode = (searchParams.get("view") as "grid" | "list") || "grid";

	const debouncedSearchQuery = useDebounce(searchQuery, 500);

	// Update search query when URL changes (e.g., from mobile search)
	useEffect(() => {
		setSearchQuery(searchParams.get("search") || "");
		setIsUserInput(false); // Reset flag when URL updates externally
	}, [searchParams.get("search")]);

	// Debounce search only when user types
	useEffect(() => {
		if (!isUserInput) return; // Skip if this was an external URL update

		const currentSearch = searchParams.get("search") || "";

		if (debouncedSearchQuery !== currentSearch) {
			const params = new URLSearchParams(searchParams.toString());

			if (debouncedSearchQuery === "" || debouncedSearchQuery === null) {
				params.delete("search");
			} else {
				params.set("search", debouncedSearchQuery);
			}
			params.set("page", "1");

			router.push(
				ABSOLUTE_ROUTES.PRODUCT_BY_SEARCH_PARAMS(params.toString())
			);
		}
	}, [debouncedSearchQuery, searchParams, router, isUserInput]);

	const updateURL = (updates: Record<string, string | null>) => {
		const params = new URLSearchParams(searchParams.toString());

		Object.entries(updates).forEach(([key, value]) => {
			if (value === null || value === undefined || value === "") {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		});

		router.push(
			ABSOLUTE_ROUTES.PRODUCT_BY_SEARCH_PARAMS(params.toString())
		);
	};

	const handleSortChange = (value: string) => {
		updateURL({ sort: value, page: "1" });
	};

	const handleViewModeChange = (mode: "grid" | "list") => {
		updateURL({ view: mode });
	};

	return (
		<div className="mb-6">
			<h1 className="text-3xl font-bold mb-4">
				{t("products.allProducts") || "All Products"}
			</h1>
			{/* Mobile Search Box */}
			<div className="md:hidden mb-4">
				<div className="relative w-full">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
					<Input
						placeholder={
							t("products.searchPlaceholder") ||
							"Search products..."
						}
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							setIsUserInput(true);
						}}
						className="pl-10 h-8"
					/>
				</div>
			</div>
			{/* Desktop: Search bar and controls */}
			<div className="hidden md:flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
					<Input
						placeholder={
							t("products.searchPlaceholder") ||
							"Search products..."
						}
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							setIsUserInput(true); // Mark as user input
						}}
						className="pl-10"
					/>
				</div>
				<div className="flex items-center space-x-2">
					<Select value={sortBy} onValueChange={handleSortChange}>
						<SelectTrigger className="w-48">
							<SelectValue
								placeholder={t("products.sortBy") || "Sort by"}
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
							variant={viewMode === "grid" ? "default" : "ghost"}
							size="sm"
							onClick={() => handleViewModeChange("grid")}
						>
							<Grid className="w-4 h-4" />
						</Button>
						<Button
							variant={viewMode === "list" ? "default" : "ghost"}
							size="sm"
							onClick={() => handleViewModeChange("list")}
						>
							<List className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</div>
			{/* Mobile: Filter button and sorting controls on same row */}
			<div className="md:hidden flex items-center justify-between gap-2 mb-4">
				{filterButton}
				<Select value={sortBy} onValueChange={handleSortChange}>
					<SelectTrigger className="w-40 h-8">
						<SelectValue
							placeholder={t("products.sortBy") || "Sort by"}
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
			</div>
			<p className="text-muted-foreground text-sm">
				{t("products.showing") || "Showing"} {displayedProducts}{" "}
				{t("products.of") || "of"} {totalProducts}{" "}
				{totalProducts === 1 ? (t("navigation.products")?.slice(0, -1) || "product") : (t("navigation.products") || "products")}
			</p>
		</div>
	);
}
