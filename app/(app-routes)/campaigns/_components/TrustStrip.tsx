import { Award, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import type { CampaignTrustBadge } from "../_data/types";

const ICONS: Record<string, LucideIcon> = {
	"shield-check": ShieldCheck,
	award: Award,
	users: Users,
};

interface Props {
	badges: CampaignTrustBadge[];
}

export function TrustStrip({ badges }: Props) {
	return (
		<section className="relative border-y border-border/60 bg-card/60 backdrop-blur">
			<div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
				<div className="grid grid-cols-3 gap-2 sm:gap-6">
					{badges.map((badge) => {
						const Icon = ICONS[badge.icon] ?? ShieldCheck;
						return (
							<div
								key={badge.label}
								className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center sm:text-left"
							>
								<div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-saffron-gradient shadow-warm-sm">
									<Icon
										className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground"
										strokeWidth={2}
									/>
								</div>
								<div>
									<div className="font-display text-sm sm:text-base font-semibold leading-tight">
										{badge.label}
									</div>
									{badge.sublabel ? (
										<div className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
											{badge.sublabel}
										</div>
									) : null}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
