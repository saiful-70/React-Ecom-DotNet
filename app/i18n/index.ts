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

// Always initialize with the default language so the server and the client's
// first (hydration) render produce identical markup. The user's saved language
// is applied after mount in `I18nProvider` to avoid a hydration mismatch.
i18n.use(initReactI18next).init({
  resources,
  lng: "bn",
  fallbackLng: "bn",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
