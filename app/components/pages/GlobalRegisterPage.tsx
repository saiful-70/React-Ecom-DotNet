"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import { useSetAtom } from "jotai";
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
import { PhoneCountryInput } from "@/components/shared/ui/phone-country-input";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { registerUser } from "@/(app-routes)/(auth)/action";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";
import { DEFAULT_COUNTRY_CODE } from "@/lib/data/countries";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

/**
 * International register screen (global template): country-code phone picker
 * with per-country validation (libphonenumber-js) or email, submitted through
 * the existing register action. Phone is normalized to E.164.
 */
export function GlobalRegisterPage() {
	const { t } = useTranslation();
	const router = useRouter();
	const setMiniProfile = useSetAtom(miniProfileAtom);
	const [isPending, startTransition] = useTransition();

	const [usePhone, setUsePhone] = useState(true);
	const [country, setCountry] = useState(DEFAULT_COUNTRY_CODE);
	const [phone, setPhone] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
		password_confirmation: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		let e164Phone = "";
		if (usePhone) {
			if (!phone || !isValidPhoneNumber(phone, country as never)) {
				toast.error(t("global.auth.invalidPhone"));
				return;
			}
			e164Phone = parsePhoneNumber(phone, country as never).number;
		} else if (!EMAIL_RE.test(form.email)) {
			toast.error(t("global.auth.invalidEmail"));
			return;
		}

		if (form.password.length < MIN_PASSWORD) {
			toast.error(t("global.auth.passwordTooShort"));
			return;
		}
		if (form.password !== form.password_confirmation) {
			toast.error(t("global.auth.passwordsNoMatch"));
			return;
		}

		const payload = usePhone
			? {
					name: form.name,
					phone: e164Phone,
					password: form.password,
					password_confirmation: form.password_confirmation,
				}
			: {
					name: form.name,
					email: form.email,
					password: form.password,
					password_confirmation: form.password_confirmation,
				};

		startTransition(async () => {
			try {
				const response = await registerUser(payload);
				if (response.success) {
					setMiniProfile(response.data?.user ?? null);
					toast.success(t("register.registrationSuccessful"));
					await new Promise((r) => setTimeout(r, 100));
					router.push(ABSOLUTE_ROUTES.PROFILE);
					router.refresh();
				} else {
					toast.error(response.message || t("register.registrationFailed"));
				}
			} catch (error) {
				console.error("Registration error:", error);
				toast.error(t("register.registrationError"));
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
							{t("global.auth.registerTitle")}
						</CardTitle>
						<p className="text-muted-foreground">
							{t("global.auth.registerSubtitle")}
						</p>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">
									{t("global.auth.fullName")}
								</Label>
								<Input
									id="name"
									name="name"
									value={form.name}
									onChange={handleChange}
									placeholder={t("global.auth.fullNamePlaceholder")}
									required
								/>
							</div>

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
										name="email"
										type="email"
										value={form.email}
										onChange={handleChange}
										placeholder={t("global.auth.emailPlaceholder")}
										required
									/>
									<div className="flex justify-end">
										<button
											type="button"
											onClick={() => {
												setUsePhone(true);
												setForm((p) => ({ ...p, email: "" }));
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
										name="password"
										type={showPassword ? "text" : "password"}
										value={form.password}
										onChange={handleChange}
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

							<div className="space-y-2">
								<Label htmlFor="password_confirmation">
									{t("global.auth.confirmPassword")}
								</Label>
								<div className="relative">
									<Input
										id="password_confirmation"
										name="password_confirmation"
										type={showConfirm ? "text" : "password"}
										value={form.password_confirmation}
										onChange={handleChange}
										placeholder={t(
											"global.auth.confirmPasswordPlaceholder"
										)}
										required
									/>
									<button
										type="button"
										onClick={() => setShowConfirm((v) => !v)}
										className="absolute right-0 top-0 flex h-full items-center px-3 text-muted-foreground"
										aria-label="Toggle password visibility"
									>
										{showConfirm ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>

							<Button type="submit" className="w-full" disabled={isPending}>
								{isPending
									? t("global.auth.creatingAccount")
									: t("global.auth.signUp")}
							</Button>
						</form>

						<div className="mt-6 text-center text-sm">
							<span className="text-muted-foreground">
								{t("global.auth.haveAccount")}{" "}
							</span>
							<Link
								href={ABSOLUTE_ROUTES.LOGIN}
								className="font-medium text-primary hover:underline"
							>
								{t("global.auth.signIn")}
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
