"use client";

import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import "../bazar.css";

/** Centered board-black key under a product band. */
export function BazarShowMore({ href }: { href: string }) {
	const { t } = useTranslation();
	return (
		<div className="mt-8 flex justify-center">
			<Link
				href={href}
				className="bz-key ring-warm-focus inline-flex min-h-12 items-center gap-1.5 rounded-lg bg-secondary px-8 text-sm font-bold text-secondary-foreground shadow-warm-sm"
			>
				{t("bazar.showMore")}
				<ChevronRight className="h-4 w-4" aria-hidden="true" />
			</Link>
		</div>
	);
}
