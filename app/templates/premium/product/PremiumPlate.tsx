"use client";

import { useAtomValue } from "jotai";
import { businessSettingsAtom } from "@/store/ui-atoms";
import { cn } from "@/lib/utils/utils";

/**
 * Missing-image fallback: a label-stock plate carrying the wordmark, so a
 * product without photography still reads as a boxed specimen — never a
 * broken image.
 */
export function PremiumPlate({ className }: { className?: string }) {
	const settings = useAtomValue(businessSettingsAtom);

	return (
		<div
			className={cn(
				"flex h-full w-full items-center justify-center bg-card",
				className
			)}
			role="img"
			aria-label={settings?.site_name || "Product image unavailable"}
		>
			<span className="font-display text-2xl tracking-tight text-card-foreground/70">
				{settings?.site_name ?? ""}
			</span>
		</div>
	);
}
