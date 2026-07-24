/** Accept only same-origin relative paths: "/x" but not "//x", "/\x" or schemes. */
export const safeRedirectPath = (raw: string | null, fallback: string): string => {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return fallback;
  }
  return raw;
};
