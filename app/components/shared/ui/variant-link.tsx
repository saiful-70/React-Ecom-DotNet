"use client";

import NextLink from "next/link";
import { forwardRef, type ComponentProps } from "react";
import { useVariant } from "@/components/shared/providers/variant-provider";
import { variantHref, type VariantHrefInput } from "@/lib/utils/variant-href";

type NextLinkProps = ComponentProps<typeof NextLink>;

/**
 * Drop-in replacement for next/link that keeps navigation inside the active
 * demo variant. Same API as next/link — import it aliased as `Link` so call
 * sites don't change:
 *
 *   import { VariantLink as Link } from "@/components/shared/ui/variant-link";
 *
 * In client-deploy mode (no showcase) it behaves exactly like next/link.
 */
export const VariantLink = forwardRef<HTMLAnchorElement, NextLinkProps>(
  function VariantLink({ href, ...props }, ref) {
    const variant = useVariant();
    const nextHref = variantHref(
      href as VariantHrefInput,
      variant.id
    ) as NextLinkProps["href"];
    return <NextLink ref={ref} href={nextHref} {...props} />;
  }
);
