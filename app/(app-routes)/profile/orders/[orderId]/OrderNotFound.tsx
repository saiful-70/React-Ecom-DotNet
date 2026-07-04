"use client";

import { Button } from "@/components/shared/ui/button";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { useTranslation } from "react-i18next";
import { ArrowLeft, FileX } from "lucide-react";

export default function OrderNotFound() {
	const { t } = useTranslation();

	return (
		<main className="container mx-auto px-4 py-8">
			{/* Breadcrumb */}
			<div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
				<Link href="/" className="hover:text-foreground">
					{t("orderDetails.breadcrumb.home") || "Home"}
				</Link>
				<span>/</span>
				<Link href="/profile" className="hover:text-foreground">
					{t("orderDetails.breadcrumb.myOrder") || "My Order"}
				</Link>
				<span>/</span>
				<span className="text-foreground">
					{t("orderDetails.breadcrumb.orderDetails") ||
						"Order Details"}
				</span>
			</div>

			{/* Back Button */}
			<Link href="/profile?tab=orders">
				<Button variant="ghost" className="mb-6 -ml-4">
					<ArrowLeft className="mr-2 h-4 w-4" />
					{t("orderDetails.backToOrders") || "Back to Orders"}
				</Button>
			</Link>

			{/* Not Found Content */}
			<div className="text-center py-12">
				<div className="flex justify-center mb-6">
					<div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
						<FileX className="h-12 w-12 text-muted-foreground" />
					</div>
				</div>

				<h1 className="text-3xl font-bold mb-4">
					{t("orderDetails.notFound") || "Order Not Found"}
				</h1>

				<p className="text-muted-foreground mb-8 max-w-md mx-auto">
					{t("orderDetails.notFoundDescription") ||
						"The order you're looking for doesn't exist or you don't have access to it."}
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<Button asChild>
						<Link href="/profile?tab=orders">
							{t("orderDetails.backToOrders") || "Back to Orders"}
						</Link>
					</Button>

					<Button variant="outline" asChild>
						<Link href="/products">
							{t("orderDetails.continueShopping") ||
								"Continue Shopping"}
						</Link>
					</Button>
				</div>

				{/* Additional Help */}
				<div className="mt-12 p-6 bg-muted/50 rounded-lg max-w-lg mx-auto">
					<h3 className="font-semibold mb-2">
						{t("orderDetails.needHelp") || "Need Help?"}
					</h3>
					<p className="text-sm text-muted-foreground mb-4">
						{t("orderDetails.contactSupport") ||
							"If you believe this is an error, please contact our support team."}
					</p>
					<Button variant="outline" size="sm">
						{t("orderDetails.contactUs") || "Contact Support"}
					</Button>
				</div>
			</div>
		</main>
	);
}
