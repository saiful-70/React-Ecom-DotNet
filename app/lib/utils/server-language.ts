import "server-only";
import { cookies } from "next/headers";
import { getActiveVariant } from "@/variants/server";
import type { VariantLanguage } from "@/variants/types";

/**
 * Resolve the request UI language the same way the root layout does: the
 * `language` cookie when it is a supported value, otherwise the active variant's
 * default language. Use this in server actions to pass `lang` to backend APIs
 * that return localized content (e.g. bundles/combos).
 */
export async function getRequestLanguage(): Promise<VariantLanguage> {
  const cookieLang = (await cookies()).get("language")?.value;
  if (cookieLang === "en" || cookieLang === "bn") return cookieLang;
  return (await getActiveVariant()).defaultLanguage;
}
