"use client";

import { useTranslation } from "react-i18next";
import { Check, Globe } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shared/ui/dropdown-menu";
import { useFeature, useVariant } from "@/components/shared/providers/variant-provider";
import type { VariantLanguage } from "@/variants/types";
import { cn } from "@/lib/utils/utils";

/** Native name per supported language. Only `bn` and `en` are wired (see app/i18n). */
const LANGUAGE_NAMES: Record<VariantLanguage, string> = {
  bn: "বাংলা",
  en: "English",
};

/** Short label for the trigger when a template wants the code beside the globe. */
const LANGUAGE_SHORT: Record<VariantLanguage, string> = {
  bn: "বাং",
  en: "EN",
};

interface LanguageSwitcherProps {
  /** Extra classes for the trigger, so each template can dress it in-world. */
  className?: string;
  /** Show the active language's short label beside the globe. */
  showLabel?: boolean;
  /** Which side of the trigger the menu aligns to. */
  align?: "start" | "center" | "end";
}

/**
 * Language switcher, driven by the active variant.
 *
 * It renders the variant's OWN `availableLanguages` rather than a hardcoded
 * list, self-gates on the `languageSwitcher` feature flag, and disappears
 * entirely when a deployment offers fewer than two languages — so a call site
 * can drop it into any chrome without repeating those checks.
 */
export const LanguageSwitcher = ({
  className,
  showLabel = false,
  align = "end",
}: LanguageSwitcherProps) => {
  const { t, i18n } = useTranslation();
  const variant = useVariant();
  const enabled = useFeature("languageSwitcher");

  const languages = variant.availableLanguages.filter(
    (code): code is VariantLanguage => code in LANGUAGE_NAMES
  );

  // Nothing to switch between: render nothing rather than a dead control.
  if (!enabled || languages.length < 2) return null;

  const active = (
    languages.includes(i18n.language as VariantLanguage)
      ? i18n.language
      : variant.defaultLanguage
  ) as VariantLanguage;

  const changeLanguage = (languageCode: VariantLanguage) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem("language", languageCode);
    // Cookie lets the server render the right language on the next request,
    // keeping SSR and client hydration in sync (see I18nProvider).
    document.cookie = `language=${languageCode}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={showLabel ? "sm" : "icon"}
          className={cn(showLabel ? "h-9 gap-1.5 px-2" : "h-9 w-9", className)}
          aria-label={t("a11y.changeLanguage")}
        >
          <Globe className="h-4 w-4" aria-hidden />
          {showLabel && (
            <span className="text-xs font-semibold">{LANGUAGE_SHORT[active]}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {languages.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => changeLanguage(code)}
            className="cursor-pointer gap-2"
            aria-current={active === code}
          >
            <Check
              className={cn("h-3.5 w-3.5", active !== code && "opacity-0")}
              aria-hidden
            />
            {LANGUAGE_NAMES[code]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
