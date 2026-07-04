import "server-only";
import { headers } from "next/headers";
import { VARIANT_HEADER } from "@/lib/config/variant.config";
import { getVariant } from "./registry";
import type { VariantDescriptor } from "./types";

/**
 * Resolve the active variant on the server, from the `x-variant` header the
 * middleware sets. Falls back to the configured default when absent.
 *
 * Use this in Server Components / server actions to read the theme, branding,
 * or feature flags of the current demo/deployment.
 */
export async function getActiveVariant(): Promise<VariantDescriptor> {
  const variantId = (await headers()).get(VARIANT_HEADER);
  return getVariant(variantId);
}
