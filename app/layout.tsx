import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
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
import { PER_PAGE_PARAMS } from "./lib/enums";
import { MaintenancePageContent } from "./components/shared/MaintenancePage";
import FooterWrapper from "./components/layout/FooterWrapper";
import { ChatWidget } from "./components/chat";
import { CookieBanner } from "./components/shared/CookieConsent";
import { GoogleAnalytics, MetaPixel } from "./lib/analytics";

const inter = Inter({ subsets: ["latin"] });

// Generate metadata using business settings
export async function generateMetadata(): Promise<Metadata> {
	try {
		const response = await new ApiClient(API_ROUTES.BUSINESS_SETTINGS)
			.withMethod("GET")
			.execute<BusinessSettingsResponseModel>();

		if (response.success && response.data) {
			// Normalize the entire API response data into a single object
			const businessSettings = normalizeBusinessSettings(response.data);

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

	// Return fallback metadata with defaults
	const fallbackSettings = normalizeBusinessSettings([]);
	return generateSEOMetadata({
		title: "DebuggerMind - Premium E-commerce Experience",
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
	const response = await new ApiClient(API_ROUTES.BUSINESS_SETTINGS)
		.withMethod("GET")
		.withParams({ per_page: PER_PAGE_PARAMS.DEFAULT })
		.execute<BusinessSettingsResponseModel>();

	// Normalize all business settings data into a single object
	const businessSettings = normalizeBusinessSettings(
		response.success ? response.data : null
	);

	// Check if maintenance mode is enabled
	const maintenanceEnabled = isMaintenanceModeEnabled(businessSettings);

	// If maintenance mode is enabled, render only the maintenance page without layout
	if (maintenanceEnabled) {
		return (
			<html lang="bn" suppressHydrationWarning>
				<body className={inter.className}>
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
		<html lang="bn" suppressHydrationWarning>
			<head>
				{/* Business structured data for SEO */}
				{renderStructuredData(organizationSchema)}
				<link
					rel="icon"
					href={businessSettings?.favicon ?? "/favicon.ico"}
				/>
			</head>
			<body className={inter.className}>
				<GlobalProvider>
					<Suspense fallback={null}>
						<GoogleAnalytics />
					</Suspense>
					<Suspense fallback={null}>
						<MetaPixel />
					</Suspense>
					<HydrateBusinessSettings
						businessSettings={businessSettings}
					/>
					<HeaderWrapper />
					<Navigation />
					<BackToTopButton />
					<ChatWidget />
					<CookieBanner />
					{children}
					<FooterWrapper />
				</GlobalProvider>
			</body>
		</html>
	);
}
