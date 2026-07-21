"use client";

import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";

/**
 * Section header: title with a short accent underline, plus an optional
 * "View All" link on the right (matching the reference sections).
 *
 * Pass either a resolved `title` string (client callers) or a `titleKey` i18n
 * key (server callers that can't call the translation hook themselves).
 */
export function GlobalSectionTitle({
	title,
	titleKey,
	viewAllHref,
}: {
	title?: string;
	titleKey?: string;
	viewAllHref?: string;
}) {
	const { t } = useTranslation();
	const heading = titleKey ? t(titleKey) : title ?? "";

	return (
		<div className="mb-5 flex items-end justify-between gap-4">
			<div>
				<h2 className="text-xl font-bold md:text-2xl">{heading}</h2>
				<div className="mt-2 h-1 w-16 rounded bg-primary" />
			</div>
			{viewAllHref && (
				<Link
					href={viewAllHref}
					className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
				>
					{t("global.viewAll")}
					<ChevronRight className="h-4 w-4" />
				</Link>
			)}
		</div>
	);
}
