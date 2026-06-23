"use client";

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
import { Truck } from "lucide-react";
import type { FormData, FormErrors } from "@/(app-routes)/checkout/model";
import { CITY_OPTIONS } from "@/lib/constants/delivery";

interface ShippingAddressFormProps {
	formData: FormData;
	onInputChange: (field: keyof FormData, value: string | number) => void;
	errors?: FormErrors;
}

export function ShippingAddressForm({
	formData,
	onInputChange,
	errors = {},
}: ShippingAddressFormProps) {
	const { t } = useTranslation();

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, "").slice(0, 11);
		onInputChange("phone", value);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center">
					<Truck className="w-5 h-5 mr-2" />
					{t("checkout.shippingInfo")}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<Label htmlFor="name" className="flex items-center mb-1">
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
						<p className="text-destructive text-xs mt-1">
							{t(errors.name)}
						</p>
					)}
				</div>

				<div>
					<Label htmlFor="phone" className="flex items-center mb-1">
						{t("checkout.phone")}
						<span className="text-destructive">*</span>
					</Label>
					<Input
						id="phone"
						inputMode="numeric"
						maxLength={11}
						placeholder={t("checkout.placeholders.phoneBD")}
						value={formData.phone}
						onChange={handlePhoneChange}
						className={errors.phone ? "border-destructive" : ""}
					/>
					{errors.phone && (
						<p className="text-destructive text-xs mt-1">
							{t(errors.phone)}
						</p>
					)}
				</div>

				<div>
					<Label htmlFor="city" className="flex items-center mb-1">
						{t("checkout.city")}
						<span className="text-destructive">*</span>
					</Label>
					<Select
						value={formData.city || ""}
						onValueChange={(value) => onInputChange("city", value)}
					>
						<SelectTrigger
							id="city"
							className={`w-full ${errors.city ? "border-destructive" : ""}`}
						>
							<SelectValue placeholder={t("checkout.selectCity")} />
						</SelectTrigger>
						<SelectContent>
							{CITY_OPTIONS.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
								>
									{t(option.labelKey)} - {option.rate}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.city && (
						<p className="text-destructive text-xs mt-1">
							{t(errors.city)}
						</p>
					)}
				</div>

				<div>
					<Label htmlFor="address" className="flex items-center mb-1">
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
						<p className="text-destructive text-xs mt-1">
							{t(errors.address)}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
