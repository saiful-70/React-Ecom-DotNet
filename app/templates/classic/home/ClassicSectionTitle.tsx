"use client";

import "../classic.css";

import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";

/**
 * A shelf heading: the section name set heavy in the display face with the
 * "see everything" link on the same baseline. No rule underneath — the space
 * around it does the separating.
 */
export function ClassicSectionTitle({
	titleKey,
	titleDefault,
	viewAllHref,
}: {
	titleKey: string;
	titleDefault: string;
	viewAllHref?: string;
}) {
	const { t } = useTranslation();

	return (
		<div className="mb-2.5 flex items-baseline justify-between gap-4 md:mb-5">
			<h2 className="font-display text-2xl font-extrabold tracking-tight text-balance md:text-3xl">
				{t(titleKey, titleDefault)}
			</h2>
			{viewAllHref && (
				<Link
					href={viewAllHref}
					className="ring-warm-focus flex shrink-0 items-center gap-1 rounded-md text-sm font-bold text-primary underline-offset-4 hover:underline"
				>
					{t("classic2.viewAll", "সব দেখুন")}
					<ArrowRight className="h-4 w-4" aria-hidden />
				</Link>
			)}
		</div>
	);
}
