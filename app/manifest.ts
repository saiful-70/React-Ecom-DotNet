import type { MetadataRoute } from "next";
import {
	DEFAULT_VARIANT_ID,
	PINNED_VARIANT_ID,
} from "@/lib/config/variant.config";
import { getVariant } from "@/variants/registry";
import { normalizeBusinessSettings } from "@/lib/utils/business-settings";

/**
 * Dynamic web app manifest, driven by the active variant's branding.
 *
 * Next auto-serves this at /manifest.webmanifest and injects the
 * `<link rel="manifest">`. In a client deploy the variant is pinned via
 * `ACTIVE_VARIANT`, so a delivered client gets its own name/colors/icon; the
 * showcase build falls back to the default variant. (The manifest request
 * carries no `x-variant` header — the middleware skips dotted paths — so we
 * resolve from env, not from headers.)
 */
export default function manifest(): MetadataRoute.Manifest {
	const variant = getVariant(PINNED_VARIANT_ID || DEFAULT_VARIANT_ID);
	const settings = normalizeBusinessSettings([], variant.branding);
	const primary = variant.theme.root?.primary ?? "142 56% 30%";
	const background = variant.theme.root?.background ?? "140 30% 97%";

	return {
		name: settings.site_name,
		short_name: settings.site_name,
		description: `${settings.site_name} — online store`,
		start_url: "/",
		display: "standalone",
		background_color: `hsl(${background})`,
		theme_color: `hsl(${primary})`,
		icons: [
			{
				src: settings.favicon,
				sizes: "any",
				type: "image/x-icon",
			},
		],
	};
}
