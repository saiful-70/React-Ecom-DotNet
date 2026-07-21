import type { BusinessSettingsModel } from "@/components/shared/types/BusinessSettingModel";

/**
 * Variant system types.
 *
 * A "variant" is a single demo/deployment of the storefront expressed as DATA
 * (theme + feature flags + branding), not a code fork. The same descriptors
 * power two run modes:
 *  - Showcase mode: every variant is browsable at `/demo/<id>/...`.
 *  - Client deploy mode: one variant is pinned via `ACTIVE_VARIANT` env.
 *
 * See app/variants/registry.ts for the registry and docs/… plan for the design.
 */

/** Which market a variant targets. Drives default language + locale defaults. */
export type Market = "intl" | "bn";

export type VariantLanguage = "en" | "bn";

/**
 * Which layout paradigm (template) a variant renders through. A template is a
 * registry of presentation components (chrome + page layouts) under
 * app/templates/<id>/. Templates are code; variants select one by id, so this
 * union — not component imports — is all the variant layer knows about them.
 */
export type TemplateId = "classic" | "bazar" | "global";

/**
 * Feature flags gate whole pages/sections/functionality per variant.
 * Keep this list flat and typed — no stringly-typed lookups.
 */
export interface FeatureFlags {
  /** Floating AI chat widget. */
  chatWidget: boolean;
  /** Wishlist add/remove + wishlist page. */
  wishlist: boolean;
  /** Product reviews & ratings blocks. */
  reviews: boolean;
  /** Homepage "Featured products" section (#featured-products). */
  featuredProducts: boolean;
  /** Homepage "Today's deals" section (#today-deals). */
  todaysDeals: boolean;
  /** Homepage "Top selling" section (#top-selling). */
  topSelling: boolean;
  /** Campaign landing pages under /campaigns. */
  campaigns: boolean;
  /** GDPR cookie-consent banner. */
  cookieConsent: boolean;
  /** In-header language switcher. */
  languageSwitcher: boolean;
}

/**
 * CSS-variable overrides applied on top of the globals.css defaults.
 * Keys are variable names WITHOUT the leading `--` (e.g. `primary`, not
 * `--primary`); values are raw HSL triples like "262.1 83.3% 57.8%".
 */
export interface VariantThemeTokens {
  /** Overrides applied to :root (light mode). */
  root?: Record<string, string>;
  /** Overrides applied to .dark (dark mode). */
  dark?: Record<string, string>;
}

/**
 * A complete demo/deployment definition. Everything that differs between
 * variants lives here as serializable data so a descriptor can be passed
 * straight from a Server Component to the client VariantProvider.
 */
export interface VariantDescriptor {
  /** Stable id, used in URLs (`/demo/<id>`) and env (`ACTIVE_VARIANT=<id>`). */
  id: string;
  market: Market;
  /** Layout paradigm rendered for this variant (see app/templates/registry.ts). */
  template: TemplateId;
  /** Human-facing name shown in the showcase gallery/switcher. */
  name: string;
  /** Short blurb for the gallery card. */
  description: string;
  /** CSS-variable overrides layered over globals.css. */
  theme: VariantThemeTokens;
  /**
   * Branding overrides merged into business settings
   * (order: defaults → variant.branding → backend API data).
   */
  branding: Partial<BusinessSettingsModel>;
  /** Language used when the visitor has no `language` cookie yet. */
  defaultLanguage: VariantLanguage;
  /** Languages offered in this variant's switcher. */
  availableLanguages: VariantLanguage[];
  features: FeatureFlags;
}
