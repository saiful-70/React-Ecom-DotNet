"use client";

import "../classic.css";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Category } from "@/components/shared/models/category";

/**
 * The department line: one row of category links on the white field, scrolling
 * sideways on a phone. Separated by a hairline, never a bar of colour.
 */
export function ClassicNavigationClient({
	categories,
}: {
	categories: Category[];
}) {
	const { t } = useTranslation();

	return (
		<nav
			aria-label={t("classic2.categoriesNav", "পণ্যের বিভাগ")}
			className="border-b border-border bg-background"
		>
			<div className="container mx-auto">
				<ul className="flex items-stretch gap-1 overflow-x-auto py-1.5">
					<li className="shrink-0">
						<Link
							href={ABSOLUTE_ROUTES.PRODUCTS}
							className="ring-warm-focus flex h-10 items-center rounded-lg px-3 text-sm font-bold transition-colors hover:bg-accent active:bg-accent"
						>
							{t("classic2.allProducts", "সব পণ্য")}
						</Link>
					</li>
					{categories.map((category) => (
						<li key={category.id} className="shrink-0">
							<Link
								href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
									category.id
								)}
								className="ring-warm-focus flex h-10 items-center whitespace-nowrap rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:bg-accent"
							>
								{category.name}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</nav>
	);
}
