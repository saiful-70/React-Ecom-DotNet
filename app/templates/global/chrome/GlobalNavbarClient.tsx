"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Category } from "@/components/shared/models/category";
import { cn } from "@/lib/utils/utils";
import { trackMenuClick } from "@/lib/analytics/tracking";
import "../global.css";

/** How many departments get their own index tab before the rail overflows
 *  into horizontal scroll. All departments remain reachable via the menu. */
const VISIBLE_TABS = 8;

/**
 * The index-tab department rail: top-level categories set as catalogue thumb
 * tabs sitting on the rule below the masthead, an "All departments" mega-menu
 * (keyboard reachable, Escape/outside-click to close), and the primary links.
 * On mobile the rail scrolls horizontally.
 */
export function GlobalNavbarClient({ categories }: { categories: Category[] }) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [activeId, setActiveId] = useState<number | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Close the mega-menu on outside click / Escape.
	useEffect(() => {
		if (!open) return;
		const onClick = (e: MouseEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", onClick);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onClick);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	const activeCategory = categories.find((c) => c.id === activeId) ?? null;
	const tabCategories = categories.slice(0, VISIBLE_TABS);

	const primaryLinks = [
		{ href: ABSOLUTE_ROUTES.PRODUCTS, label: t("global.nav.allProducts") },
		{
			href: `${ABSOLUTE_ROUTES.PRODUCTS}?is_featured=1`,
			label: t("global.nav.featured"),
		},
		{
			href: `${ABSOLUTE_ROUTES.PRODUCTS}?today_deal=1`,
			label: t("global.nav.offers"),
		},
	];

	return (
		<div className="border-b border-border bg-background">
			<div
				ref={containerRef}
				className="container relative mx-auto flex items-end gap-2"
			>
				{/* All-departments mega-menu trigger */}
				<div className="relative shrink-0 self-stretch">
					<button
						type="button"
						onClick={() => setOpen((v) => !v)}
						aria-expanded={open}
						aria-haspopup="true"
						className="ring-warm-focus flex h-full items-center gap-2 rounded-none border-x border-border bg-secondary px-3 py-2.5 text-sm font-semibold text-secondary-foreground md:px-4"
					>
						<LayoutGrid className="h-4 w-4" />
						<span className="hidden sm:inline">
							{t("global.nav.allDepartments", "All departments")}
						</span>
						<ChevronDown
							className={cn(
								"h-4 w-4 transition-transform duration-300",
								open && "rotate-180"
							)}
						/>
					</button>

					{open && categories.length > 0 && (
						<div
							className="g-settle absolute left-0 top-full z-50 flex w-[min(90vw,44rem)] rounded-b-sm border border-t-0 border-border bg-popover text-popover-foreground shadow-lg"
							onMouseLeave={() => setActiveId(null)}
						>
							<ul className="w-64 shrink-0 py-2">
								{categories.map((category) => (
									<li key={category.id}>
										<Link
											href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(category.id)}
											onMouseEnter={() => setActiveId(category.id)}
											onFocus={() => setActiveId(category.id)}
											onClick={() => {
												void trackMenuClick({
													menuId: `category-${category.id}`,
													menuName: category.name,
												});
												setOpen(false);
											}}
											className={cn(
												"ring-warm-focus flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-muted",
												activeId === category.id && "bg-muted"
											)}
										>
											{category.name}
											{category.child_category?.length > 0 && (
												<ChevronRight className="h-4 w-4 text-muted-foreground" />
											)}
										</Link>
									</li>
								))}
							</ul>

							{/* Child fly-out */}
							<div className="flex-1 border-l border-border p-4">
								{activeCategory &&
								activeCategory.child_category?.length > 0 ? (
									<div className="grid grid-cols-2 gap-x-4 gap-y-1">
										{activeCategory.child_category.map((child) => (
											<Link
												key={child.id}
												href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(child.id)}
												onClick={() => {
													void trackMenuClick({
														menuId: `category-${child.id}`,
														menuName: child.name,
													});
													setOpen(false);
												}}
												className="ring-warm-focus rounded-sm px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
											>
												{child.name}
											</Link>
										))}
									</div>
								) : (
									<p className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
										{t("global.nav.hoverHint")}
									</p>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Department index tabs */}
				{tabCategories.length > 0 && (
					<nav
						className="g-no-scrollbar flex flex-1 items-end gap-1 overflow-x-auto pt-2"
						aria-label={t("global.nav.categories")}
					>
						{tabCategories.map((category) => (
							<Link
								key={category.id}
								href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(category.id)}
								onClick={() =>
									trackMenuClick({
										menuId: `category-${category.id}`,
										menuName: category.name,
									})
								}
								className="g-tab ring-warm-focus whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-[0.04em] text-foreground"
							>
								{category.name}
							</Link>
						))}
					</nav>
				)}

				{/* Primary links */}
				<nav
					className="hidden shrink-0 items-center gap-1 self-stretch lg:flex"
					aria-label={t("global.nav.primary")}
				>
					{primaryLinks.map((link) => (
						<Link
							key={link.label}
							href={link.href}
							onClick={() =>
								trackMenuClick({ menuId: link.href, menuName: link.label })
							}
							className="ring-warm-focus flex items-center whitespace-nowrap rounded-sm px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							{link.label}
						</Link>
					))}
				</nav>
			</div>
		</div>
	);
}
