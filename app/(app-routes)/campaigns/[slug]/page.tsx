import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
	generateMetadata as genMeta,
	renderStructuredData,
	generateBreadcrumbSchema,
} from "@/lib/utils/seo.utils";
import { getCampaign, listCampaignSlugs } from "../_data";
import { CountdownBanner } from "../_components/CountdownBanner";
import { CampaignHero } from "../_components/CampaignHero";
import { TrustStrip } from "../_components/TrustStrip";
import { BenefitsGrid } from "../_components/BenefitsGrid";
import { TargetAudience } from "../_components/TargetAudience";
import { TestimonialsGrid } from "../_components/TestimonialsGrid";
import { OfferBlock } from "../_components/OfferBlock";
import { CampaignFAQ } from "../_components/CampaignFAQ";
import { CampaignOrderForm } from "../_components/CampaignOrderForm";
import { StickyMobileCTA } from "../_components/StickyMobileCTA";

interface RouteParams {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
	return listCampaignSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: RouteParams): Promise<Metadata> {
	const { slug } = await params;
	const campaign = getCampaign(slug);
	if (!campaign) {
		return { title: "Campaign not found" };
	}
	return genMeta({
		title: campaign.seoTitle,
		description: campaign.seoDescription,
		url: `/campaigns/${campaign.slug}`,
		image: campaign.heroImage,
	});
}

export default async function CampaignPage({ params }: RouteParams) {
	const { slug } = await params;
	const campaign = getCampaign(slug);
	if (!campaign) notFound();

	const breadcrumb = generateBreadcrumbSchema([
		{ name: "Home", url: "/" },
		{ name: "Campaign", url: `/campaigns/${campaign.slug}` },
	]);

	return (
		<>
			{renderStructuredData(breadcrumb)}
			<CountdownBanner
				minutes={campaign.countdownMinutes}
				message={campaign.countdownMessage}
			/>
			<main className="pb-24 lg:pb-0">
				<CampaignHero campaign={campaign} />
				<TrustStrip badges={campaign.trustBadges} />
				<BenefitsGrid benefits={campaign.benefits} />
				<TargetAudience personas={campaign.personas} />
				<OfferBlock campaign={campaign} />
				<TestimonialsGrid
					testimonials={campaign.testimonials}
					averageRating={campaign.averageRating}
					totalReviews={campaign.totalReviews}
				/>
				<CampaignFAQ faqs={campaign.faqs} />
				<CampaignOrderForm campaign={campaign} />
			</main>
			<StickyMobileCTA
				offerPrice={campaign.product.offerPrice}
				originalPrice={campaign.product.originalPrice}
			/>
		</>
	);
}
