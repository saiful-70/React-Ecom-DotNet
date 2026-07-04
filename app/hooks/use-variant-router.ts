"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useVariant } from "@/components/shared/providers/variant-provider";
import { variantHref } from "@/lib/utils/variant-href";

type AppRouter = ReturnType<typeof useRouter>;
type NavigateOptions = Parameters<AppRouter["push"]>[1];
type PrefetchOptions = Parameters<AppRouter["prefetch"]>[1];

/**
 * Drop-in replacement for next/navigation's useRouter that keeps push/replace/
 * prefetch inside the active demo variant. Import it aliased so call sites are
 * unchanged:
 *
 *   import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
 *
 * `back`, `forward`, and `refresh` are passed through untouched. In
 * client-deploy mode (no showcase) every method behaves like the real router.
 */
export function useVariantRouter(): AppRouter {
  const router = useRouter();
  const variant = useVariant();

  return useMemo<AppRouter>(
    () => ({
      ...router,
      push: (href: string, options?: NavigateOptions) =>
        router.push(variantHref(href, variant.id), options),
      replace: (href: string, options?: NavigateOptions) =>
        router.replace(variantHref(href, variant.id), options),
      prefetch: (href: string, options?: PrefetchOptions) =>
        router.prefetch(variantHref(href, variant.id), options),
    }),
    [router, variant.id]
  );
}
