/**
 * Variant run-mode configuration.
 *
 * Two run modes, selected purely by env — no code fork, no branch:
 *  - Showcase mode (`NEXT_PUBLIC_SHOWCASE=true`): all variants browsable at
 *    `/demo/<id>/...`, gallery + switcher shown.
 *  - Client deploy mode (default): one variant pinned via `ACTIVE_VARIANT`,
 *    served at `/...` with no prefix and no switcher.
 */

/** URL prefix that carries the variant id in showcase mode: `/demo/<id>/...`. */
export const DEMO_PREFIX = "/demo";

/** Request header the middleware sets so server code can read the active variant. */
export const VARIANT_HEADER = "x-variant";

/** Request header carrying the real (prefix-stripped) app path. */
export const PATHNAME_HEADER = "x-pathname";

/**
 * Whether the app runs as the browsable demo showcase.
 * `NEXT_PUBLIC_` so both server and client (variant-aware links, switcher)
 * can read it.
 */
export const SHOWCASE_MODE = process.env.NEXT_PUBLIC_SHOWCASE === "true";

/**
 * Variant used when none can be resolved from the URL/env.
 * `NEXT_PUBLIC_` so the client can fall back consistently.
 */
export const DEFAULT_VARIANT_ID =
  process.env.NEXT_PUBLIC_DEFAULT_VARIANT ?? "bn-01";

/**
 * The single variant a client deployment is pinned to. Read server/edge side
 * only (not `NEXT_PUBLIC_`) — the client learns the active variant from the
 * VariantProvider prop, not from env. Empty string means "not pinned".
 */
export const PINNED_VARIANT_ID = process.env.ACTIVE_VARIANT ?? "";
