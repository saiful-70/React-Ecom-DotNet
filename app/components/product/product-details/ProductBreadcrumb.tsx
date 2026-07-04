"use client";

import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";

interface ProductBreadcrumbProps {
	productName: string;
}

export function ProductBreadcrumb({ productName }: ProductBreadcrumbProps) {
	const { t } = useTranslation();

	return (
		<div className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-3 sm:mb-4 lg:mb-6 overflow-x-auto pb-1">
			<Link href="/" className="hover:text-foreground whitespace-nowrap">
				{t("productDetails.home") || "Home"}
			</Link>
			<span>/</span>
			<Link
				href="/products"
				className="hover:text-foreground whitespace-nowrap"
			>
				{t("productDetails.products") || "Products"}
			</Link>
			<span>/</span>
			<span className="text-foreground truncate max-w-[120px] sm:max-w-none">
				{productName}
			</span>
		</div>
	);
}
