"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import Price from "@/components/shared/Price";
import { OrderDetailsModel, OrderItem } from "@/(app-routes)/profile/orders/model";
import { Separator } from "@radix-ui/react-separator";
import { CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils/utils";
import ReviewDialog from "./ReviewDialog";

type Props = { orderDetails: OrderDetailsModel };

export default function ProductList({ orderDetails }: Props) {
	const { t } = useTranslation();
	const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<{
		id: number;
		name: string;
	} | null>(null);

	const orders =
		orderDetails && orderDetails.products
			? orderDetails.products.filter(
				(item: OrderItem | null): item is OrderItem => item !== null
			)
			: [];

	const isDelivered =
		orderDetails?.order_status === "delivered";

	const handleReviewClick = (productId: number, productName: string) => {
		setSelectedProduct({ id: productId, name: productName });
		setReviewDialogOpen(true);
	};

	return (
		<>
			<CardContent className={cn("pt-4 ")}>
				<ul>
					{orders.length > 0 ? (
						orders.map((item: OrderItem, i) => {
							const variantCombination = item.variant
								? item.variant.combination.join(" - ")
								: null;

							return (
								<li
									key={item.id + i}
									className={cn({
										"space-y-4": orders.length > 1,
									})}
								>
									<div className="flex gap-4">
										<div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
											<Image
												src={item.product.thumbnail_image}
												alt={item.product.name}
												fill
												className="object-cover"
											/>
										</div>
										<div className="flex-1 min-w-0">
											<h4 className="font-medium line-clamp-2 ">
												{item.product.name}
												{variantCombination && (
													<span className="text-muted-foreground">
														-{variantCombination}
													</span>
												)}
											</h4>
											<p className="text-sm text-muted-foreground">
												{t("orderDetails.sku") || "SKU:"}{" "}
												{item.product.sku}
											</p>
											<p className="text-sm">
												<Price
													amount={item.price.toFixed(2)}
												/>
											</p>
										</div>
										<div className="text-right flex flex-col justify-between">
											<div>
												<p className="text-sm text-muted-foreground">
													{t("orderDetails.qty")}:{" "}
													{item.quantity}
												</p>
												<p className="font-semibold">
													<Price
														amount={item.subtotal.toFixed(
															2
														)}
													/>
												</p>
											</div>
											{isDelivered && (
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														handleReviewClick(
															item.product.id,
															item.product.name
														)
													}
												>
													{t("review.addReview") ||
														"Add Review"}
												</Button>
											)}
										</div>
									</div>
									{item !== orders[orders.length - 1] ? (
										<Separator />
									) : null}
								</li>
							);
						})
					) : (
						<p className="text-center py-8 text-muted-foreground">
							{t("orderDetails.noProducts")}
						</p>
					)}
				</ul>
			</CardContent>

			{selectedProduct && (
				<ReviewDialog
					isOpen={reviewDialogOpen}
					onOpenChange={setReviewDialogOpen}
					productId={selectedProduct.id}
					productName={selectedProduct.name}
				/>
			)}
		</>
	);
}
