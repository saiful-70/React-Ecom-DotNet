import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/shared/ui/card";
import type { CampaignTestimonial } from "../_data/types";

interface Props {
	testimonials: CampaignTestimonial[];
	averageRating: number;
	totalReviews: number;
}

export function TestimonialsGrid({
	testimonials,
	averageRating,
	totalReviews,
}: Props) {
	return (
		<section className="py-12 sm:py-16 lg:py-20 bg-muted/40">
			<div className="container mx-auto px-4 sm:px-6">
				<div className="text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
					<div className="flex items-center justify-center gap-2 mb-3">
						<div className="flex items-center">
							{[...Array(5)].map((_, i) => (
								<Star
									key={i}
									className={
										i < Math.floor(averageRating)
											? "h-5 w-5 sm:h-6 sm:w-6 fill-accent text-accent"
											: "h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground"
									}
								/>
							))}
						</div>
						<span className="font-display text-lg sm:text-xl font-semibold">
							{averageRating.toFixed(1)}
						</span>
						<span className="text-sm text-muted-foreground">
							/ {totalReviews.toLocaleString("bn-BD")}+ রিভিউ
						</span>
					</div>
					<h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance leading-tight">
						গ্রাহকদের অভিজ্ঞতা
					</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
					{testimonials.map((t) => (
						<Card
							key={t.name + t.review}
							className="border border-border/60 shadow-warm-sm bg-card"
						>
							<CardContent className="p-4 sm:p-5">
								<div className="flex items-center gap-0.5 mb-2">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className={
												i < t.rating
													? "h-3.5 w-3.5 fill-accent text-accent"
													: "h-3.5 w-3.5 text-muted-foreground"
											}
										/>
									))}
								</div>
								<p className="text-sm leading-relaxed mb-3">
									&ldquo;{t.review}&rdquo;
								</p>
								<div className="flex items-center gap-2 pt-2 border-t border-border/50">
									<div className="h-8 w-8 rounded-full bg-saffron-gradient flex items-center justify-center text-accent-foreground font-semibold text-xs shrink-0">
										{t.name.charAt(0)}
									</div>
									<div className="min-w-0">
										<div className="font-medium text-sm truncate">
											{t.name}
										</div>
										{t.location ? (
											<div className="text-[10px] text-muted-foreground truncate">
												{t.location}
											</div>
										) : null}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
