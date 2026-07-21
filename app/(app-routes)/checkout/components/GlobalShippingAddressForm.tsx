"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import { useTranslation } from "react-i18next";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { Label } from "@/components/shared/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shared/ui/select";
import { PhoneCountryInput } from "@/components/shared/ui/phone-country-input";
import {
	COUNTRIES,
	DEFAULT_COUNTRY_CODE,
	findCountry,
} from "@/lib/data/countries";
import type { FormData, FormErrors } from "@/(app-routes)/checkout/model";

interface Props {
	formData: FormData;
	onInputChange: (field: keyof FormData, value: string | number) => void;
	errors?: FormErrors;
}

/**
 * International shipping address form (global template): country-code phone
 * picker (validated, stored as E.164), a country selector, and free-text city
 * and postal code — no Bangladesh-specific fields.
 */
export function GlobalShippingAddressForm({
	formData,
	onInputChange,
	errors = {},
}: Props) {
	const { t } = useTranslation();
	const [phoneCountry, setPhoneCountry] = useState(DEFAULT_COUNTRY_CODE);
	const [national, setNational] = useState("");

	// Compose the E.164 phone from the selected country + national number.
	const propagatePhone = (countryCode: string, digits: string) => {
		if (!digits) {
			onInputChange("phone", "");
			return;
		}
		const dial = findCountry(countryCode)?.dialCode ?? "";
		const composed = isValidPhoneNumber(digits, countryCode as never)
			? parsePhoneNumber(digits, countryCode as never).number
			: `+${dial}${digits}`;
		onInputChange("phone", composed);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center">
					<Truck className="mr-2 h-5 w-5" />
					{t("checkout.shippingInfo")}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<Label htmlFor="name" className="mb-1 flex items-center">
						{t("checkout.name")}
						<span className="text-destructive">*</span>
					</Label>
					<Input
						id="name"
						placeholder={t("checkout.placeholders.name")}
						value={formData.name}
						onChange={(e) => onInputChange("name", e.target.value)}
						className={errors.name ? "border-destructive" : ""}
					/>
					{errors.name && (
						<p className="mt-1 text-xs text-destructive">{t(errors.name)}</p>
					)}
				</div>

				<div>
					<Label htmlFor="phone" className="mb-1 flex items-center">
						{t("checkout.phone")}
						<span className="text-destructive">*</span>
					</Label>
					<PhoneCountryInput
						id="phone"
						country={phoneCountry}
						onCountryChange={(code) => {
							setPhoneCountry(code);
							propagatePhone(code, national);
						}}
						value={national}
						onChange={(digits) => {
							setNational(digits);
							propagatePhone(phoneCountry, digits);
						}}
						invalid={!!errors.phone}
					/>
					{errors.phone && (
						<p className="mt-1 text-xs text-destructive">{t(errors.phone)}</p>
					)}
				</div>

				<div>
					<Label htmlFor="country" className="mb-1 flex items-center">
						{t("checkout.country")}
						<span className="text-destructive">*</span>
					</Label>
					<Select
						value={formData.country || ""}
						onValueChange={(value) => onInputChange("country", value)}
					>
						<SelectTrigger
							id="country"
							className={`w-full ${errors.country ? "border-destructive" : ""}`}
						>
							<SelectValue placeholder={t("global.auth.selectCountry")} />
						</SelectTrigger>
						<SelectContent>
							{COUNTRIES.map((c) => (
								<SelectItem key={c.code} value={c.name}>
									{c.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.country && (
						<p className="mt-1 text-xs text-destructive">
							{t(errors.country)}
						</p>
					)}
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label htmlFor="city" className="mb-1 flex items-center">
							{t("checkout.city")}
							<span className="text-destructive">*</span>
						</Label>
						<Input
							id="city"
							placeholder={t("checkout.placeholders.city")}
							value={formData.city}
							onChange={(e) => onInputChange("city", e.target.value)}
							className={errors.city ? "border-destructive" : ""}
						/>
						{errors.city && (
							<p className="mt-1 text-xs text-destructive">
								{t(errors.city)}
							</p>
						)}
					</div>
					<div>
						<Label htmlFor="zip" className="mb-1 flex items-center">
							{t("checkout.postcode")}
						</Label>
						<Input
							id="zip"
							placeholder={t("checkout.placeholders.postalCode")}
							value={formData.zip || ""}
							onChange={(e) => onInputChange("zip", e.target.value)}
						/>
					</div>
				</div>

				<div>
					<Label htmlFor="address" className="mb-1 flex items-center">
						{t("checkout.address")}
						<span className="text-destructive">*</span>
					</Label>
					<Textarea
						id="address"
						rows={3}
						className={`min-h-[96px] ${errors.address ? "border-destructive" : ""}`}
						placeholder={t("checkout.placeholders.address")}
						value={formData.address}
						onChange={(e) => onInputChange("address", e.target.value)}
					/>
					{errors.address && (
						<p className="mt-1 text-xs text-destructive">
							{t(errors.address)}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
