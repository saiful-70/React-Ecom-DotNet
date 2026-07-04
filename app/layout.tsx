import type { Metadata } from "next";
import { Suspense } from "react";
import { headers, cookies } from "next/headers";
import { Inter, Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";
import GlobalProvider from "./components/shared/providers/global-provider";
import { HeaderWrapper } from "./components/layout/HeaderWrapper";
import { Navigation } from "./components/layout/Navigation";
import BackToTopButton from "./components/shared/BackToTopButton";
import { ApiClient } from "./lib/api-client";
import { API_ROUTES } from "./lib/api-route";
import { HydrateBusinessSettings } from "./components/shared/HydrateBusinessSettings";
import { BusinessSettingsResponseModel } from "./components/shared/types/BusinessSettingModel";
import {
	generateMetadata as generateSEOMetadata,
	generateOrganizationSchema,
	renderStructuredData,
} from "./lib/utils/seo.utils";
import {
	normalizeBusinessSettings,
	isMaintenanceModeEnabled,
} from "./lib/utils/business-settings";
import { getActiveVariant } from "./variants/server";
import { buildVariantThemeCss } from "./variants/theme";
import { PER_PAGE_PARAMS } from "./lib/enums";
import { MaintenancePageContent } from "./components/shared/MaintenancePage";
import FooterWrapper from "./components/layout/FooterWrapper";
import { ChatWidget } from "./components/chat";
import { CookieBanner } from "./components/shared/CookieConsent";
import { GoogleAnalytics, MetaPixel } from "./lib/analytics";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

const hindSiliguri = Hind_Siliguri({
	subsets: ["bengali", "latin"],
	weight: ["300", "400", "500", "600", "700"],
	variable: "--font-bengali",
	display: "swap",
});

const notoSerifBengali = Noto_Serif_Bengali({
	subsets: ["bengali", "latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-display",
	display: "swap",
});

const fontVariables = `${inter.variable} ${hindSiliguri.variable} ${notoSerifBengali.variable}`;

// Generate metadata using business settings
export async function generateMetadata(): Promise<Metadata> {
	const variant = await getActiveVariant();
	try {
		const response = await new ApiClient(API_ROUTES.BUSINESS_SETTINGS)
			.withMethod("GET")
			.execute<BusinessSettingsResponseModel>();

		if (response.success && response.data) {
			// Normalize the entire API response data into a single object
			const businessSettings = normalizeBusinessSettings(
				response.data,
				variant.branding
			);

			return generateSEOMetadata({
				title: `${businessSettings.site_name} - Premium E-commerce Experience`,
				description: `Discover amazing products at unbeatable prices on ${businessSettings.site_name}. Shop the latest trends with ${businessSettings.support_time} support.`,
				keywords: [
					"ecommerce",
					"shopping",
					"electronics",
					"fashion",
					"home",
					"garden",
					"online store",
				],
				businessSettings,
			});
		}
	} catch (error) {
		console.error("Failed to fetch business settings for metadata:", error);
	}

	// Return fallback metadata with defaults (still variant-branded)
	const fallbackSettings = normalizeBusinessSettings([], variant.branding);
	return generateSEOMetadata({
		title: `${fallbackSettings.site_name} - Premium E-commerce Experience`,
		description:
			"Discover amazing products at unbeatable prices. Shop the latest trends in electronics, fashion, home & garden.",
		keywords: [
			"ecommerce",
			"shopping",
			"electronics",
			"fashion",
			"home",
			"garden",
		],
		businessSettings: fallbackSettings,
	});
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Resolve the active variant (theme/branding/feature flags/default language).
	const variant = await getActiveVariant();
	const variantThemeCss = buildVariantThemeCss(variant);

	const response = await new ApiClient(API_ROUTES.BUSINESS_SETTINGS)
		.withMethod("GET")
		.withParams({ per_page: PER_PAGE_PARAMS.DEFAULT })
		.execute<BusinessSettingsResponseModel>();

	// Normalize all business settings data into a single object
	// (built-in defaults → variant branding → backend data).
	const businessSettings = normalizeBusinessSettings(
		response.success ? response.data : null,
		variant.branding
	);

	// Check if maintenance mode is enabled
	const maintenanceEnabled = isMaintenanceModeEnabled(businessSettings);

	// Campaign landing pages render without the global chrome (header/nav/footer/etc.)
	const pathname = (await headers()).get("x-pathname") ?? "";
	const isBareLayoutRoute = pathname.startsWith("/campaigns");

	// Resolve the UI language server-side from a cookie so SSR and client
	// hydration render the SAME language (no post-mount switch → no mismatch).
	// Only `bn`/`en` resources exist; when there is no cookie yet, fall back to
	// the active variant's default language (intl → en, bn → bn).
	const cookieLang = (await cookies()).get("language")?.value;
	const lang =
		cookieLang === "en" || cookieLang === "bn"
			? cookieLang
			: variant.defaultLanguage;

	// If maintenance mode is enabled, render only the maintenance page without layout
	if (maintenanceEnabled) {
		return (
			<html lang={lang} className={fontVariables} suppressHydrationWarning>
				<head>
					{variantThemeCss && (
						<style
							id="variant-theme"
							dangerouslySetInnerHTML={{ __html: variantThemeCss }}
						/>
					)}
				</head>
				<body className="font-sans">
					<MaintenancePageContent
						businessSettings={businessSettings}
					/>
				</body>
			</html>
		);
	}

	// Generate structured data using normalized settings
	const organizationSchema = generateOrganizationSchema(businessSettings);

	// Normal layout with header, footer, and other components
	return (
		<html lang={lang} className={fontVariables} suppressHydrationWarning>
			<head>
				{/* Variant theme: CSS-variable overrides layered over globals.css.
				    Server-injected in <head> so the theme is correct on first paint. */}
				{variantThemeCss && (
					<style
						id="variant-theme"
						dangerouslySetInnerHTML={{ __html: variantThemeCss }}
					/>
				)}
				{/* Business structured data for SEO */}
				{renderStructuredData(organizationSchema)}
				<link
					rel="icon"
					href={businessSettings?.favicon ?? "/favicon.ico"}
				/>
			</head>
			<body className="font-sans">
				<GlobalProvider language={lang} variant={variant}>
					<Suspense fallback={null}>
						<GoogleAnalytics />
					</Suspense>
					<Suspense fallback={null}>
						<MetaPixel />
					</Suspense>
					<HydrateBusinessSettings
						businessSettings={businessSettings}
					/>
					{!isBareLayoutRoute && (
						<>
							<HeaderWrapper />
							<Navigation />
							<BackToTopButton />
							{variant.features.chatWidget && <ChatWidget />}
							{variant.features.cookieConsent && <CookieBanner />}
						</>
					)}
					{children}
					{!isBareLayoutRoute && <FooterWrapper />}
				</GlobalProvider>
			</body>
		</html>
	);
}
