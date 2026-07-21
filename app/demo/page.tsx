import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { DEMO_PREFIX, SHOWCASE_MODE } from "@/lib/config/variant.config";
import { listVariants } from "@/variants/registry";
import type { Market, VariantDescriptor } from "@/variants/types";

export const metadata: Metadata = {
	title: "Demo Gallery",
	description: "Browse the available storefront demos.",
	robots: { index: false, follow: false },
};

const MARKETS: { key: Market; label: string; blurb: string }[] = [
	{
		key: "intl",
		label: "International",
		blurb: "English-first storefront demos for global markets.",
	},
	{
		key: "bn",
		label: "Bengali",
		blurb: "Bengali-first storefront demos for the Bangladesh market.",
	},
];

// Fallback preview colors = the globals.css defaults (used by variants, like
// bn-01, that carry no theme overrides).
const DEFAULT_PREVIEW = {
	primary: "142 56% 30%",
	accent: "128 50% 42%",
	background: "140 30% 97%",
};

function previewColors(variant: VariantDescriptor) {
	const root = variant.theme.root ?? {};
	return {
		primary: root.primary ?? DEFAULT_PREVIEW.primary,
		accent: root.accent ?? DEFAULT_PREVIEW.accent,
		background: root.background ?? DEFAULT_PREVIEW.background,
	};
}

export default function DemoGalleryPage() {
	// The gallery only exists in showcase deployments.
	if (!SHOWCASE_MODE) notFound();

	return (
		<main className="container mx-auto px-4 py-12">
			<header className="mx-auto max-w-2xl text-center">
				<Badge variant="secondary" className="mb-3">
					Demo showcase
				</Badge>
				<h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
					Storefront demos
				</h1>
				<p className="mt-3 text-muted-foreground">
					Explore each demo live. Every card opens a fully interactive
					storefront — the same codebase, a different variant.
				</p>
			</header>

			<div className="mt-12 space-y-14">
				{MARKETS.map((market) => {
					const variants = listVariants(market.key);
					if (variants.length === 0) return null;
					return (
						<section key={market.key}>
							<div className="mb-5">
								<h2 className="font-display text-xl font-semibold">
									{market.label}
								</h2>
								<p className="text-sm text-muted-foreground">
									{market.blurb}
								</p>
							</div>
							<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{variants.map((variant) => {
									const c = previewColors(variant);
									return (
										<a
											key={variant.id}
											href={`${DEMO_PREFIX}/${variant.id}`}
											className="group focus-visible:outline-none"
										>
											<Card className="h-full overflow-hidden transition-shadow group-hover:shadow-warm-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
												{/* Theme preview strip */}
												<div
													className="flex h-24 items-end gap-2 p-3"
													style={{
														background: `hsl(${c.background})`,
													}}
												>
													<span
														className="h-10 w-10 rounded-lg shadow-sm"
														style={{
															background: `hsl(${c.primary})`,
														}}
													/>
													<span
														className="h-10 w-10 rounded-lg shadow-sm"
														style={{
															background: `hsl(${c.accent})`,
														}}
													/>
												</div>
												<CardHeader>
													<div className="flex items-center justify-between gap-2">
														<CardTitle className="text-base">
															{variant.name}
														</CardTitle>
														<Badge variant="outline">
															{variant.id}
														</Badge>
													</div>
													<CardDescription>
														{variant.description}
													</CardDescription>
												</CardHeader>
												<CardContent>
													<span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
														Open demo
														<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
													</span>
												</CardContent>
											</Card>
										</a>
									);
								})}
							</div>
						</section>
					);
				})}
			</div>
		</main>
	);
}
