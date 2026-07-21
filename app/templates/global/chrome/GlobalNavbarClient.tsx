"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Category } from "@/components/shared/models/category";
import { cn } from "@/lib/utils/utils";

/**
 * Global chrome nav: a "Categories" mega-menu (top-level list with a child
 * fly-out) plus primary links. On mobile the bar collapses to a horizontally
 * scrollable strip; the mega-menu opens as a full-width panel.
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

	const primaryLinks = [
		{ href: ABSOLUTE_ROUTES.HOME, label: t("global.nav.home") },
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
		<div className="bg-primary text-primary-foreground">
			<div
				ref={containerRef}
				className="container relative mx-auto flex items-stretch px-4"
			>
				{/* Categories mega-menu trigger */}
				<div className="relative">
					<button
						type="button"
						onClick={() => setOpen((v) => !v)}
						aria-expanded={open}
						aria-haspopup="true"
						className="flex h-12 items-center gap-2 rounded-none bg-primary-foreground/10 px-4 text-sm font-semibold md:px-6"
					>
						<LayoutGrid className="h-4 w-4" />
						{t("global.nav.categories")}
						<ChevronDown
							className={cn(
								"h-4 w-4 transition-transform",
								open && "rotate-180"
							)}
						/>
					</button>

					{open && categories.length > 0 && (
						<div
							className="absolute left-0 top-full z-50 flex w-[min(90vw,44rem)] rounded-b-md border border-t-0 bg-popover text-popover-foreground shadow-xl"
							onMouseLeave={() => setActiveId(null)}
						>
							<ul className="w-64 shrink-0 py-2">
								{categories.map((category) => (
									<li key={category.id}>
										<Link
											href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
												category.id
											)}
											onMouseEnter={() => setActiveId(category.id)}
											onFocus={() => setActiveId(category.id)}
											onClick={() => setOpen(false)}
											className={cn(
												"flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
												activeId === category.id &&
													"bg-accent text-accent-foreground"
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
							<div className="flex-1 border-l p-4">
								{activeCategory &&
								activeCategory.child_category?.length > 0 ? (
									<div className="grid grid-cols-2 gap-x-4 gap-y-1">
										{activeCategory.child_category.map((child) => (
											<Link
												key={child.id}
												href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
													child.id
												)}
												onClick={() => setOpen(false)}
												className="rounded px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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

				{/* Primary links */}
				<nav
					className="flex items-stretch overflow-x-auto"
					aria-label={t("global.nav.primary")}
				>
					{primaryLinks.map((link) => (
						<Link
							key={link.label}
							href={link.href}
							className="flex items-center whitespace-nowrap px-3 text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground md:px-4"
						>
							{link.label}
						</Link>
					))}
				</nav>
			</div>
		</div>
	);
}
