/**
 * Multi-website (store) identity.
 *
 * One backend + one database serve several storefronts. The backend decides
 * which products a request may see, and which store an order belongs to,
 * purely from the `X-Website-Key` header — so every `/api/v1` call must carry
 * it. Never send a website id in a request body or query string: it is
 * spoofable and the backend ignores it.
 *
 * This repo serves several variants from a single deployment, so a variant IS
 * a website: each one may carry its own key, with a deployment-wide
 * `WEBSITE_KEY` as the fallback.
 *
 * SECURITY NOTE — deliberate deviation from the backend guide: the guide shows
 * `NEXT_PUBLIC_WEBSITE_KEY` because it assumes browser→backend calls. Here the
 * ApiClient runs server-side only, so the key is kept out of the JS bundle. Do
 * NOT add a `NEXT_PUBLIC_` prefix to these variables — a public key lets anyone
 * query the catalogue as that store.
 */

/** Header the backend reads to resolve the website. */
export const WEBSITE_KEY_HEADER = "X-Website-Key";

/**
 * Per-variant keys.
 *
 * The lookups are written out literally (not `process.env[name]`) because
 * Next.js only inlines statically-referenced env vars — a dynamic lookup
 * silently yields `undefined` in a built bundle. Add a line here when a new
 * variant gets its own store in the backend admin.
 */
const VARIANT_WEBSITE_KEYS: Record<string, string | undefined> = {
  "bn-01": process.env.WEBSITE_KEY_BN_01,
  "bn-02": process.env.WEBSITE_KEY_BN_02,
  "bn-03": process.env.WEBSITE_KEY_BN_03,
  "intl-01": process.env.WEBSITE_KEY_INTL_01,
  "intl-02": process.env.WEBSITE_KEY_INTL_02,
};

/** Deployment-wide fallback, used when a variant has no key of its own. */
const FALLBACK_WEBSITE_KEY = process.env.WEBSITE_KEY ?? "";

/**
 * Resolve the website key for a variant id. Returns an empty string when
 * neither a variant key nor the fallback is configured — the caller decides
 * whether that is fatal (the backend answers 401).
 */
export function getWebsiteKey(variantId: string | null | undefined): string {
  const scoped = variantId ? VARIANT_WEBSITE_KEYS[variantId] : undefined;
  return scoped?.trim() || FALLBACK_WEBSITE_KEY.trim();
}

/** True when at least one key is configured. Used to warn once at call time. */
export const HAS_ANY_WEBSITE_KEY =
  !!FALLBACK_WEBSITE_KEY.trim() ||
  Object.values(VARIANT_WEBSITE_KEYS).some((key) => !!key?.trim());

/**
 * The backend's message when the header is missing or does not match an
 * active, non-legacy website. Matched loosely so a wording change downgrades
 * to a generic error rather than breaking the check.
 */
export function isWebsiteKeyRejection(
  status: number,
  message: string | undefined
): boolean {
  return status === 401 && /x-website-key/i.test(message ?? "");
}

/**
 * Duck-typed read of the `websiteKeyError` flag the ApiClient sets. Response
 * types across the app are hand-written per route, so most of them do not
 * declare the field even though it is present at runtime.
 */
export function hasWebsiteKeyError(response: unknown): boolean {
  return (
    !!response &&
    typeof response === "object" &&
    (response as { websiteKeyError?: unknown }).websiteKeyError === true
  );
}
