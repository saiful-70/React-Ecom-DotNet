import { CartPage } from "@/components/pages/CartPage";
import { Metadata } from "next";
import { Suspense } from "react";
import { generateMetadata as genMeta } from "@/lib/utils/seo.utils";
import { getBusinessSettings } from "@/components/shared/actions/business-settings";

export async function generateMetadata(): Promise<Metadata> {
	const businessSettings = await getBusinessSettings();

	return genMeta({
		title: "Shopping Cart",
		description: "Review your selected items and proceed to checkout.",
		noIndex: true,
		businessSettings,
	});
}

export default async function Cart() {
	return (
		<div className=" bg-background">
			<Suspense fallback={null}>
				<CartPage />
			</Suspense>
		</div>
	);
}
