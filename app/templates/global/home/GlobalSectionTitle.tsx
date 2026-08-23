"use client";

import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import "../global.css";

/**
 * Catalogue section header: an Archivo 900 heading sitting on a hairline rule,
 * with an optional "View all" pointer on the right.
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
		<div className="mb-5 flex items-baseline justify-between gap-4 border-b border-border pb-2.5">
			<h2 className="font-display text-xl font-black uppercase tracking-tight md:text-2xl">
				{heading}
			</h2>
			{viewAllHref && (
				<Link
					href={viewAllHref}
					className="ring-warm-focus flex shrink-0 items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline"
				>
					{t("global.viewAll")}
					<ChevronRight className="h-4 w-4" />
				</Link>
			)}
		</div>
	);
}
