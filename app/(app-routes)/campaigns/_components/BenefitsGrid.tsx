import {
	Heart,
	Leaf,
	Shield,
	Sparkles,
	ThumbsUp,
	Truck,
	type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/shared/ui/card";
import type { CampaignBenefit } from "../_data/types";

const ICONS: Record<string, LucideIcon> = {
	leaf: Leaf,
	heart: Heart,
	sparkles: Sparkles,
	shield: Shield,
	"thumbs-up": ThumbsUp,
	truck: Truck,
};

interface Props {
	benefits: CampaignBenefit[];
	title?: string;
	subtitle?: string;
}

export function BenefitsGrid({
	benefits,
	title = "কেন আমাদের পণ্য বেছে নেবেন?",
	subtitle = "প্রতিটি প্যাকে আপনি পাবেন এই সুবিধাগুলো",
}: Props) {
	return (
		<section className="relative py-12 sm:py-16 lg:py-20 bg-muted/40 overflow-hidden">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-[0.04]"
				style={{
					backgroundImage:
						"linear-gradient(135deg, hsl(var(--primary)) 25%, transparent 25%, transparent 50%, hsl(var(--primary)) 50%, hsl(var(--primary)) 75%, transparent 75%)",
					backgroundSize: "32px 32px",
				}}
			/>
			<div className="relative container mx-auto px-4 sm:px-6">
				<div className="text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
					<h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance leading-tight">
						{title}
					</h2>
					<p className="mt-3 text-sm sm:text-base text-muted-foreground">
						{subtitle}
					</p>
				</div>

				<div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
					{benefits.map((benefit) => {
						const Icon = ICONS[benefit.icon] ?? Sparkles;
						return (
							<Card
								key={benefit.title}
								className="group border border-border/60 shadow-warm-sm bg-card/80 backdrop-blur hover:shadow-warm-md hover:-translate-y-1 hover:border-primary/30 transition-all duration-300"
							>
								<CardContent className="p-4 sm:p-6">
									<div className="relative mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14">
										<div className="absolute inset-0 bg-saffron-gradient rounded-xl sm:rounded-2xl opacity-90 -rotate-3 group-hover:-rotate-6 transition-transform" />
										<div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center bg-card/40">
											<Icon
												className="h-6 w-6 sm:h-7 sm:w-7 text-primary"
												strokeWidth={1.75}
											/>
										</div>
									</div>
									<h3 className="font-display text-sm sm:text-base lg:text-lg font-semibold mb-1 tracking-tight leading-snug">
										{benefit.title}
									</h3>
									{benefit.description ? (
										<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
											{benefit.description}
										</p>
									) : null}
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>
		</section>
	);
}
