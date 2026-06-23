"use client";

import { SearchIcon, X } from "lucide-react";
import { Input } from "../shared/ui/input";
import { cn } from "@/lib/utils/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { useTranslation } from "react-i18next";
import { Button } from "../shared/ui/button";

type Props = {
	onMobileSearch?: () => void;
	placement?: "desktop" | "mobile";
};

export default function HeaderSearch({ onMobileSearch, placement = "desktop" }: Props) {
	const searchParams = useSearchParams();
	const [searchQuery, setSearchQuery] = useState("");
	const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
	const router = useRouter();
	const { t } = useTranslation();
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setSearchQuery(searchParams.get("search") ?? "");
	}, [searchParams]);

	// Focus input when mobile search opens
	useEffect(() => {
		if (isMobileSearchOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isMobileSearchOpen]);

	const pathname = usePathname();
	const isProductRoute = pathname === ABSOLUTE_ROUTES.PRODUCTS || pathname.startsWith("/products");

	const handleSearch = () => {
		const trimmedQuery = searchQuery.trim();

		// Close mobile menu and search if open
		if (onMobileSearch) {
			onMobileSearch();
		}
		setIsMobileSearchOpen(false);

		// If on products page, preserve existing filters
		if (isProductRoute) {
			const params = new URLSearchParams(searchParams.toString());
			if (trimmedQuery) {
				params.set("search", trimmedQuery);
			} else {
				params.delete("search");
			}
			params.set("page", "1");
			const scrollPos = window.scrollY;
			router.push(`/products?${params.toString()}`, { scroll: false });
			setTimeout(() => {
				window.scrollTo({ top: scrollPos, behavior: 'instant' });
			}, 0);
		} else {
			// From other pages, navigate to products with search
			if (trimmedQuery) {
				const params = new URLSearchParams();
				params.set("search", trimmedQuery);
				params.set("page", "1");
				router.push(ABSOLUTE_ROUTES.PRODUCT_BY_SEARCH_PARAMS(params.toString()));
			} else {
				router.push(ABSOLUTE_ROUTES.PRODUCTS);
			}
		}
	};

	const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSearch();
		}
		if (e.key === "Escape") {
			setIsMobileSearchOpen(false);
		}
	};

	const closeMobileSearch = () => {
		setIsMobileSearchOpen(false);
	};

	// Desktop placement - show search bar in header
	if (placement === "desktop") {
		return !isProductRoute ? (
			<div className={cn("flex flex-1 max-w-2xl mx-2")}>
				<div className="relative w-72 md:w-96">
					<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
					<Input
						placeholder={t("header.searchPlaceholder")}
						className="pl-10 pr-4 bg-background border-0 text-foreground placeholder:text-muted-foreground"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={handleSearchKeyDown}
					/>
				</div>
			</div>
		) : null;
	}

	// Mobile placement - show search icon in navbar (not on products page)
	return (
		<>
			{
				!isProductRoute ? (
					<Button
						variant="ghost"
						size="icon"
						className="md:hidden"
						onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
					>
						<SearchIcon className="w-5 h-5" />
					</Button>
				) : null
			}

			{/* Mobile Search Popup */}
			{isMobileSearchOpen && (
				<>
					{/* Overlay */}
					<div
						className="fixed inset-0 z-40 bg-black/50 md:hidden"
						onClick={closeMobileSearch}
					/>
					{/* Search Bar */}
					<div className="fixed top-0 left-0 right-0 z-50 bg-background md:hidden border-b">
						<div className="container mx-auto px-3 py-3 flex items-center gap-2">
							<div className="relative flex-1">
								<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
								<Input
									ref={inputRef}
									placeholder={t("header.searchPlaceholder")}
									className="pl-10 pr-4 bg-muted/50"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyDown={handleSearchKeyDown}
								/>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={closeMobileSearch}
							>
								<X className="w-5 h-5" />
							</Button>
						</div>
					</div>
				</>
			)}
		</>
	);
}
