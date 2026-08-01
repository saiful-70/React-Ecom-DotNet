import { CheckoutPage } from "@/components/pages/CheckoutPage";
import { Metadata } from "next";
import { Suspense } from "react";
import { generateMetadata as genMeta } from "@/lib/utils/seo.utils";
import { getBusinessSettings } from "@/components/shared/actions/business-settings";

export async function generateMetadata(): Promise<Metadata> {
	const businessSettings = await getBusinessSettings();

	return genMeta({
		title: "Checkout",
		description: "Complete your purchase securely.",
		noIndex: true,
		businessSettings,
	});
}

export default async function Checkout() {
	return (
		<div className="min-h-screen bg-background">
			<Suspense fallback={null}>
				<CheckoutPage />
			</Suspense>
		</div>
	);
}
