"use client";

import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Category } from "@/components/shared/models/category";

/** Desktop "All Categories" department rail beside the hero banner. */
export function GlobalDepartmentSidebar({
	categories,
}: {
	categories: Category[];
}) {
	const { t } = useTranslation();

	if (categories.length === 0) return null;

	return (
		<aside className="hidden w-64 shrink-0 self-start overflow-hidden rounded-md border bg-card lg:block">
			<div className="flex items-center gap-2 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
				<Menu className="h-4 w-4" />
				{t("global.allCategories")}
			</div>
			<ul className="max-h-[420px] overflow-y-auto">
				{categories.map((category) => (
					<li key={category.id} className="border-b last:border-b-0">
						<Link
							href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(category.id)}
							className="block px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-primary"
						>
							{category.name}
						</Link>
					</li>
				))}
			</ul>
		</aside>
	);
}
