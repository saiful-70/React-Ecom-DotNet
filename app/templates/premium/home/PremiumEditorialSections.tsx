"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { cn } from "@/lib/utils/utils";
import type { Banner } from "@/components/home/_data/types";
import "../premium.css";

/**
 * Editorial pacing between the hero and the collection grid: alternating
 * image + copy sections built from the backend's banner data (title,
 * subtitle, CTA — all backend-authored; nothing invented). Renders nothing
 * when there are no active banners.
 */
export function PremiumEditorialSections({ banners }: { banners: Banner[] }) {
	const { t } = useTranslation();
	const active = banners.filter(
		(banner) => banner.status === "active" && banner.image_url
	);

	if (active.length === 0) return null;

	return (
		<div className="space-y-20 lg:space-y-28">
			{active.slice(0, 3).map((banner, index) => {
				const reversed = index % 2 === 1;
				return (
					<section key={banner.id} className="container mx-auto">
						<div
							className={cn(
								"grid items-center gap-8 lg:grid-cols-12 lg:gap-12",
								reversed && "lg:[direction:rtl]"
							)}
						>
							<div className="premium-corners relative aspect-[4/3] overflow-hidden bg-muted lg:col-span-7 lg:[direction:ltr]">
								<Image
									src={banner.image_url}
									alt={banner.title || ""}
									fill
									sizes="(max-width: 1024px) 100vw, 55vw"
									className="object-cover"
								/>
							</div>
							<div className="lg:col-span-5 lg:[direction:ltr]">
								<h2 className="font-display text-3xl leading-tight tracking-tight md:text-5xl">
									{banner.title}
								</h2>
								{banner.subtitle && (
									<p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
										{banner.subtitle}
									</p>
								)}
								{banner.cta_url && (
									<Link
										href={banner.cta_url}
										className="ring-warm-focus mt-6 inline-block border-b border-border pb-1 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary"
									>
										{banner.cta_label ||
											t("premium.discover", "Discover")}
									</Link>
								)}
							</div>
						</div>
					</section>
				);
			})}
		</div>
	);
}
