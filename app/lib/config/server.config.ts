import { API_CONFIG } from "./api.config";

type CookieConfig = {
  path?: string;
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  priority?: "low" | "medium" | "high";
  maxAge?: number;
};

export const getCookieConfig = (
  config?: Partial<CookieConfig>
): CookieConfig => {
  const isProduction = API_CONFIG.NODE_ENV === "production";

  return {
    path: "/",
    // Only set domain in production, omit in development
    ...(isProduction && API_CONFIG.SITE_URL
      ? (() => {
          try {
            return {
              domain: new URL(API_CONFIG.SITE_URL).hostname.replace(/^www\./, ""),
            };
          } catch {
            // If SITE_URL is not a valid URL, omit domain
            return {};
          }
        })()
      : {}),
    // Enable secure cookies in production
    secure: isProduction,
    // Use 'lax' for better compatibility with redirects
    sameSite: "lax" as const,
    ...config,
  };
};
