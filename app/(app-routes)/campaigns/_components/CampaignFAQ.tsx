import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/shared/ui/accordion";
import type { CampaignFAQ } from "../_data/types";

interface Props {
	faqs: CampaignFAQ[];
}

export function CampaignFAQ({ faqs }: Props) {
	return (
		<section className="py-12 sm:py-16 lg:py-20 bg-muted/40">
			<div className="container mx-auto px-4 sm:px-6 max-w-3xl">
				<div className="text-center mb-8 sm:mb-10">
					<h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance leading-tight">
						সাধারণ জিজ্ঞাসা
					</h2>
					<p className="mt-3 text-sm sm:text-base text-muted-foreground">
						আপনার মনে আসা প্রশ্নের উত্তর এখানে পাবেন
					</p>
				</div>

				<Accordion type="single" collapsible className="space-y-3">
					{faqs.map((faq, i) => (
						<AccordionItem
							key={faq.question}
							value={`faq-${i}`}
							className="border border-border/60 rounded-xl bg-card shadow-warm-sm px-4 sm:px-5"
						>
							<AccordionTrigger className="font-display text-sm sm:text-base font-semibold text-left hover:no-underline py-4">
								{faq.question}
							</AccordionTrigger>
							<AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
								{faq.answer}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
}
