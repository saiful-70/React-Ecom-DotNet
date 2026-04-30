"use client";

import Script from "next/script";
import { useEffect } from "react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { usePathname, useSearchParams } from "next/navigation";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Meta Pixel (Facebook Pixel) Component
 * Only loads if user has consented to marketing cookies
 */
export function MetaPixel() {
  const { canUseMarketing, consentGiven } = useCookieConsent();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views when route changes
  useEffect(() => {
    if (canUseMarketing && META_PIXEL_ID && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname, searchParams, canUseMarketing]);

  // Don't render if consent not given, no pixel ID, or marketing disabled
  if (!consentGiven || !META_PIXEL_ID || !canUseMarketing) {
    return null;
  }

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
					!function(f,b,e,v,n,t,s)
					{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
					n.callMethod.apply(n,arguments):n.queue.push(arguments)};
					if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
					n.queue=[];t=b.createElement(e);t.async=!0;
					t.src=v;s=b.getElementsByTagName(e)[0];
					s.parentNode.insertBefore(t,s)}(window, document,'script',
					'https://connect.facebook.net/en_US/fbevents.js');
					fbq('init', '${META_PIXEL_ID}');
					fbq('track', 'PageView');
				`,
      }}
    />
  );
}

/**
 * Track custom events with Meta Pixel
 * Only tracks if user has consented to marketing
 *
 * `eventId` enables CAPI deduplication — pass the same id to /api/meta-capi.
 */
export const trackMetaEvent = (
  eventName: string,
  parameters?: Record<string, string | number | boolean | string[]>,
  eventId?: string
) => {
  if (typeof window !== "undefined" && window.fbq && META_PIXEL_ID) {
    if (eventId) {
      window.fbq("track", eventName, parameters, { eventID: eventId });
    } else {
      window.fbq("track", eventName, parameters);
    }
  }
};

/**
 * Track e-commerce events
 */
export const trackMetaPurchase = (
  value: number,
  currency: string = "BDT",
  contentIds: string[] = [],
  contentType: string = "product",
  eventId?: string
) => {
  trackMetaEvent(
    "Purchase",
    {
      value,
      currency,
      content_ids: contentIds,
      content_type: contentType,
    },
    eventId
  );
};

export const trackMetaAddToCart = (
  contentId: string,
  contentName: string,
  value: number,
  currency: string = "BDT",
  eventId?: string
) => {
  trackMetaEvent(
    "AddToCart",
    {
      content_ids: [contentId],
      content_name: contentName,
      content_type: "product",
      value,
      currency,
    },
    eventId
  );
};

export const trackMetaViewContent = (
  contentId: string,
  contentName: string,
  value: number,
  currency: string = "BDT",
  contentCategory?: string,
  eventId?: string
) => {
  const params: Record<string, string | number | boolean | string[]> = {
    content_ids: [contentId],
    content_name: contentName,
    content_type: "product",
    value,
    currency,
  };

  if (contentCategory) {
    params.content_category = contentCategory;
  }

  trackMetaEvent("ViewContent", params, eventId);
};

export const trackMetaSearch = (searchString: string) => {
  trackMetaEvent("Search", {
    search_string: searchString,
  });
};

export const trackMetaInitiateCheckout = (
  value: number,
  currency: string = "BDT",
  contentIds: string[] = [],
  numItems: number = 0,
  eventId?: string
) => {
  trackMetaEvent(
    "InitiateCheckout",
    {
      value,
      currency,
      content_ids: contentIds,
      content_type: "product",
      num_items: numItems,
    },
    eventId
  );
};

export const trackMetaLead = () => {
  trackMetaEvent("Lead");
};

export const trackMetaCompleteRegistration = () => {
  trackMetaEvent("CompleteRegistration");
};

export const trackMetaAddToWishlist = (
  contentId: string,
  contentName: string,
  value: number,
  currency: string = "BDT"
) => {
  trackMetaEvent("AddToWishlist", {
    content_ids: [contentId],
    content_name: contentName,
    content_type: "product",
    value,
    currency,
  });
};

// TypeScript declarations
declare global {
  interface Window {
    fbq: (
      type: string,
      eventName: string,
      parameters?: Record<string, string | number | boolean | string[]>,
      options?: { eventID?: string }
    ) => void;
    _fbq: Record<string, unknown>;
  }
}
