"use client";

import { Button } from "@/components/shared/ui/button";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { formatNumberInThousand } from "@/lib/utils/utils";
import Price from "../shared/Price";

export const Hero = () => {
	const { t } = useTranslation();
	const businessSettings = useAtomValue(businessSettingsAtom);

	const scrollToDeals = () => {
		// Try to find today's deals section first, then featured products
		const dealsSection =
			document.getElementById("today-deals") ||
			document.getElementById("featured-products");

		if (dealsSection) {
			const offsetTop = dealsSection.offsetTop - 50; // Scroll 50px above the element
			window.scrollTo({
				top: offsetTop,
				behavior: "smooth",
			});
		}
	};

	return (
		<section className="relative overflow-hidden bg-warm-gradient">
			{/* Decorative motif backdrop */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-[0.07]"
				style={{
					backgroundImage:
						"radial-gradient(hsl(var(--primary)) 1px, transparent 1px)",
					backgroundSize: "28px 28px",
				}}
			/>
			<div className="pointer-events-none absolute top-0 left-0 w-72 sm:w-[28rem] h-72 sm:h-[28rem] bg-accent/20 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
			<div className="pointer-events-none absolute bottom-0 right-0 w-80 sm:w-[32rem] h-80 sm:h-[32rem] bg-primary/15 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

			<div className="relative container mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-28">
				<div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
					{/* Left Content */}
					<div className="space-y-6 sm:space-y-8 text-center lg:text-left">
						<div className="space-y-4 sm:space-y-5">
							<div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-primary">
								<span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
								{businessSettings?.site_name || "DebuggerMind"}
							</div>
							<h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.1] tracking-tight text-balance">
								{t("hero.title")}
							</h1>
							<p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
								{t("hero.subtitle")}
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
							<Button
								size="lg"
								className="text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 shadow-warm-md hover:shadow-warm-lg transition-shadow"
								asChild
							>
								<Link href="/products">
									<ShoppingBag className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
									{t("hero.shopNow")}
								</Link>
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 border-primary/30 hover:bg-primary/5 hover:border-primary/50"
								onClick={scrollToDeals}
							>
								{t("hero.exploreDeals")}
								<ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
							</Button>
						</div>

						{/* Stats */}
						<div className="grid grid-cols-3 gap-2 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 border-t border-primary/15">
							{[
								{
									value: formatNumberInThousand(
										parseInt(
											businessSettings?.product_number ||
												"10000"
										)
									),
									label: t("hero.stats.products"),
								},
								{
									value: formatNumberInThousand(
										parseInt(
											businessSettings?.customer_number ||
												"50000"
										)
									),
									label: t("hero.stats.customers"),
								},
								{
									value: `${
										businessSettings?.satisfaction_percentage ||
										"99"
									}%`,
									label: t("hero.stats.satisfaction"),
								},
							].map((stat) => (
								<div
									key={stat.label}
									className="text-center lg:text-left"
								>
									<div className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-primary leading-none">
										{stat.value}
									</div>
									<div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1 leading-tight">
										{stat.label}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Right Content - Hero Image */}
					<div className="relative mx-auto w-full max-w-md lg:max-w-none">
						{/* Decorative frame layers */}
						<div className="pointer-events-none absolute -inset-3 sm:-inset-4 rounded-[2rem] bg-saffron-gradient opacity-20 sm:opacity-25 blur-2xl" />
						<div className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 sm:translate-x-4 sm:translate-y-4 rounded-[1.5rem] sm:rounded-[1.75rem] border-2 border-primary/30" />
						<div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem] shadow-warm-lg">
							<Image
								src={
									businessSettings?.hero_image ??
									"https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
								}
								alt={t("hero.imageAlt")}
								className="w-full h-64 sm:h-80 md:h-96 lg:h-[520px] object-cover"
								width={2070}
								height={520}
								priority
							/>
							<div className="absolute inset-0 bg-gradient-to-tr from-secondary/30 via-transparent to-transparent mix-blend-multiply" />
						</div>

						{/* Floating Cards — pull less aggressively on mobile to avoid viewport overflow */}
						<div className="absolute -bottom-3 left-2 sm:-bottom-6 sm:-left-6 bg-card/95 backdrop-blur p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-warm-lg border border-primary/15 z-20 max-w-[14rem] sm:max-w-none">
							<div className="flex items-center gap-2 sm:gap-3">
								<div className="w-9 h-9 sm:w-12 sm:h-12 shrink-0 bg-saffron-gradient rounded-lg sm:rounded-xl flex items-center justify-center shadow-warm-sm">
									<ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6 text-accent-foreground" />
								</div>
								<div className="min-w-0">
									<div className="font-semibold text-xs sm:text-sm leading-tight">
										{t("hero.features.freeShipping")}
									</div>
									<div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">
										{t("hero.features.onOrdersOver")}{" "}
										<Price
											amount={
												businessSettings?.free_shipping_on_over ||
												50
											}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className="absolute -top-3 right-2 sm:-top-6 sm:-right-6 bg-card/95 backdrop-blur p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-warm-lg border border-primary/15 z-20">
							<div className="text-center px-1 sm:px-2">
								<div className="font-display text-lg sm:text-2xl font-semibold text-primary leading-none">
									{businessSettings?.support_time || "24/7"}
								</div>
								<div className="text-[9px] sm:text-xs text-muted-foreground tracking-wide uppercase mt-0.5 sm:mt-1">
									{t("hero.features.support")}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
