"use client";

import { Check, FlaskConical } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/shared/ui/dropdown-menu";
import { useVariant } from "@/components/shared/providers/variant-provider";
import { DEMO_PREFIX, SHOWCASE_MODE } from "@/lib/config/variant.config";
import { listVariants } from "@/variants/registry";
import type { Market } from "@/variants/types";

const MARKET_LABELS: Record<Market, string> = {
	intl: "International",
	bn: "Bengali",
};

/**
 * Header control to jump between demo variants. Rendered only in showcase mode
 * (NEXT_PUBLIC_SHOWCASE=true); returns null in client-deploy builds so a
 * delivered client never sees the switcher.
 */
export function VariantSwitcher() {
	const active = useVariant();

	if (!SHOWCASE_MODE) return null;

	const markets = Array.from(
		new Set(listVariants().map((v) => v.market))
	) as Market[];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="gap-1.5"
					aria-label="Switch demo variant"
				>
					<FlaskConical className="h-4 w-4" />
					<span className="hidden sm:inline max-w-[10rem] truncate">
						{active.name}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64">
				<DropdownMenuLabel>Demo variants</DropdownMenuLabel>
				{/* Switching variant needs a fresh server render (theme injected in
				    <head>, default language, branding all resolve on the server from
				    the middleware's x-variant header). A client-side next/link nav
				    would not re-run the root layout, leaving the theme/language stale
				    — so use plain anchors to force a full navigation. */}
				<DropdownMenuItem asChild>
					<a href={DEMO_PREFIX}>All demos gallery</a>
				</DropdownMenuItem>
				{markets.map((market) => (
					<div key={market}>
						<DropdownMenuSeparator />
						<DropdownMenuLabel className="text-xs text-muted-foreground">
							{MARKET_LABELS[market]}
						</DropdownMenuLabel>
						{listVariants(market).map((v) => (
							<DropdownMenuItem key={v.id} asChild>
								<a
									href={`${DEMO_PREFIX}/${v.id}`}
									className="flex items-center justify-between"
								>
									<span className="truncate">{v.name}</span>
									{v.id === active.id && (
										<Check className="h-4 w-4 shrink-0" />
									)}
								</a>
							</DropdownMenuItem>
						))}
					</div>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
