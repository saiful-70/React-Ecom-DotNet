"use client";

import Image from "next/image";
import { Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import Price from "@/components/shared/Price";
import type { CampaignConfig } from "../_data/types";

interface Props {
	campaign: CampaignConfig;
}

export function OfferBlock({ campaign }: Props) {
	const { product, bonuses = [], offerLimitedNote } = campaign;
	const bonusTotal = bonuses.reduce((sum, b) => sum + b.value, 0);
	const totalValue = product.originalPrice + bonusTotal;
	const savings = totalValue - product.offerPrice;
	const discountPercent = Math.round(
		((product.originalPrice - product.offerPrice) / product.originalPrice) *
			100
	);

	const scrollToOrder = () => {
		document
			.getElementById("campaign-order")
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	return (
		<section className="py-12 sm:py-16 lg:py-20">
			<div className="container mx-auto px-4 sm:px-6 max-w-4xl">
				<div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-primary/20 shadow-warm-lg bg-card">
					<div className="absolute top-0 left-0 right-0 h-1.5 bg-saffron-gradient" />

					{/* Limited time badge */}
					{offerLimitedNote ? (
						<div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
							<div className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
								<Sparkles className="h-3 w-3" />
								{offerLimitedNote}
							</div>
						</div>
					) : null}

					<div className="grid md:grid-cols-2 gap-6 sm:gap-8 p-5 sm:p-8 lg:p-10 pt-14 sm:pt-16">
						<div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
							<Image
								src={product.image}
								alt={product.name}
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, 50vw"
							/>
							<div className="absolute top-3 right-3 bg-saffron-gradient text-accent-foreground rounded-full h-16 w-16 sm:h-20 sm:w-20 flex flex-col items-center justify-center shadow-warm-md rotate-6 border-2 border-background">
								<span className="font-display text-base sm:text-lg font-bold leading-none">
									{discountPercent}%
								</span>
								<span className="text-[10px] font-medium leading-none mt-0.5">
									ছাড়
								</span>
							</div>
						</div>

						<div className="flex flex-col justify-center">
							<h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight leading-tight">
								{product.name}
							</h3>
							{product.tagline ? (
								<p className="text-sm sm:text-base text-muted-foreground mt-1">
									{product.tagline}
								</p>
							) : null}

							<div className="my-5 space-y-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3 sm:p-4">
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">পণ্যের মূল্য</span>
									<span className="line-through text-muted-foreground">
										<Price amount={product.originalPrice} />
									</span>
								</div>
								{bonuses.map((b) => (
									<div
										key={b.name}
										className="flex items-center justify-between text-sm"
									>
										<span className="flex items-center gap-1.5 text-success">
											<Gift className="h-3.5 w-3.5" />
											{b.name}
										</span>
										<span className="text-muted-foreground">
											+ <Price amount={b.value} />
										</span>
									</div>
								))}
								<div className="flex items-center justify-between border-t border-primary/15 pt-2 text-sm font-medium">
									<span>মোট মূল্য</span>
									<span className="line-through text-muted-foreground">
										<Price amount={totalValue} />
									</span>
								</div>
							</div>

							<div className="flex items-baseline gap-3 flex-wrap">
								<span className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground">
									আজকের অফার মূল্য
								</span>
							</div>
							<div className="flex items-baseline gap-3 mt-1">
								<span className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary leading-none">
									<Price amount={product.offerPrice} />
								</span>
								<span className="text-sm sm:text-base text-success font-semibold">
									সাশ্রয় <Price amount={savings} />
								</span>
							</div>

							<Button
								size="lg"
								className="mt-5 h-12 sm:h-14 text-sm sm:text-base font-semibold shadow-warm-md hover:shadow-warm-lg"
								onClick={scrollToOrder}
							>
								অর্ডার করুন — ক্যাশ অন ডেলিভারি
							</Button>
							<p className="mt-2 text-center text-xs text-muted-foreground">
								পণ্য হাতে পেয়ে টাকা দিন · দেশজুড়ে ডেলিভারি
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
