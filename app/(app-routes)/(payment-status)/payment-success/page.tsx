import { PaymentSuccess } from "@/components/pages/PaymentSuccessPage";
import { Metadata } from "next";
import { generateMetadata as genMeta } from "@/lib/utils/seo.utils";
import { getBusinessSettings } from "@/components/shared/actions/business-settings";

export async function generateMetadata(): Promise<Metadata> {
	const businessSettings = await getBusinessSettings();

	return genMeta({
		title: "Payment Success",
		description: "Your payment was successful. Thank you for your order!",
		noIndex: true,
		businessSettings,
	});
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function PaymentSuccessPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const params = await searchParams;
	const order_id = params.order_id;
	const order_tracking_no = params.order_tracking_no;

	return (
		<PaymentSuccess
			orderId={order_id}
			orderTrackingNo={order_tracking_no}
			sessionId={params.session_id}
		/>
	);
}
