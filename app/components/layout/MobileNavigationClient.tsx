"use client";

import { useState } from "react";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ChevronDown, ChevronRight, Star, Flame, Zap } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/shared/ui/collapsible";
import type { Category } from "@/components/shared/models/category";
import { API_ROUTES } from "@/lib/api-route";
import { usePathname } from "next/navigation";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { cn } from "@/lib/utils/utils";

interface MobileNavigationClientProps {
	categories: Category[];
	onClose: () => void;
}

export const MobileNavigationClient = ({
	categories,
	onClose,
}: MobileNavigationClientProps) => {
	const [openCategories, setOpenCategories] = useState<number[]>([]);
	const router = useRouter();
	const pathname = usePathname();
	const isHomePage = pathname === "/";

	const toggleCategory = (categoryId: number) => {
		setOpenCategories((prev) =>
			prev.includes(categoryId)
				? prev.filter((id) => id !== categoryId)
				: [...prev, categoryId]
		);
	};

	// Handler for special links
	const handleSpecialLinkClick = (
		e: React.MouseEvent<HTMLAnchorElement>,
		sectionId: string,
		productsUrl: string
	) => {
		e.preventDefault();
		onClose(); // Close mobile menu first

		if (isHomePage) {
			// On homepage, smooth scroll to section
			setTimeout(() => {
				const element = document.getElementById(sectionId);
				if (element) {
					element.scrollIntoView({
						behavior: "smooth",
						block: "start",
					});
				}
			}, 100);
		} else {
			// On other pages, navigate to products page with filters
			router.push(productsUrl);
		}
	};

	return (
		<nav
			className="py-2 px-2 max-h-[60vh] overflow-y-auto"
			aria-label="Mobile product categories"
		>
			{/* Special Navigation Items */}
			<div className="mb-4 pb-4 border-b space-y-2">
				{/* Featured */}
				<Link
					href={
						isHomePage
							? "#featured-products"
							: "/products?is_featured=1"
					}
					onClick={(e) =>
						handleSpecialLinkClick(
							e,
							"featured-products",
							"/products?is_featured=1"
						)
					}
					className={cn(
						"flex items-center gap-2 py-3 px-3 rounded-md transition-all duration-200",
						"bg-accent/10 text-accent hover:bg-accent/20 active:scale-95 font-medium"
					)}
					aria-label="View featured products"
				>
					<Star className="w-5 h-5 text-accent fill-accent" />
					<span className="text-sm">Featured</span>
				</Link>

				{/* Deal */}
				<Link
					href={
						isHomePage ? "#today-deals" : "/products?today_deal=1"
					}
					onClick={(e) =>
						handleSpecialLinkClick(
							e,
							"today-deals",
							"/products?today_deal=1"
						)
					}
					className={cn(
						"flex items-center gap-2 py-3 px-3 rounded-md transition-all duration-200",
						"bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 font-medium"
					)}
					aria-label="View today's deals"
				>
					<Zap className="w-5 h-5 text-primary fill-primary" />
					<span className="text-sm">Deal</span>
				</Link>

				{/* Sale */}
				<Link
					href={
						isHomePage ? "#top-selling" : "/products?top_selling=1"
					}
					onClick={(e) =>
						handleSpecialLinkClick(
							e,
							"top-selling",
							"/products?top_selling=1"
						)
					}
					className={cn(
						"flex items-center gap-2 py-3 px-3 rounded-md transition-all duration-200",
						"bg-accent/10 text-accent hover:bg-accent/20 active:scale-95 font-medium"
					)}
					aria-label="View top selling products"
				>
					<Flame className="w-5 h-5 text-accent fill-accent" />
					<span className="text-sm">Sale</span>
				</Link>
			</div>

			{/* Categories */}
			{categories.map((category) => {
				const hasChildren =
					category.child_category &&
					category.child_category.length > 0;
				const isOpen = openCategories.includes(category.id);

				if (hasChildren) {
					return (
						<Collapsible
							key={category.id}
							open={isOpen}
							onOpenChange={() => toggleCategory(category.id)}
						>
							<div className="flex flex-col">
								{/* Parent Category */}
								<div className="flex items-center">
									<Link
										href={API_ROUTES.PRODUCTS.FILTER_BY_CATEGORY(
											category.id
										)}
										className="flex-1 py-3 px-3 hover:bg-accent rounded-md transition-all duration-200 active:scale-95"
										onClick={onClose}
										aria-label={`View all ${category.name} products`}
									>
										<span className="text-sm font-medium">
											{category.name}
										</span>
									</Link>
									<CollapsibleTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="px-2"
											aria-label={`${isOpen ? "Collapse" : "Expand"
												} ${category.name} subcategories`}
											aria-expanded={isOpen}
										>
											{isOpen ? (
												<ChevronDown
													className="h-4 w-4"
													aria-hidden="true"
												/>
											) : (
												<ChevronRight
													className="h-4 w-4"
													aria-hidden="true"
												/>
											)}
										</Button>
									</CollapsibleTrigger>
								</div>

								{/* Child Categories */}
								<CollapsibleContent className="pl-4">
									<div
										className="border-l-2 border-muted ml-2 mt-1"
										role="list"
										aria-label={`${category.name} subcategories`}
									>
										{category.child_category.map(
											(child) => {
												const hasGrandchildren =
													"child_category" in child &&
													child.child_category &&
													child.child_category.length > 0;
												const isChildOpen = openCategories.includes(child.id);

												if (hasGrandchildren) {
													return (
														<Collapsible
															key={child.id}
															open={isChildOpen}
															onOpenChange={() => toggleCategory(child.id)}
														>
															<div className="flex flex-col">
																{/* Child Category */}
																<div className="flex items-center ml-2">
																	<Link
																		href={API_ROUTES.PRODUCTS.FILTER_BY_CATEGORY(
																			child.id
																		)}
																		className="flex-1 py-2 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-all duration-200 active:scale-95"
																		onClick={onClose}
																		role="listitem"
																		aria-label={`View all ${child.name} products`}
																	>
																		<span className="flex items-center gap-2">
																			<span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
																			{child.name}
																		</span>
																	</Link>
																	<CollapsibleTrigger asChild>
																		<Button
																			variant="ghost"
																			size="sm"
																			className="px-2"
																			aria-label={`${isChildOpen ? "Collapse" : "Expand"
																				} ${child.name} subcategories`}
																			aria-expanded={isChildOpen}
																		>
																			{isChildOpen ? (
																				<ChevronDown
																					className="h-3 w-3"
																					aria-hidden="true"
																				/>
																			) : (
																				<ChevronRight
																					className="h-3 w-3"
																					aria-hidden="true"
																				/>
																			)}
																		</Button>
																	</CollapsibleTrigger>
																</div>

																{/* Grandchild Categories */}
																<CollapsibleContent className="pl-6">
																	<div
																		className="border-l-2 border-muted/50 ml-2 mt-1"
																		role="list"
																		aria-label={`${child.name} subcategories`}
																	>
																		{child.child_category && child.child_category.map(
																			(grandchild) => (
																				<Link
																					key={grandchild.id}
																					href={API_ROUTES.PRODUCTS.FILTER_BY_CATEGORY(
																						grandchild.id
																					)}
																					className="block py-1.5 px-3 text-sm text-muted-foreground/80 hover:text-foreground hover:bg-accent/30 rounded-md transition-all duration-200 ml-2 active:scale-95"
																					onClick={onClose}
																					role="listitem"
																					aria-label={`View ${grandchild.name} products`}
																				>
																					<span className="flex items-center gap-2">
																						<span className="w-1 h-px bg-muted-foreground/30" style={{ width: '6px' }} />
																						{grandchild.name}
																					</span>
																				</Link>
																			)
																		)}
																	</div>
																</CollapsibleContent>
															</div>
														</Collapsible>
													);
												}

												// Child without grandchildren
												return (
													<Link
														key={child.id}
														href={API_ROUTES.PRODUCTS.FILTER_BY_CATEGORY(
															child.id
														)}
														className="block py-2 px-4 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-all duration-200 ml-2 active:scale-95"
														onClick={onClose}
														role="listitem"
														aria-label={`View ${child.name} products`}
													>
														<span className="flex items-center gap-2">
															<span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
															{child.name}
														</span>
													</Link>
												);
											}
										)}
									</div>
								</CollapsibleContent>
							</div>
						</Collapsible>
					);
				}

				// Category without children
				return (
					<Link
						key={category.id}
						href={API_ROUTES.PRODUCTS.FILTER_BY_CATEGORY(
							category.id
						)}
						className="block py-3 px-3 hover:bg-accent rounded-md transition-all duration-200 active:scale-95"
						onClick={onClose}
						aria-label={`View ${category.name} products`}
					>
						<span className="text-sm font-medium">
							{category.name}
						</span>
					</Link>
				);
			})}
		</nav>
	);
};
