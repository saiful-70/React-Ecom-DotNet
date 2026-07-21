"use client";

import { useTranslation } from "react-i18next";

/** Section heading with the bazar underline accent. */
export function BazarSectionTitle({ titleKey }: { titleKey: string }) {
	const { t } = useTranslation();
	return (
		<div className="mb-6">
			<h2 className="text-2xl font-bold md:text-3xl">{t(titleKey)}</h2>
			<div className="mt-2 h-1 w-24 rounded bg-primary" />
		</div>
	);
}
