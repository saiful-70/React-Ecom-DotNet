"use client";

import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { Button } from "@/components/shared/ui/button";
import { ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";

export function EmptyCart() {
	const { t } = useTranslation();

	return (
		<main className="container mx-auto px-4 py-16">
			<div className="text-center max-w-md mx-auto">
				<ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
				<h1 className="text-2xl font-bold mb-2">
					{t("cart.empty") || "Your cart is empty"}
				</h1>
				<p className="text-muted-foreground mb-6">
					{t("cart.emptyDescription") ||
						"Looks like you haven't added any items to your cart yet."}
				</p>
				<Button asChild>
					<Link href="/products">
						{t("cart.continueShopping") || "Continue Shopping"}
					</Link>
				</Button>
			</div>
		</main>
	);
}
