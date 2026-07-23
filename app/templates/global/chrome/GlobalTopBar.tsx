"use client";

import { useAtomValue } from "jotai";
import { Phone } from "lucide-react";
import {
	DEFAULT_CURRENCY,
	getCurrencySymbol,
} from "@/lib/utils/business-settings";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { VariantSwitcher } from "@/components/shared/VariantSwitcher";
import { useVariant } from "@/components/shared/providers/variant-provider";
import { businessSettingsAtom } from "@/store/ui-atoms";

/**
 * Global chrome utility top bar: contact phone (left) · currency label +
 * language switcher (right). Currency is display-only in v1 — the storefront
 * runs a single currency per variant (see the API contract for multi-currency).
 */
export function GlobalTopBar() {
	const settings = useAtomValue(businessSettingsAtom);
	const variant = useVariant();
	const currency =
		settings?.currency || variant.branding.currency || DEFAULT_CURRENCY;
	const symbol = getCurrencySymbol(currency);

	return (
		<div className="border-b bg-muted/40 text-xs">
			<div className="container mx-auto flex h-9 items-center justify-between px-4">
				{settings?.contact_phone ? (
					<a
						href={`tel:${settings.contact_phone}`}
						className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
					>
						<Phone className="h-3.5 w-3.5" />
						{settings.contact_phone}
					</a>
				) : (
					<span aria-hidden="true" />
				)}
				<div className="flex items-center gap-1 sm:gap-2">
					<span className="font-medium tabular-nums text-muted-foreground">
						{currency} {symbol}
					</span>
					<LanguageSwitcher />
					<VariantSwitcher />
				</div>
			</div>
		</div>
	);
}
