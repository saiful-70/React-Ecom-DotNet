"use client";

import { createContext, useContext, type PropsWithChildren } from "react";
import type { FeatureFlags, VariantDescriptor } from "@/variants/types";

/**
 * Makes the active variant descriptor available to client components so they
 * can read feature flags, branding, and language config without prop drilling.
 * The descriptor is resolved server-side (see app/variants/server.ts) and
 * passed down as a plain, serializable prop.
 */
const VariantContext = createContext<VariantDescriptor | null>(null);

export function VariantProvider({
  variant,
  children,
}: PropsWithChildren<{ variant: VariantDescriptor }>) {
  return (
    <VariantContext.Provider value={variant}>
      {children}
    </VariantContext.Provider>
  );
}

/** Read the active variant descriptor. Throws if used outside the provider. */
export function useVariant(): VariantDescriptor {
  const ctx = useContext(VariantContext);
  if (!ctx) {
    throw new Error("useVariant must be used within a VariantProvider");
  }
  return ctx;
}

/** Read a single feature flag for the active variant. */
export function useFeature(flag: keyof FeatureFlags): boolean {
  return useVariant().features[flag];
}
