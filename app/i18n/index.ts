import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "./locales/en.json";
import bnTranslations from "./locales/bn.json";

const resources = {
  en: {
    translation: enTranslations,
  },
  bn: {
    translation: bnTranslations,
  },
};

// Shared init options, reused both by the module-level singleton below and
// by the per-request i18next instance `I18nProvider` builds for SSR (see
// `app/components/shared/providers/i18n-provider.tsx`). Keeping them in one
// place ensures the two never drift apart.
export const i18nOptions = {
  resources,
  lng: "bn",
  fallbackLng: "bn",
  interpolation: {
    escapeValue: false,
  },
};

// Module-level singleton, initialized with the default language. `I18nProvider`
// no longer mutates this instance during SSR — it creates a fresh,
// per-request i18next instance instead, so concurrent server renders in
// different languages can't race on (and bleed through) shared state. This
// singleton is kept initialized for any code that imports `@/i18n` directly,
// outside of the provider's React tree.
i18n.use(initReactI18next).init(i18nOptions);

export default i18n;
