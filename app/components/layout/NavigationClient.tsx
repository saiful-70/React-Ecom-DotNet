"use client";

import * as React from "react";
import Link from "next/link";
import { Star, Zap } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/shared/ui/navigation-menu";
import { Button } from "@/components/shared/ui/button";
import type { Category } from "@/components/shared/models/category";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import Image from "next/image";
import { generateCategorySearchParams } from "@/lib/utils/routes.utils";

interface NavigationClientProps {
	categories: Category[];
}

export const NavigationClient = ({ categories }: NavigationClientProps) => {
	const { t } = useTranslation();

	const router = useRouter();
	const pathname = usePathname();
	const currentCategoryIds = useSearchParams().get("category_id");
	const isHomePage = pathname === ABSOLUTE_ROUTES.HOME;

	// Handler for special links: scroll on homepage, navigate to products page otherwise
	const handleSpecialLinkClick = (
		e: React.MouseEvent<HTMLAnchorElement>,
		sectionId: string,
		productsUrl: string
	) => {
		e.preventDefault();

		if (isHomePage) {
			const element = document.getElementById(sectionId);
			if (element) {
				const offsetTop = element.offsetTop - 50;
				window.scrollTo({
					top: offsetTop,
					behavior: "smooth",
				});
			}
		} else {
			router.push(productsUrl);
		}
	};

	// Render nested categories with proper grouping
	const renderCategoryTree = (childCategories: Category[] | import("@/components/shared/models/category").ChildCategory[]) => {
		return childCategories.map((cat) => (
			<div key={cat.id} className="space-y-2">
				<ListItem
					title={cat.name}
					href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
						generateCategorySearchParams(
							currentCategoryIds,
							cat.id
						)
					)}
					icon={cat.icon}
					depth={0}
				>
					{t("navigation.browse") || "Browse"}{" "}
					{cat.name}{" "}
					{t("navigation.products") || "products"}
				</ListItem>

				{/* Render children if they exist */}
				{('child_category' in cat && cat.child_category && cat.child_category.length > 0) && (
					<div className="ml-4 space-y-1 border-l-2 border-muted pl-3">
						{cat.child_category.map((child) => (
							<div key={child.id} className="space-y-1">
								<ListItem
									title={child.name}
									href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
										generateCategorySearchParams(
											currentCategoryIds,
											child.id
										)
									)}
									icon={child.icon}
									depth={1}
								>
									{child.name}
								</ListItem>

								{/* Render grandchildren if they exist */}
								{('child_category' in child && child.child_category && child.child_category.length > 0) && (
									<div className="ml-4 space-y-1 border-l-2 border-muted pl-3">
										{child.child_category.map((grandchild) => (
											<ListItem
												key={grandchild.id}
												title={grandchild.name}
												href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
													generateCategorySearchParams(
														currentCategoryIds,
														grandchild.id
													)
												)}
												icon={'icon' in grandchild ? grandchild.icon : undefined}
												depth={2}
											>
												{grandchild.name}
											</ListItem>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		));
	};

	return (
		<NavigationMenu className="py-1">
			<NavigationMenuList className="flex items-center space-x-1">
				{/* Categories with Megamenu */}
				{categories.map((category, index) => {
					const hasChildren =
						category.child_category &&
						category.child_category.length > 0;

					// Items in the right half open right-aligned so the wide
					// megamenu panel doesn't overflow the viewport edge.
					const alignRight =
						index >= Math.ceil(categories.length / 2);

					if (hasChildren) {
						return (
							<NavigationMenuItem key={category.id}>
								<Link
									href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
										generateCategorySearchParams(
											currentCategoryIds,
											category.id
										)
									)}
									passHref
								>
									<NavigationMenuTrigger className="whitespace-nowrap hover:bg-primary/10 hover:text-primary transition-colors">
										{category.name}
									</NavigationMenuTrigger>
								</Link>
								<NavigationMenuContent
									className={alignRight ? "left-auto right-0" : ""}
								>
									<div className="w-[400px] p-4 md:w-[500px] lg:w-[600px] max-h-[500px] overflow-y-auto">
										<div className="grid gap-4 md:grid-cols-2">
											{renderCategoryTree(category.child_category)}
										</div>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
						);
					}

					// Category without children - Button style
					return (
						<NavigationMenuItem key={category.id}>
							<Button
								variant="ghost"
								className="whitespace-nowrap hover:bg-primary/10 hover:text-primary transition-colors"
								asChild
							>
								<Link
									href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
										generateCategorySearchParams(
											currentCategoryIds,
											category.id
										)
									)}
								>
									{category.name}
								</Link>
							</Button>
						</NavigationMenuItem>
					);
				})}

				{/* Featured */}
				<NavigationMenuItem>
					<Button
						variant="ghost"
						className="whitespace-nowrap hover:bg-accent/10 transition-colors"
						asChild
					>
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
							aria-label={
								t("navigation.viewFeaturedProducts") ||
								"View featured products"
							}
							className="text-foreground hover:text-accent"
						>
							{t("navigation.featured") || "Featured"}
							<Star className="w-4 h-4 text-accent fill-accent" />
						</Link>
					</Button>
				</NavigationMenuItem>

				{/* Deal (Today's Deals) */}
				<NavigationMenuItem>
					<Button
						variant="ghost"
						className="whitespace-nowrap hover:bg-primary/10 transition-colors"
						asChild
					>
						<Link
							href={
								isHomePage
									? "#today-deals"
									: "/products?today_deal=1"
							}
							onClick={(e) =>
								handleSpecialLinkClick(
									e,
									"today-deals",
									"/products?today_deal=1"
								)
							}
							aria-label={
								t("navigation.viewTodaysDeals") ||
								"View today's deals"
							}
							className="text-foreground hover:text-primary"
						>
							{t("navigation.deal") || "Deal"}
							<Zap className="w-4 h-4 text-primary fill-primary" />
						</Link>
					</Button>
				</NavigationMenuItem>

				{/* Sale (Top Selling) */}
				<NavigationMenuItem>
					<Button
						variant="ghost"
						className="whitespace-nowrap hover:bg-accent/10 transition-colors"
						asChild
					>
						<Link
							href={
								isHomePage
									? "#top-selling"
									: "/products?top_selling=1"
							}
							onClick={(e) =>
								handleSpecialLinkClick(
									e,
									"top-selling",
									"/products?top_selling=1"
								)
							}
							aria-label={
								t("navigation.viewTopSellingProducts") ||
								"View top selling products"
							}
							className="text-foreground hover:text-accent"
						>
							{t("navigation.sale") || "Sale"}
						</Link>
					</Button>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
};

function ListItem({
	title,
	children,
	href,
	icon,
	depth = 0,
	...props
}: Omit<React.ComponentPropsWithoutRef<"li">, "title"> & {
	href: string;
	title: string;
	icon?: string;
	depth?: number;
}) {
	const isParent = depth === 0;
	const isChild = depth === 1;
	const isGrandchild = depth === 2;

	const textSizeClass = isParent
		? "text-sm font-semibold"
		: isChild
			? "text-sm font-medium"
			: "text-xs";

	const hoverClass = isParent
		? "hover:bg-primary/10"
		: "hover:bg-muted";

	return (
		<NavigationMenuLink asChild>
			<Link
				href={href}
				className={`block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors ${hoverClass} focus:bg-accent focus:text-accent-foreground`}
			>
				<div className={`${textSizeClass} leading-none flex items-center gap-2`}>
					{icon && typeof icon === 'string' && icon.startsWith('http') && isParent && (
						<Image
							src={icon}
							alt=""
							width={20}
							height={20}
							className="w-5 h-5 object-contain flex-shrink-0"
						/>
					)}
					{isChild && <span className="text-muted-foreground text-xs">•</span>}
					{isGrandchild && <span className="text-muted-foreground text-xs">–</span>}
					<span className={isParent ? "text-foreground" : isChild ? "text-foreground/90" : "text-foreground/75"}>
						{title}
					</span>
				</div>
				{isParent && children && (
					<p className="line-clamp-1 text-xs leading-snug text-muted-foreground mt-1">
						{children}
					</p>
				)}
			</Link>
		</NavigationMenuLink>
	);
}
