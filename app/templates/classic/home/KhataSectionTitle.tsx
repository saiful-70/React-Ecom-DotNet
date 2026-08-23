"use client";

import "../classic.css";

import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";

/**
 * A ledger heading: the section name written large in the bookhand over its
 * closing double rule, with the "see the full page" entry on the same line.
 */
export function KhataSectionTitle({
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
		<div className="mb-6">
			<div className="flex items-end justify-between gap-4">
				<h2 className="font-display text-2xl font-bold text-balance md:text-3xl">
					{t(titleKey, titleDefault)}
				</h2>
				{viewAllHref && (
					<Link
						href={viewAllHref}
						className="ring-warm-focus mb-1 flex shrink-0 items-center gap-1 rounded-sm text-sm font-semibold text-accent underline-offset-4 hover:underline"
					>
						{t("classic2.viewAll", "সব দেখুন")}
						<ArrowRight className="h-4 w-4" aria-hidden />
					</Link>
				)}
			</div>
			<div className="khata-rule-double mt-2" aria-hidden />
		</div>
	);
}
