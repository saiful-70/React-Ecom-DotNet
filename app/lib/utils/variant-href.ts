import { DEMO_PREFIX, SHOWCASE_MODE } from "@/lib/config/variant.config";

/**
 * Href shapes accepted by next/link and next/navigation: a string path or a
 * URL-object with a `pathname`.
 */
export type VariantHrefInput =
  | string
  | ({ pathname?: string | null } & Record<string, unknown>);

/**
 * Prefix an internal href with the current demo's `/demo/<id>` segment so that
 * navigation stays inside the active variant in showcase mode.
 *
 * No-op when:
 *  - not in showcase mode (client deploys serve at `/` with no prefix),
 *  - the href is external / relative / a hash / mailto: / tel:,
 *  - the href is already prefixed (idempotent — some callers pass a prefixed
 *    `usePathname()` value straight back in).
 */
export function variantHref<T extends VariantHrefInput>(
  href: T,
  variantId: string,
  showcase: boolean = SHOWCASE_MODE
): T {
  if (!showcase) return href;

  if (typeof href === "string") {
    return prefixPath(href, variantId) as T;
  }

  if (href && typeof href === "object" && typeof href.pathname === "string") {
    return { ...href, pathname: prefixPath(href.pathname, variantId) } as T;
  }

  return href;
}

function prefixPath(path: string, variantId: string): string {
  // Only internal absolute paths get prefixed.
  if (!path.startsWith("/")) return path; // relative, #hash, mailto:, tel:, http(s)
  if (path.startsWith("//")) return path; // protocol-relative external

  // Already inside a demo prefix → leave as-is (idempotent).
  if (path === DEMO_PREFIX || path.startsWith(`${DEMO_PREFIX}/`)) return path;

  const base = `${DEMO_PREFIX}/${variantId}`;
  return path === "/" ? base : `${base}${path}`;
}
