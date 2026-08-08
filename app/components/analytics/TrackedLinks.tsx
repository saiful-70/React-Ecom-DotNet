"use client";

/**
 * Client link wrappers that emit a browser analytics event on click.
 *
 * Server Components can't pass an `onClick` handler to a link, so template
 * layouts that render banners or promo CTAs server-side (e.g. `BazarHome`)
 * use these instead of wiring `trackBannerClick` themselves. All props are
 * serializable, so they cross the server→client boundary cleanly.
 */

import type { ComponentProps, MouseEvent } from "react";
import { VariantLink } from "@/components/shared/ui/variant-link";
import { trackBannerClick, trackPromotionClick } from "@/lib/analytics/tracking";

type LinkProps = ComponentProps<typeof VariantLink>;

type BannerLinkProps = LinkProps & {
  bannerId?: number | string;
  bannerName?: string;
};

export function BannerLink({
  bannerId,
  bannerName,
  onClick,
  ...linkProps
}: BannerLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    void trackBannerClick({ bannerId, bannerName });
    onClick?.(event);
  };

  return <VariantLink {...linkProps} onClick={handleClick} />;
}

type PromotionLinkProps = LinkProps & {
  promotionId?: number | string;
  code?: string;
};

export function PromotionLink({
  promotionId,
  code,
  onClick,
  ...linkProps
}: PromotionLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    void trackPromotionClick({ promotionId, code });
    onClick?.(event);
  };

  return <VariantLink {...linkProps} onClick={handleClick} />;
}
