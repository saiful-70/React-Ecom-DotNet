"use client";

import { useState, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { cookieConsentAtom } from "@/store/cookie-consent.atom";
import { Button } from "@/components/shared/ui/button";
import { CookieIcon, Settings } from "lucide-react";
import { CookiePreferencesDialog } from "./CookiePreferencesDialog";
import { useTranslation } from "react-i18next";

export function CookieBanner() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [cookieConsent, setCookieConsent] = useAtom(cookieConsentAtom);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Only mount on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Publish the banner's real height as a CSS variable so other fixed-bottom
  // controls (e.g. the back-to-top button) can sit clear of it instead of being
  // overlapped. Tracks content/viewport changes via ResizeObserver.
  useEffect(() => {
    const el = bannerRef.current;
    const root = document.documentElement;
    if (!showBanner || !el) {
      root.style.removeProperty("--cookie-banner-height");
      return;
    }
    const setVar = () =>
      root.style.setProperty("--cookie-banner-height", `${el.offsetHeight}px`);
    setVar();
    const observer = new ResizeObserver(setVar);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--cookie-banner-height");
    };
  }, [showBanner]);

  // Check consent status after mount
  useEffect(() => {
    if (!mounted) return;

    // Show banner only if consent hasn't been given
    if (!cookieConsent.consentGiven) {
      // Delay showing banner slightly for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowBanner(false);
    }
  }, [mounted, cookieConsent.consentGiven]);

  const handleAcceptAll = () => {
    setCookieConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      consentGiven: true,
      consentDate: new Date().toISOString(),
    });
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    setCookieConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      consentGiven: true,
      consentDate: new Date().toISOString(),
    });
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowPreferences(true);
  };

  const handleSavePreferences = () => {
    setShowBanner(false);
    setShowPreferences(false);
  };

  // Don't render on server or if consent already given
  if (!mounted || !showBanner) {
    return null;
  }

  return (
    <>
      <div
        ref={bannerRef}
        className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500"
      >
        <div className="mx-auto max-w-7xl p-4">
          <div className="rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg">
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <CookieIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    {t("cookies.title", "We value your privacy")}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "cookies.description",
                    "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking 'Accept All', you consent to our use of cookies."
                  )}
                </p>
                <button
                  onClick={handleCustomize}
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Settings className="h-3 w-3" />
                  {t("cookies.customize", "Customize preferences")}
                </button>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectAll}
                  className="whitespace-nowrap"
                >
                  {t("cookies.rejectAll", "Reject All")}
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="whitespace-nowrap"
                >
                  {t("cookies.acceptAll", "Accept All")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CookiePreferencesDialog
        open={showPreferences}
        onOpenChange={setShowPreferences}
        onSave={handleSavePreferences}
      />
    </>
  );
}
