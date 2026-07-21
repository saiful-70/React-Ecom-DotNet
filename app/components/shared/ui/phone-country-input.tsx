"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/shared/ui/popover";
import { Input } from "@/components/shared/ui/input";
import {
	COUNTRIES,
	countryToFlag,
	findCountry,
} from "@/lib/data/countries";
import { cn } from "@/lib/utils/utils";

interface PhoneCountryInputProps {
	/** Selected country ISO alpha-2 code. */
	country: string;
	onCountryChange: (code: string) => void;
	/** National number digits (no dial code). */
	value: string;
	onChange: (value: string) => void;
	invalid?: boolean;
	id?: string;
}

/**
 * International phone field: a searchable country selector (flag + dial code)
 * plus a national-number input. Emits raw national digits; the caller composes
 * the dial code and validates with libphonenumber-js.
 */
export function PhoneCountryInput({
	country,
	onCountryChange,
	value,
	onChange,
	invalid,
	id,
}: PhoneCountryInputProps) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");

	const selected = findCountry(country) ?? COUNTRIES[0];

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return COUNTRIES;
		return COUNTRIES.filter(
			(c) =>
				c.name.toLowerCase().includes(q) ||
				c.dialCode.includes(q) ||
				c.code.toLowerCase().includes(q)
		);
	}, [query]);

	return (
		<div
			className={cn(
				"flex rounded-md border bg-background transition-colors focus-within:ring-1 focus-within:ring-ring",
				invalid && "border-destructive"
			)}
		>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						aria-label={t("global.auth.selectCountry")}
						className="flex shrink-0 items-center gap-1.5 rounded-l-md border-r px-3 text-sm hover:bg-accent"
					>
						<span className="text-base leading-none">
							{countryToFlag(selected.code)}
						</span>
						<span className="tabular-nums">+{selected.dialCode}</span>
						<ChevronDown className="h-4 w-4 text-muted-foreground" />
					</button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-72 p-0">
					<div className="border-b p-2">
						<div className="relative">
							<Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								autoFocus
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder={t("global.auth.searchCountry")}
								className="h-9 pl-8"
							/>
						</div>
					</div>
					<ul className="max-h-64 overflow-y-auto py-1">
						{filtered.length === 0 && (
							<li className="px-3 py-6 text-center text-sm text-muted-foreground">
								{t("global.auth.noCountry")}
							</li>
						)}
						{filtered.map((c) => (
							<li key={c.code}>
								<button
									type="button"
									onClick={() => {
										onCountryChange(c.code);
										setOpen(false);
										setQuery("");
									}}
									className={cn(
										"flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent",
										c.code === selected.code && "bg-accent/60"
									)}
								>
									<span className="text-base leading-none">
										{countryToFlag(c.code)}
									</span>
									<span className="flex-1 truncate">{c.name}</span>
									<span className="tabular-nums text-muted-foreground">
										+{c.dialCode}
									</span>
									{c.code === selected.code && (
										<Check className="h-4 w-4 text-primary" />
									)}
								</button>
							</li>
						))}
					</ul>
				</PopoverContent>
			</Popover>

			<input
				id={id}
				type="tel"
				inputMode="numeric"
				autoComplete="tel-national"
				value={value}
				onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
				placeholder={t("global.auth.phonePlaceholder")}
				className="w-full rounded-r-md bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
			/>
		</div>
	);
}
