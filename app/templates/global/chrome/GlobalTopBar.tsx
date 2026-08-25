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
import { currencyLine } from "../_data/catalogue";
import "../global.css";

/**
 * Utility rule above the masthead: contact phone (left) · currency line +
 * language switcher (right). Set like a catalogue running head — small caps,
 * hairline rule below. Currency is display-only (single currency per variant).
 */
export function GlobalTopBar() {
	const settings = useAtomValue(businessSettingsAtom);
	const variant = useVariant();
	const currency =
		settings?.currency || variant.branding.currency || DEFAULT_CURRENCY;
	const currencyLabel = currencyLine(currency, getCurrencySymbol(currency));

	return (
		<div className="border-b border-border bg-muted text-xs">
			<div className="container mx-auto flex h-9 items-center justify-between">
				{settings?.contact_phone ? (
					<a
						href={`tel:${settings.contact_phone}`}
						className="ring-warm-focus flex items-center gap-1.5 rounded-sm text-muted-foreground tabular-nums transition-colors hover:text-foreground"
					>
						<Phone className="h-3.5 w-3.5" />
						{settings.contact_phone}
					</a>
				) : (
					<span aria-hidden="true" />
				)}
				<div className="flex items-center gap-1 sm:gap-2">
					<span className="font-medium uppercase tracking-[0.08em] text-muted-foreground tabular-nums">
						{currencyLabel}
					</span>
					<span aria-hidden="true" className="h-3 w-px bg-border" />
					<LanguageSwitcher showLabel />
					<VariantSwitcher />
				</div>
			</div>
		</div>
	);
}
