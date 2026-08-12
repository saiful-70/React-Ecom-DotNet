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
import {
	RadioGroup,
	RadioGroupItem,
} from "@/components/shared/ui/radio-group";
import { Truck, Wallet } from "lucide-react";
import { useEffect } from "react";
import type { FormData, FormErrors } from "@/(app-routes)/checkout/model";
import { useCities } from "@/hooks/use-cities";

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
	// Backend city list (`GET /cities`); each row carries its delivery charge.
	const cities = useCities();

	// A city persisted before the list loaded (PDP selector) may hold a stale
	// name; reconcile by city id so the dropdown matches one of its options.
	useEffect(() => {
		if (!formData.cityId) return;
		const match = cities.find((c) => c.id === formData.cityId);
		if (match && match.name !== formData.city) {
			onInputChange("city", match.name);
		}
	}, [cities, formData.cityId]);

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
						onValueChange={(value) => {
							onInputChange("city", value);
							const city = cities.find((c) => c.name === value);
							onInputChange("cityId", city?.id ?? 0);
						}}
					>
						<SelectTrigger
							id="city"
							className={`w-full ${errors.city ? "border-destructive" : ""}`}
						>
							<SelectValue placeholder={t("checkout.selectCity")} />
						</SelectTrigger>
						<SelectContent>
							{cities.map((city) => (
								<SelectItem key={city.id} value={city.name}>
									{city.name}
									{city.shipping_cost != null
										? ` - ${city.shipping_cost}`
										: ""}
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

				{/* Payment method — COD is the only supported method (the order
				    payload always sends "cod"), shown pre-selected for clarity. */}
				<div>
					<Label className="flex items-center mb-2">
						{t("checkout.paymentMethod")}
					</Label>
					<RadioGroup value="cod" className="gap-2">
						<Label
							htmlFor="payment-cod"
							className="flex cursor-pointer items-center gap-2.5 rounded-md border border-primary/40 bg-primary/5 px-3 py-3 font-medium"
						>
							<RadioGroupItem value="cod" id="payment-cod" />
							<Wallet className="h-4 w-4 text-primary" />
							{t("checkout.cashOnDelivery")}
						</Label>
					</RadioGroup>
				</div>
			</CardContent>
		</Card>
	);
}
