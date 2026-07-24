import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCombo } from "../action";
import { getActiveVariant } from "@/variants/server";
import { ComboLanding } from "@/components/product/bundle/ComboLanding";
import { isValidComboSlug } from "@/lib/bundles/types";

interface Props {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;

	if (!isValidComboSlug(slug)) {
		return { title: "Combo Not Found | কম্বো পাওয়া যায়নি" };
	}

	const variant = await getActiveVariant();
	if (!variant.features.bundles) {
		return { title: "Combo Not Found | কম্বো পাওয়া যায়নি" };
	}

	const combo = await getCombo(slug);

	if (combo === "error") {
		// Backend outage - keep metadata minimal; the page component throws
		// and lets the nearest error boundary render.
		return { title: "Combo | কম্বো" };
	}

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

	if (!isValidComboSlug(slug)) {
		notFound();
	}

	const variant = await getActiveVariant();
	if (!variant.features.bundles) {
		notFound();
	}

	const combo = await getCombo(slug);
	if (combo === "error") {
		// Backend request failed (network/5xx) - an outage, not a missing
		// combo. Throw so the nearest error.tsx boundary renders instead of
		// serving a false 404.
		throw new Error("combo fetch failed");
	}
	if (!combo || combo.tiers.length === 0) {
		notFound();
	}

	return <ComboLanding combo={combo} />;
}
