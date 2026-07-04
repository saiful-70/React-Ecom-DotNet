"use client";

import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OrderDetailsModel } from "../model";
import OrderHeader from "./components/OrderHeader";
import ProductList from "./components/ProductList";
import OrderSummaryCard from "./components/OrderSummaryCard";
import OrderTimeline from "./components/OrderTimeline";
import OrderInfoCards from "./components/OrderInfoCards";
import { Button } from "@/components/shared/ui/button";
import { Card } from "@/components/shared/ui/card";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";

type Props = {
	orderDetails: OrderDetailsModel;
};

export default function OrderDetails({ orderDetails }: Props) {
	const { t } = useTranslation();

	return (
		<main className="container mx-auto px-4 py-8">
			{/* Breadcrumb */}
			<div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
				<Link href="/" className="hover:text-foreground">
					{t("orderDetails.breadcrumb.home")}
				</Link>
				<span>/</span>
				<Link
					href={ABSOLUTE_ROUTES.ORDERS}
					className="hover:text-foreground"
				>
					{t("orderDetails.breadcrumb.myOrder")}
				</Link>
				<span>/</span>
				<span className="text-foreground">
					{t("orderDetails.breadcrumb.orderDetails")}
				</span>
			</div>

			{/* Back Button */}
			<Link href={ABSOLUTE_ROUTES.ORDERS}>
				<Button variant="ghost" className="mb-6 -ml-4">
					<ArrowLeft className="mr-2 h-4 w-4" />
					{t("orderDetails.backToOrders")}
				</Button>
			</Link>

			{/* Header */}
			<OrderHeader orderDetails={orderDetails} />

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Left Column - Order Items */}
				<Card className="lg:col-span-2 space-y-6">
					<ProductList orderDetails={orderDetails} />
					<OrderSummaryCard orderDetails={orderDetails} />
				</Card>

				{/* Right Column - Order Info */}
				<div className="space-y-6">
					<OrderTimeline orderDetails={orderDetails} />
					<OrderInfoCards orderDetails={orderDetails} />
				</div>
			</div>
		</main>
	);
}
