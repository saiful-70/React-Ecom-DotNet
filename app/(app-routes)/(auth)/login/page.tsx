import { AUTH_TOKEN_COOKIE_NAME } from "@/lib/config/auth.config";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { LoginPage } from "@/components/pages/LoginPage";
import { GlobalLoginPage } from "@/components/pages/GlobalLoginPage";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { generateMetadata as genMeta } from "@/lib/utils/seo.utils";
import { getBusinessSettings } from "@/components/shared/actions/business-settings";
import { getActiveVariant } from "@/variants/server";

export async function generateMetadata(): Promise<Metadata> {
	const businessSettings = await getBusinessSettings();

	return genMeta({
		title: "Login",
		description:
			"Sign in to your account to access your orders, wishlist, and more.",
		noIndex: true,
		businessSettings,
	});
}

export default async function Login() {
	const cookiesList = await cookies();
	const authCookie = cookiesList.get(AUTH_TOKEN_COOKIE_NAME);
	if (authCookie) return redirect(ABSOLUTE_ROUTES.PROFILE);

	// The `global` template ships its own international login (country-code
	// phone picker); every other variant keeps the existing screen.
	const variant = await getActiveVariant();
	return (
		<div className="min-h-screen bg-background">
			{variant.template === "global" ? <GlobalLoginPage /> : <LoginPage />}
		</div>
	);
}
