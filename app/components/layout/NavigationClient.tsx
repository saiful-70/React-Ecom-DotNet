"use client";

import * as React from "react";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { Gift, Star, Zap } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { useFeature } from "@/components/shared/providers/variant-provider";
import { useTranslation } from "react-i18next";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	NavigationMenuViewport,
} from "@/components/shared/ui/navigation-menu";
import { Button } from "@/components/shared/ui/button";
import type { Category } from "@/components/shared/models/category";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import Image from "next/image";
import { generateCategorySearchParams } from "@/lib/utils/routes.utils";
import { trackMenuClick } from "@/lib/analytics/tracking";

interface NavigationClientProps {
	categories: Category[];
}

// Stable, language-independent names for the non-category nav items, reported
// as MenuClick `menuName`. Keyed by the homepage section id.
const SPECIAL_MENU_NAMES: Record<string, string> = {
	"featured-products": "Featured",
	"today-deals": "Today's Deals",
	"top-selling": "Top Selling",
	"combo-offers": "Combo Offer",
};

export const NavigationClient = ({ categories }: NavigationClientProps) => {
	const { t } = useTranslation();
	const bundlesEnabled = useFeature("bundles");

	const router = useRouter();
	const pathname = usePathname();
	const currentCategoryIds = useSearchParams().get("category_id");
	const isHomePage = pathname === ABSOLUTE_ROUTES.HOME;
	const scrollerRef = React.useRef<HTMLDivElement>(null);
	const menuRef = React.useRef<React.ElementRef<typeof NavigationMenu>>(null);

	// Shared viewport sits under the whole bar. Slide it under the open
	// trigger so a right-hand category (e.g. Men's Fashion) does not open
	// over the first item. Hang from the trigger's right edge when the
	// panel would overflow the nav.
	const placeViewport = React.useCallback(() => {
		const root = menuRef.current;
		if (!root) return;
		const trigger = root.querySelector<HTMLElement>(
			"button[data-state='open']"
		);
		if (!trigger) {
			root.style.removeProperty("--nav-viewport-left");
			return;
		}
		const rootRect = root.getBoundingClientRect();
		const triggerRect = trigger.getBoundingClientRect();
		const viewport = root.querySelector<HTMLElement>(
			"[data-radix-navigation-menu-viewport]"
		);
		const panelWidth = viewport?.offsetWidth || 500;
		const maxLeft = Math.max(0, rootRect.width - panelWidth);
		let left = triggerRect.left - rootRect.left;
		if (left + panelWidth > rootRect.width) {
			left = triggerRect.right - rootRect.left - panelWidth;
		}
		root.style.setProperty(
			"--nav-viewport-left",
			`${Math.min(maxLeft, Math.max(0, left))}px`
		);
	}, []);

	React.useEffect(() => {
		const root = menuRef.current;
		if (!root) return;
		const observer = new MutationObserver(() => {
			requestAnimationFrame(placeViewport);
		});
		observer.observe(root, {
			attributes: true,
			subtree: true,
			attributeFilter: ["data-state", "style"],
		});
		window.addEventListener("resize", placeViewport);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", placeViewport);
		};
	}, [placeViewport]);

	// The category row is wider than the container. Map vertical wheel /
	// trackpad motion to horizontal scroll so the strip moves without a
	// shift-key (html/body clip overflow-x, so the page itself cannot).
	const handleScrollerWheel = (e: React.WheelEvent<HTMLDivElement>) => {
		const el = scrollerRef.current;
		if (!el || el.scrollWidth <= el.clientWidth) return;
		if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
		el.scrollLeft += e.deltaY;
		e.preventDefault();
	};

	// Handler for special links: scroll on homepage, navigate to products page otherwise
	const handleSpecialLinkClick = (
		e: React.MouseEvent<HTMLAnchorElement>,
		sectionId: string,
		productsUrl: string
	) => {
		e.preventDefault();

		// `sectionId` doubles as a stable menu id — it doesn't shift with the
		// display language, unlike the translated label.
		void trackMenuClick({
			menuId: sectionId,
			menuName: SPECIAL_MENU_NAMES[sectionId] ?? sectionId,
		});

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
		<NavigationMenu
			ref={menuRef}
			className="w-full max-w-none min-w-0 py-1"
			onValueChange={() => requestAnimationFrame(placeViewport)}
		>
			<div
				ref={scrollerRef}
				onWheel={handleScrollerWheel}
				onScroll={placeViewport}
				role="region"
				aria-label={t("navigation.categories") || "Product categories"}
				className="overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:thin]"
			>
				<NavigationMenuList className="flex w-max min-w-full flex-nowrap items-center justify-start space-x-1">
				{/* Categories with Megamenu */}
				{categories.map((category) => {
					const hasChildren =
						category.child_category &&
						category.child_category.length > 0;

					if (hasChildren) {
						return (
							<NavigationMenuItem key={category.id} className="shrink-0">
								<Link
									href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
										generateCategorySearchParams(
											currentCategoryIds,
											category.id
										)
									)}
									passHref
									onClick={() =>
										trackMenuClick({
											menuId: `category-${category.id}`,
											menuName: category.name,
										})
									}
								>
									<NavigationMenuTrigger className="whitespace-nowrap hover:bg-primary/10 hover:text-primary transition-colors">
										{category.name}
									</NavigationMenuTrigger>
								</Link>
								<NavigationMenuContent>
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
						<NavigationMenuItem key={category.id} className="shrink-0">
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
									onClick={() =>
										trackMenuClick({
											menuId: `category-${category.id}`,
											menuName: category.name,
										})
									}
								>
									{category.name}
								</Link>
							</Button>
						</NavigationMenuItem>
					);
				})}

				{/* Featured */}
				<NavigationMenuItem className="shrink-0">
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
				<NavigationMenuItem className="shrink-0">
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
				<NavigationMenuItem className="shrink-0">
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

				{/* Combo (combo offers shelf on the homepage) */}
				{bundlesEnabled && (
					<NavigationMenuItem className="shrink-0">
						<Button
							variant="ghost"
							className="whitespace-nowrap hover:bg-primary/10 transition-colors"
							asChild
						>
							<Link
								href={isHomePage ? "#combo-offers" : "/#combo-offers"}
								onClick={(e) =>
									handleSpecialLinkClick(
										e,
										"combo-offers",
										"/#combo-offers"
									)
								}
								aria-label={
									t("navigation.viewComboOffers") ||
									"View combo offers"
								}
								className="text-foreground hover:text-primary"
							>
								{t("navigation.combo") || "Combo"}
								<Gift className="w-4 h-4 text-primary" />
							</Link>
						</Button>
					</NavigationMenuItem>
				)}
				</NavigationMenuList>
			</div>
			<NavigationMenuViewport />
		</NavigationMenu>
	);
};

function ListItem({
	title,
	children,
	href,
	icon,
	depth = 0,
}: {
	children?: React.ReactNode;
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
				onClick={() =>
					trackMenuClick({ menuId: `category:${title}`, menuName: title })
				}
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
