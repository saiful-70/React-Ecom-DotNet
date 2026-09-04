import PaypalReturn from "@/components/pages/PaypalReturnPage";
import { Metadata } from "next";
import { Suspense } from "react";
import { generateMetadata as genMeta } from "@/lib/utils/seo.utils";
import { getBusinessSettings } from "@/components/shared/actions/business-settings";

export async function generateMetadata(): Promise<Metadata> {
	const businessSettings = await getBusinessSettings();

	return genMeta({
		title: "Confirming Payment",
		description: "Completing your PayPal payment.",
		noIndex: true,
		businessSettings,
	});
}

export default function PaypalReturnRoute() {
	return (
		<Suspense fallback={null}>
			<PaypalReturn />
		</Suspense>
	);
}
