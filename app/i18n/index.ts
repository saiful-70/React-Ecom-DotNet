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

const savedLanguage =
  typeof window !== "undefined"
    ? localStorage.getItem("language") || "bn"
    : "bn";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "bn",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
