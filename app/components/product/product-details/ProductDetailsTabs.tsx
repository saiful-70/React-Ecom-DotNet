"use client";

import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/shared/ui/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/shared/ui/tabs";
import { ProductReviews } from "./ProductReviews";
import { useFeature } from "@/components/shared/providers/variant-provider";
import type { Product } from "@/(app-routes)/products/model";

interface ProductTabsProps {
	product: Product;
}

export function ProductDetailsTabs({ product }: ProductTabsProps) {
	const { t } = useTranslation();
	const showReviews = useFeature("reviews");

	return (
		<Card className="border-border">
			<CardContent className="p-3 sm:p-4 lg:p-6">
				<Tabs defaultValue="description" className="w-full">
					<TabsList
						className={`grid w-full h-8 sm:h-9 lg:h-10 ${
							showReviews ? "grid-cols-3" : "grid-cols-2"
						}`}
					>
						<TabsTrigger
							value="description"
							className="text-[11px] sm:text-xs lg:text-sm"
						>
							{t("productDetails.description") || "Description"}
						</TabsTrigger>
						<TabsTrigger
							value="specifications"
							className="text-[11px] sm:text-xs lg:text-sm"
						>
							{t("productDetails.specifications") ||
								"Specifications"}
						</TabsTrigger>
						{showReviews && (
							<TabsTrigger
								value="reviews"
								className="text-[11px] sm:text-xs lg:text-sm"
							>
								{t("productDetails.reviews") || "Reviews"}
							</TabsTrigger>
						)}
					</TabsList>

					<TabsContent
						value="description"
						className="mt-3 sm:mt-4 lg:mt-6"
					>
						<div className="space-y-3 sm:space-y-4">
							{product.description ? (
								<div
									className="prose prose-sm sm:prose max-w-none text-muted-foreground text-xs sm:text-sm [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm"
									dangerouslySetInnerHTML={{
										__html: product.description,
									}}
								/>
							) : (
								<h4 className="text-sm sm:text-base">
									{t("productDetails.noDescription") ||
										"No Description Available"}
								</h4>
							)}
						</div>
					</TabsContent>

					<TabsContent
						value="specifications"
						className="mt-3 sm:mt-4 lg:mt-6"
					>
						<div className="space-y-2">
							<h4 className="text-sm sm:text-base mb-3">
								{t("productDetails.noSpecifications") ||
									"No Specifications Available"}
							</h4>
						</div>
					</TabsContent>

					{showReviews && (
						<TabsContent
							value="reviews"
							className="mt-3 sm:mt-4 lg:mt-6"
						>
							<ProductReviews
								averageRating={product.average_rating}
								totalReviews={product.total_reviews}
								ratingCounts={product.rating_counts}
								reviews={product.reviews}
							/>
						</TabsContent>
					)}
				</Tabs>
			</CardContent>
		</Card>
	);
}
