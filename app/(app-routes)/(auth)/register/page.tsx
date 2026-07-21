import { RegisterPage } from "@/components/pages/RegisterPage";
import { GlobalRegisterPage } from "@/components/pages/GlobalRegisterPage";
import { Metadata } from "next";
import { generateMetadata as genMeta } from "@/lib/utils/seo.utils";
import { getBusinessSettings } from "@/components/shared/actions/business-settings";
import { getActiveVariant } from "@/variants/server";

export async function generateMetadata(): Promise<Metadata> {
	const businessSettings = await getBusinessSettings();

	return genMeta({
		title: "Register",
		description:
			"Create a new account to start shopping and access exclusive deals.",
		noIndex: true,
		businessSettings,
	});
}

export default async function Register() {
	// The `global` template ships its own international registration (country-
	// code phone picker); every other variant keeps the existing screen.
	const variant = await getActiveVariant();
	return (
		<div className="min-h-screen bg-background">
			{variant.template === "global" ? (
				<GlobalRegisterPage />
			) : (
				<RegisterPage />
			)}
		</div>
	);
}
