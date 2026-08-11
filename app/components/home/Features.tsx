"use client";

import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { useTranslation } from "react-i18next";
import Price from "../shared/Price";
import { useAtomValue } from "jotai";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { SECTION_Y_FEATURE } from "@/lib/ui/rhythm";

export const Features = () => {
	const { t } = useTranslation();

	const features = [
		{
			icon: Truck,
			titleKey: "features.freeShipping.title",
			descriptionKey: "features.freeShipping.description",
			isFreeShipping: true,
		},
		{
			icon: Shield,
			titleKey: "features.securePayment.title",
			descriptionKey: "features.securePayment.description",
		},
		{
			icon: RotateCcw,
			titleKey: "features.easyReturns.title",
			descriptionKey: "features.easyReturns.description",
		},
		{
			icon: Headphones,
			titleKey: "features.support.title",
			descriptionKey: "features.support.description",
		},
	];
	const businessSettings = useAtomValue(businessSettingsAtom);
	// Trust strip closes the page, so it keeps the wider feature band.
	return (
		<section className={`relative ${SECTION_Y_FEATURE} bg-muted/40 overflow-hidden`}>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-[0.05]"
				style={{
					backgroundImage:
						"linear-gradient(135deg, hsl(var(--primary)) 25%, transparent 25%, transparent 50%, hsl(var(--primary)) 50%, hsl(var(--primary)) 75%, transparent 75%)",
					backgroundSize: "32px 32px",
				}}
			/>
			<div className="relative container mx-auto">
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
					{features.map((feature, index) => (
						<Card
							key={index}
							className="group relative text-center border border-border/60 shadow-warm-sm bg-card/80 backdrop-blur hover:shadow-warm-md hover:-translate-y-1 hover:border-primary/30 transition-all duration-300"
						>
							<CardContent className="px-3 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-6">
								<div className="relative mx-auto mb-3 sm:mb-5 w-12 h-12 sm:w-16 sm:h-16">
									<div className="absolute inset-0 bg-saffron-gradient rounded-xl sm:rounded-2xl opacity-90 rotate-3 group-hover:rotate-6 transition-transform" />
									<div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center bg-card/50">
										<feature.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary" strokeWidth={1.75} />
									</div>
								</div>
								<h3 className="font-display text-sm sm:text-base lg:text-lg font-semibold mb-1 sm:mb-2 tracking-tight">
									{t(feature.titleKey)}
								</h3>
								<div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
									{feature.isFreeShipping &&
									Number(businessSettings?.free_shipping_on_over) > 0 ? (
										// Only advertise a threshold the store actually
										// configured — "free shipping over ৳0" is a lie.
										<div className="flex gap-1 flex-wrap justify-center">
											{t(
												"features.freeShipping.firstTitle"
											)}{" "}
											<Price
												amount={(
													businessSettings?.free_shipping_on_over ??
													0
												).toString()}
											/>
											{t(
												"features.freeShipping.secondTitle"
											)}
										</div>
									) : (
										t(feature.descriptionKey)
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
};
