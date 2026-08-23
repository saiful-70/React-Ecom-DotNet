"use client";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import type { Category } from "@/components/shared/models/category";
import { trackMenuClick } from "@/lib/analytics/tracking";
import { deptStyle } from "../dept-color";
import "../bazar.css";

/**
 * SIM-coloured department rail — every department is a chip in exactly one
 * hue from the fixed cycle, assigned by index. The same index colours that
 * department everywhere else (tiles, tags), never remixed. Horizontal scroll
 * in the thumb zone on mobile, wrapping rows on desktop.
 */
export function BazarDeptRail({ categories }: { categories: Category[] }) {
	const { t } = useTranslation();

	if (categories.length === 0) return null;

	return (
		<section aria-label={t("bazar.allDepartments")}>
			<h2 className="mb-3 font-display text-lg font-bold md:text-xl">
				{t("bazar.allDepartments")}
			</h2>
			<ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
				{categories.map((category, index) => (
					<li key={category.id} className="shrink-0" style={deptStyle(index)}>
						<Link
							href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(category.id)}
							onClick={() =>
								trackMenuClick({
									menuId: `category-${category.id}`,
									menuName: category.name,
								})
							}
							className="bz-key bz-dept-chip ring-warm-focus inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-bold"
						>
							<span
								className="bz-dept-dot h-2.5 w-2.5 rounded-full"
								aria-hidden="true"
							/>
							{category.name}
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
