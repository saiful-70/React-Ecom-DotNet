"use client";

import {
	Facebook,
	Twitter,
	Instagram,
	Youtube,
	Mail,
	Phone,
	MapPin,
} from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Separator } from "@/components/shared/ui/separator";
import { useAtomValue } from "jotai";
import { businessSettingsAtom } from "@/store/ui-atoms";
import Image from "next/image";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { toast } from "@/components/shared/ui/sonner";
import { subscribeNewsletter } from "@/lib/actions/newsletter";
import { Category } from "../shared/models/category";
import { CookieSettingsButton } from "../shared/CookieConsent";

interface Props {
	categories?: Category[];
}

export const Footer = ({ categories = [] }: Props) => {
	const { t } = useTranslation();
	const businessSettings = useAtomValue(businessSettingsAtom);
	const [email, setEmail] = useState("");
	const [isSubscribing, setIsSubscribing] = useState(false);

	const handleSubscribe = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email.trim()) {
			toast.error(t("footer.newsletter.error") || "Error", {
				description:
					t("footer.newsletter.emptyEmail") ||
					"Please enter your email address.",
			});
			return;
		}

		setIsSubscribing(true);

		try {
			const response = await subscribeNewsletter(email);

			if (response.success) {
				toast.success(
					t("footer.newsletter.subscribeSuccess") || "Subscribed!",
					{
						description:
							response.message ||
							t("footer.newsletter.subscribeSuccessDesc") ||
							"Thank you for subscribing to our newsletter.",
					}
				);
				setEmail(""); // Clear input after successful subscription
			} else {
				toast.error(
					t("footer.newsletter.subscribeError") ||
					"Subscription Failed",
					{
						description:
							response.message ||
							t("footer.newsletter.subscribeErrorDesc") ||
							"Failed to subscribe. Please try again.",
					}
				);
			}
		} catch (error) {
			console.error("Newsletter subscription error:", error);
			toast.error(t("footer.newsletter.error") || "Error", {
				description:
					t("footer.newsletter.unexpectedError") ||
					"An unexpected error occurred. Please try again.",
			});
		} finally {
			setIsSubscribing(false);
		}
	};
	return (
		<footer className="relative bg-secondary text-secondary-foreground overflow-hidden">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-[0.06]"
				style={{
					backgroundImage:
						"radial-gradient(hsl(var(--accent)) 1px, transparent 1px)",
					backgroundSize: "32px 32px",
				}}
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
			/>
			<div className="relative container mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-6">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-8">
					{/* Company Info */}
					<div className="space-y-4">
						{businessSettings?.footer_logo ? (
							<div className="flex gap-2 items-center">
								<Image
									src={businessSettings.footer_logo}
									alt={t("footer.company.logoAlt")}
									height={50}
									width={50}
									className="aspect-video object-contain min-h-10"
								/>
								<span className="text-xl font-bold">
									{businessSettings.site_name}
								</span>
							</div>
						) : (
							<div className="flex items-center space-x-2">
								<div className="w-9 h-9 bg-saffron-gradient rounded-xl flex items-center justify-center shadow-warm-sm">
									<span className="text-accent-foreground font-bold text-lg">
										D
									</span>
								</div>
								<span className="font-display text-xl font-semibold">
									DebuggerMind
								</span>
							</div>
						)}
						<p className="text-secondary-foreground/75 text-sm leading-relaxed">
							{t("footer.company.description")}
						</p>
						<div className="flex space-x-1">
							{[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
								<Button
									key={i}
									size="icon"
									variant="ghost"
									className="hover:bg-accent/20 hover:text-accent rounded-full"
								>
									<Icon className="w-4 h-4" />
								</Button>
							))}
						</div>
					</div>

					{/* Quick Links */}
					<div className="space-y-4">
						<h3 className="font-display text-base font-semibold tracking-tight">
							{t("footer.quickLinks.title")}
						</h3>
						<nav className="space-y-2">
							<a
								href="#"
								className="block text-sm text-secondary-foreground/70 hover:text-accent transition-colors"
							>
								{t("footer.quickLinks.aboutUs")}
							</a>
							<a
								href="#"
								className="block text-sm text-secondary-foreground/70 hover:text-accent transition-colors"
							>
								{t("footer.quickLinks.contact")}
							</a>
							<a
								href="#"
								className="block text-sm text-secondary-foreground/70 hover:text-accent transition-colors"
							>
								{t("footer.quickLinks.faq")}
							</a>
							<a
								href="#"
								className="block text-sm text-secondary-foreground/70 hover:text-accent transition-colors"
							>
								{t("footer.quickLinks.shippingInfo")}
							</a>
							<a
								href="#"
								className="block text-sm text-secondary-foreground/70 hover:text-accent transition-colors"
							>
								{t("footer.quickLinks.returns")}
							</a>
						</nav>
					</div>

					{/* Categories */}
					<div className="space-y-4">
						<h3 className="font-display text-base font-semibold tracking-tight">
							{t("footer.categories.title")}
						</h3>
						<nav>
							<ul className="space-y-2">
								{categories.map((category) => (
									<li key={category.id}>
										<Link
											href={ABSOLUTE_ROUTES.PRODUCTS_BY_CATEGORY(
												category.id
											)}
											className="block text-sm text-secondary-foreground/70 hover:text-accent transition-colors"
										>
											{category.name}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					</div>

					{/* Newsletter & Contact */}
					<div className="space-y-4">
						<h3 className="font-display text-base font-semibold tracking-tight">
							{t("footer.newsletter.title")}
						</h3>
						<p className="text-sm text-secondary-foreground/70 leading-relaxed">
							{t("footer.newsletter.description")}
						</p>
						<form
							onSubmit={handleSubscribe}
							className="flex flex-col gap-2"
						>
							<Input
								type="email"
								placeholder={t(
									"footer.newsletter.emailPlaceholder"
								)}
								className="bg-background/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/40"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={isSubscribing}
							/>
							<Button
								type="submit"
								disabled={isSubscribing}
								onClick={handleSubscribe}
								className="bg-saffron-gradient text-accent-foreground hover:opacity-90 border-0 shadow-warm-sm"
							>
								{isSubscribing
									? t("footer.newsletter.subscribing") ||
									"Subscribing..."
									: t("footer.newsletter.subscribeButton")}
							</Button>
						</form>

						<div className="space-y-2 pt-4">
							{businessSettings?.contact_phone ? (
								<div className="flex items-center space-x-2 text-sm text-secondary-foreground/75">
									<Phone className="w-4 h-4 text-accent" />
									<span>
										{businessSettings.contact_phone}
									</span>
								</div>
							) : null}
							{businessSettings?.contact_email ? (
								<div className="flex items-center space-x-2 text-sm text-secondary-foreground/75">
									<Mail className="w-4 h-4 text-accent" />
									<span>
										{businessSettings.contact_email}
									</span>
								</div>
							) : null}
							{businessSettings?.address ? (
								<div className="flex items-center space-x-2 text-sm text-secondary-foreground/75">
									<MapPin className="w-4 h-4 text-accent" />
									<span>{businessSettings.address}</span>
								</div>
							) : null}
						</div>
					</div>
				</div>

				<Separator className="my-8 bg-secondary-foreground/15" />

				<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
					<p className="text-sm text-secondary-foreground/65">
						{businessSettings?.copyright_text
							? businessSettings.copyright_text
							: `© 2024 DebuggerMind. ${t(
								"footer.legal.allRightsReserved"
							)}`}
					</p>
					<div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-secondary-foreground/65">
						<a
							href="#"
							className="hover:text-accent transition-colors"
						>
							{t("footer.legal.privacyPolicy")}
						</a>
						<a
							href="#"
							className="hover:text-accent transition-colors"
						>
							{t("footer.legal.termsOfService")}
						</a>
						<CookieSettingsButton />
					</div>
				</div>
			</div>
		</footer>
	);
};
