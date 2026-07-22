import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCombo } from "../action";
import { getActiveVariant } from "@/variants/server";
import { ComboLanding } from "@/components/product/bundle/ComboLanding";

interface Props {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const combo = await getCombo(slug);

	if (!combo) {
		return { title: "Combo Not Found | কম্বো পাওয়া যায়নি" };
	}

	return {
		title: `${combo.title} | Combo Offer`,
		description: combo.description || combo.title,
	};
}

export default async function ComboPage({ params }: Props) {
	const { slug } = await params;

	const variant = await getActiveVariant();
	if (!variant.features.bundles) {
		notFound();
	}

	const combo = await getCombo(slug);
	if (!combo || combo.tiers.length === 0) {
		notFound();
	}

	return <ComboLanding combo={combo} />;
}
