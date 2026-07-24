"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import { useSetAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/shared/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Checkbox } from "@/components/shared/ui/checkbox";
import { PhoneCountryInput } from "@/components/shared/ui/phone-country-input";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { loginUser } from "@/(app-routes)/(auth)/action";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { DEFAULT_COUNTRY_CODE } from "@/lib/data/countries";
import { safeRedirectPath } from "@/lib/utils/safe-redirect";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * International login screen (global template): country-code phone picker with
 * per-country validation (libphonenumber-js) or email, submitted through the
 * existing login action. Phone is normalized to E.164.
 */
export function GlobalLoginPage() {
	const { t } = useTranslation();
	const router = useRouter();
	const setMiniProfile = useSetAtom(miniProfileAtom);
	const [isPending, startTransition] = useTransition();
	const redirectUrl = safeRedirectPath(
		useSearchParams().get("redirect"),
		ABSOLUTE_ROUTES.PROFILE
	);

	const [usePhone, setUsePhone] = useState(true);
	const [country, setCountry] = useState(DEFAULT_COUNTRY_CODE);
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		let e164Phone = "";
		if (usePhone) {
			if (!phone || !isValidPhoneNumber(phone, country as never)) {
				toast.error(t("global.auth.invalidPhone"));
				return;
			}
			e164Phone = parsePhoneNumber(phone, country as never).number;
		} else if (!EMAIL_RE.test(email)) {
			toast.error(t("global.auth.invalidEmail"));
			return;
		}

		const payload = usePhone
			? { phone: e164Phone, password, rememberMe }
			: { email, password, rememberMe };

		startTransition(async () => {
			try {
				const response = await loginUser(payload);
				if (response.success) {
					setMiniProfile(response.data?.user ?? null);
					toast.success(t("login.loginSuccess"));
					await new Promise((r) => setTimeout(r, 100));
					router.push(redirectUrl);
					router.refresh();
				} else {
					toast.error(response.message || t("login.loginFailed"));
				}
			} catch (error) {
				console.error("Login error:", error);
				toast.error(t("login.loginError"));
			}
		});
	};

	return (
		<main className="container mx-auto px-4 py-12">
			<div className="mx-auto max-w-md">
				<Button
					variant="ghost"
					className="mb-6 -ml-4"
					onClick={() => router.back()}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					{t("global.auth.back")}
				</Button>

				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-2xl font-bold">
							{t("global.auth.loginTitle")}
						</CardTitle>
						<p className="text-muted-foreground">
							{t("global.auth.loginSubtitle")}
						</p>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{usePhone ? (
								<div className="space-y-2">
									<Label htmlFor="phone">
										{t("global.auth.phone")}
									</Label>
									<PhoneCountryInput
										id="phone"
										country={country}
										onCountryChange={setCountry}
										value={phone}
										onChange={setPhone}
									/>
									<div className="flex justify-end">
										<button
											type="button"
											onClick={() => {
												setUsePhone(false);
												setPhone("");
											}}
											className="text-sm italic text-primary hover:underline"
										>
											{t("global.auth.useEmail")}
										</button>
									</div>
								</div>
							) : (
								<div className="space-y-2">
									<Label htmlFor="email">
										{t("global.auth.email")}
									</Label>
									<Input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder={t("global.auth.emailPlaceholder")}
										required
									/>
									<div className="flex justify-end">
										<button
											type="button"
											onClick={() => {
												setUsePhone(true);
												setEmail("");
											}}
											className="text-sm italic text-primary hover:underline"
										>
											{t("global.auth.usePhone")}
										</button>
									</div>
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="password">
									{t("global.auth.password")}
								</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder={t("global.auth.passwordPlaceholder")}
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword((v) => !v)}
										className="absolute right-0 top-0 flex h-full items-center px-3 text-muted-foreground"
										aria-label="Toggle password visibility"
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Checkbox
									id="remember"
									checked={rememberMe}
									onCheckedChange={(checked) =>
										setRememberMe(checked as boolean)
									}
								/>
								<Label htmlFor="remember" className="text-sm">
									{t("global.auth.rememberMe")}
								</Label>
							</div>

							<Button type="submit" className="w-full" disabled={isPending}>
								{isPending
									? t("global.auth.signingIn")
									: t("global.auth.signIn")}
							</Button>
						</form>

						<div className="mt-6 text-center text-sm">
							<span className="text-muted-foreground">
								{t("global.auth.noAccount")}{" "}
							</span>
							<Link
								href={ABSOLUTE_ROUTES.REGISTER}
								className="font-medium text-primary hover:underline"
							>
								{t("global.auth.signUp")}
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
