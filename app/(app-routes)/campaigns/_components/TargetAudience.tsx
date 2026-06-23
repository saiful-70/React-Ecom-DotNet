import { Card, CardContent } from "@/components/shared/ui/card";
import type { CampaignPersona } from "../_data/types";

interface Props {
	personas: CampaignPersona[];
	title?: string;
	subtitle?: string;
}

export function TargetAudience({
	personas,
	title = "কাদের জন্য?",
	subtitle = "এই পণ্য বিশেষভাবে যাদের জন্য উপযোগী",
}: Props) {
	return (
		<section className="py-12 sm:py-16 lg:py-20">
			<div className="container mx-auto px-4 sm:px-6">
				<div className="text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
					<h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance leading-tight">
						{title}
					</h2>
					<p className="mt-3 text-sm sm:text-base text-muted-foreground">
						{subtitle}
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
					{personas.map((persona, idx) => (
						<Card
							key={persona.title}
							className="relative overflow-hidden border border-border/60 shadow-warm-sm hover:shadow-warm-md transition-shadow"
						>
							<div className="absolute top-0 left-0 right-0 h-1 bg-saffron-gradient" />
							<CardContent className="p-5 sm:p-7">
								<div className="font-display text-3xl sm:text-4xl text-primary/30 leading-none mb-2">
									{(idx + 1).toString().padStart(2, "0")}
								</div>
								<h3 className="font-display text-base sm:text-lg font-semibold tracking-tight mb-2 leading-snug">
									{persona.title}
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{persona.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
