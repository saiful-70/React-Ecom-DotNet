"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Shown when the backend rejected this deployment's `X-Website-Key` (HTTP 401).
 *
 * This is a deployment misconfiguration, not a transient failure: every API
 * call fails identically until the env is fixed, so the copy deliberately
 * offers no "try again" affordance. The actionable detail (which variant, which
 * endpoint) is on the server log, not here.
 */
export function StoreConfigError() {
	const { t } = useTranslation();

	return (
		<div
			role="alert"
			className="mx-auto my-12 flex max-w-md flex-col items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center"
		>
			<AlertTriangle className="h-6 w-6 text-destructive" />
			<h2 className="text-lg font-semibold">
				{t("common.storeConfigTitle") || "Store configuration error"}
			</h2>
			<p className="text-sm text-muted-foreground">
				{t("common.storeConfigDescription") ||
					"This storefront is not correctly connected to its catalogue. Please contact the site administrator."}
			</p>
		</div>
	);
}
