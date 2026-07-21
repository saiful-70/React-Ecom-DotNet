import { Metadata } from "next";
import {
	generateMetadata as genMeta,
	generateOrganizationSchema,
	generateWebsiteSchema,
	renderStructuredData,
} from "@/lib/utils/seo.utils";
import { getBusinessSettings } from "@/components/shared/actions/business-settings";
import {
	getBanners,
	getFeaturedCategories,
} from "@/components/home/actions/home-sections";
import { getActiveVariant } from "@/variants/server";
import { getTemplate } from "@/templates/registry";

export async function generateMetadata(): Promise<Metadata> {
	const businessSettings = await getBusinessSettings();

	return genMeta({
		title: "Home",
		description:
			"Discover amazing products at unbeatable prices. Shop the latest trends in electronics, fashion, home & garden, and more.",
		keywords: [
			"ecommerce",
			"shopping",
			"electronics",
			"fashion",
			"home",
			"garden",
			"online store",
		],
		businessSettings,
	});
}

export default async function HomePage() {
	// Generate structured data for homepage
	const organizationSchema = generateOrganizationSchema();
	const websiteSchema = generateWebsiteSchema();

	// Hero + featured-category content is server-rendered for SEO/LCP.
	const [banners, featuredCategories] = await Promise.all([
		getBanners(),
		getFeaturedCategories(),
	]);

	const variant = await getActiveVariant();
	const template = getTemplate(variant.template);

	return (
		<>
			{renderStructuredData(organizationSchema)}
			{renderStructuredData(websiteSchema)}
			<template.HomeLayout
				banners={banners}
				featuredCategories={featuredCategories}
				features={variant.features}
			/>
		</>
	);
}
