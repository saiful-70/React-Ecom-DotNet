"use client";

import { useTranslation } from "react-i18next";
import { deptStyle } from "../dept-color";

/**
 * Hard band boundary — crossing into a section is a visible chart break: one
 * full-width 3px rule whose leading segment carries the section's colour and
 * whose remainder is board-black, then the heading in the display face. The
 * colour is folded INTO the rule (never a floating marker above the text);
 * it takes the department hue when a `deptIndex` is given, tariff-azure
 * otherwise.
 */
export function BazarSectionBand({
	titleKey,
	defaultTitle,
	deptIndex,
}: {
	titleKey: string;
	defaultTitle?: string;
	deptIndex?: number;
}) {
	const { t } = useTranslation();
	return (
		<div
			className="mb-6"
			style={deptIndex != null ? deptStyle(deptIndex) : undefined}
		>
			<div className="flex h-[3px]" aria-hidden="true">
				<span className="bz-dept-dot w-14 shrink-0" />
				<span className="flex-1 bg-secondary" />
			</div>
			<h2 className="mt-3 text-balance font-display text-2xl font-bold leading-tight md:text-3xl">
				{defaultTitle ? t(titleKey, defaultTitle) : t(titleKey)}
			</h2>
		</div>
	);
}
