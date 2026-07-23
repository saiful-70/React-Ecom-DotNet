import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductDetails, getProductBundle } from "../action";
import { getBusinessSettings } from "@/components/shared/actions/business-settings";
import {
	generateProductMetadata,
	generateProductSchema,
	generateBreadcrumbSchema,
	renderStructuredData,
} from "@/lib/utils/seo.utils";
import { getActiveVariant } from "@/variants/server";
import { getTemplate } from "@/templates/registry";

interface Props {
	params: Promise<{ id: number }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const resolvedParams = await params;
	const response = await getProductDetails(resolvedParams.id);
	const businessSettings = await getBusinessSettings();

	if (!response.success || !response.data?.product) {
		return {
			title: `Product Not Found | ${businessSettings.site_name}`,
			description: "The product you're looking for could not be found.",
		};
	}

	const product = response.data.product;

	return generateProductMetadata({
		name: product.name,
		description:
			product.description || `Buy ${product.name} at the best price`,
		price: product.discounted_price,
		currency: "BDT",
		image:
			product.thumbnail_image ||
			product.gallery_images?.[0] ||
			"/og-product.jpg",
		slug: product.slug || String(product.id),
		brand: product.brand,
		category: product.category?.name,
		inStock: product.stock > 0,
		rating: product.average_rating,
		reviewCount: product.total_reviews,
		businessSettings,
	});
}

export default async function ProductDetailsPage({ params }: Props) {
	const resolvedParams = await params;
	const response = await getProductDetails(resolvedParams.id);

	if (!response.success || !response.data?.product) {
		notFound();
	}

	const product = response.data.product;

	// Generate structured data for SEO
	const productSchema = generateProductSchema({
		id: product.id,
		name: product.name,
		description: product.description || `Buy ${product.name} online`,
		image:
			product.thumbnail_image ||
			product.gallery_images?.[0] ||
			"/og-product.jpg",
		sku: product.sku || String(product.id),
		brand: product.brand,
		price: product.discounted_price,
		currency: "BDT",
		availability: product.stock > 0 ? "InStock" : "OutOfStock",
		rating: product.average_rating,
		reviewCount: product.total_reviews,
		url: `/products/${product.id}`,
	});

	const breadcrumbSchema = generateBreadcrumbSchema([
		{ name: "Home", url: "/" },
		{ name: "Products", url: "/products" },
		{
			name: product.category?.name || "Category",
			url: `/products?category=${product.category?.id || ""}`,
		},
		{
			name: product.name,
			url: `/products/${product.slug || product.id}`,
		},
	]);

	const variant = await getActiveVariant();
	const template = getTemplate(variant.template);

	// Bundle offers are gated by the `bundles` feature flag.
	const bundle = variant.features.bundles
		? await getProductBundle(product.id)
		: null;

	return (
		<>
			{renderStructuredData(productSchema)}
			{renderStructuredData(breadcrumbSchema)}
			<template.ProductDetailsLayout product={product} bundle={bundle} />
		</>
	);
}
