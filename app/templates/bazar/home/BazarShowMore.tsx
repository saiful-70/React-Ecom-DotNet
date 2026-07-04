"use client";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";

/** Centered dark pill link under a product section. */
export function BazarShowMore({ href }: { href: string }) {
	const { t } = useTranslation();
	return (
		<div className="mt-8 flex justify-center">
			<Link
				href={href}
				className="rounded-full bg-secondary px-8 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90"
			>
				{t("bazar.showMore")}
			</Link>
		</div>
	);
}
