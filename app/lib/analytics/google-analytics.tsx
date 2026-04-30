"use client";

import Script from "next/script";
import { useEffect } from "react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { usePathname, useSearchParams } from "next/navigation";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Google Analytics Component
 * Only loads if user has consented to analytics cookies
 */
export function GoogleAnalytics() {
  const { canUseAnalytics, consentGiven } = useCookieConsent();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views when route changes
  useEffect(() => {
    if (canUseAnalytics && GA_MEASUREMENT_ID && window.gtag) {
      const url = pathname + (searchParams.toString() ? `?${searchParams}` : "");
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, canUseAnalytics]);

  // Don't render if consent not given, no GA ID, or analytics disabled
  if (!consentGiven || !GA_MEASUREMENT_ID || !canUseAnalytics) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());
						gtag('config', '${GA_MEASUREMENT_ID}', {
							page_path: window.location.pathname,
							anonymize_ip: true,
							cookie_flags: 'SameSite=None;Secure'
						});
					`,
        }}
      />
    </>
  );
}

interface GAEventParameters {
  [key: string]: string | number | boolean | string[] | Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Track custom events with Google Analytics
 * Only tracks if user has consented to analytics
 */
export const trackGAEvent = (
  eventName: string,
  parameters?: GAEventParameters
) => {
  if (typeof window !== "undefined" && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag("event", eventName, parameters as Record<string, string | number | boolean | Record<string, unknown> | string[]>);
  }
};

export interface GAPurchaseItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}

/**
 * Track e-commerce events
 */
export const trackPurchase = (
  transactionId: string,
  value: number,
  currency: string = "BDT",
  items: GAPurchaseItem[] = []
) => {
  trackGAEvent("purchase", {
    transaction_id: transactionId,
    value,
    currency,
    items: items as unknown as Record<string, unknown>[],
  });
};

export const trackAddToCart = (
  itemId: string,
  itemName: string,
  price: number,
  quantity: number = 1
) => {
  trackGAEvent("add_to_cart", {
    currency: "BDT",
    value: price * quantity,
    items: [
      {
        item_id: itemId,
        item_name: itemName,
        price,
        quantity,
      },
    ],
  });
};

export const trackViewItem = (
  itemId: string,
  itemName: string,
  price: number,
  category?: string
) => {
  trackGAEvent("view_item", {
    currency: "BDT",
    value: price,
    items: [
      {
        item_id: itemId,
        item_name: itemName,
        price,
        item_category: category,
      },
    ],
  });
};

export const trackSearch = (searchTerm: string) => {
  trackGAEvent("search", {
    search_term: searchTerm,
  });
};

export const trackBeginCheckout = (value: number, items: GAPurchaseItem[] = []) => {
  trackGAEvent("begin_checkout", {
    currency: "BDT",
    value,
    items: items as unknown as Record<string, unknown>[],
  });
};

// TypeScript declarations
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, string | number | boolean | string[] | Record<string, unknown>>
    ) => void;
    dataLayer: Record<string, unknown>[];
  }
}
