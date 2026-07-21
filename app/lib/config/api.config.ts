// Ensure the site URL always has a scheme. A scheme-less value (e.g.
// "example.com") throws in `new URL()` / `metadataBase` and crashes the
// server-side render, and produces broken absolute links in SEO metadata.
const withScheme = (url: string): string =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

export const API_CONFIG = {
  SITE_URL: withScheme(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  API_BASE_URL: process.env.API_BASE_URL || "/api",
  API_BASE_URL_V1: process.env.API_BASE_URL_V1 || "/api/v1",
  NODE_ENV: process.env.NODE_ENV || "development",
};
