"use client";

import Image from "next/image";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import type { CampaignConfig } from "../_data/types";

interface Props {
	campaign: CampaignConfig;
}

export function CampaignHero({ campaign }: Props) {
	const scrollToOrder = () => {
		document
			.getElementById("campaign-order")
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	return (
		<section className="relative overflow-hidden bg-warm-gradient">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-[0.06]"
				style={{
					backgroundImage:
						"radial-gradient(hsl(var(--primary)) 1px, transparent 1px)",
					backgroundSize: "28px 28px",
				}}
			/>
			<div className="pointer-events-none absolute top-0 right-0 w-72 sm:w-[26rem] h-72 sm:h-[26rem] bg-accent/20 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />

			<div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-20">
				<div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-14 items-center">
					<div className="space-y-5 sm:space-y-6 order-2 lg:order-1 text-center lg:text-left">
						<div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-primary">
							<span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
							{campaign.brand}
						</div>

						<h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-[1.15] tracking-tight text-balance">
							{campaign.headline}
						</h1>

						<p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
							{campaign.subheadline}
						</p>

						<ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-left max-w-xl mx-auto lg:mx-0">
							{campaign.heroBullets.map((bullet) => (
								<li
									key={bullet}
									className="flex items-start gap-2 text-sm sm:text-base"
								>
									<span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
										<Check className="h-3 w-3" strokeWidth={3} />
									</span>
									<span>{bullet}</span>
								</li>
							))}
						</ul>

						<div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center lg:justify-start pt-2">
							<Button
								size="lg"
								className="text-sm sm:text-base px-6 sm:px-8 h-12 shadow-warm-md hover:shadow-warm-lg transition-shadow font-semibold"
								onClick={scrollToOrder}
							>
								<ShoppingBag className="mr-2 h-5 w-5" />
								এখনই অর্ডার করুন
							</Button>
							<div className="flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm text-muted-foreground">
								<span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
								ক্যাশ অন ডেলিভারি — পণ্য পেয়ে টাকা দিন
							</div>
						</div>
					</div>

					<div className="relative mx-auto w-full max-w-md lg:max-w-none order-1 lg:order-2">
						<div className="pointer-events-none absolute -inset-3 sm:-inset-4 rounded-[2rem] bg-saffron-gradient opacity-25 blur-2xl" />
						<div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem] shadow-warm-lg border border-primary/15">
							<Image
								src={campaign.heroImage}
								alt={campaign.headline}
								width={1200}
								height={900}
								className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover"
								priority
							/>
						</div>

						{/* Discount badge floating on hero image */}
						<div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-10 rotate-6">
							<div className="bg-saffron-gradient text-accent-foreground rounded-full h-20 w-20 sm:h-24 sm:w-24 flex flex-col items-center justify-center shadow-warm-lg border-2 border-background">
								<span className="font-display text-lg sm:text-xl font-bold leading-none">
									{Math.round(
										((campaign.product.originalPrice -
											campaign.product.offerPrice) /
											campaign.product.originalPrice) *
											100
									)}
									%
								</span>
								<span className="text-[10px] sm:text-xs font-medium leading-none mt-0.5">
									ছাড়
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
