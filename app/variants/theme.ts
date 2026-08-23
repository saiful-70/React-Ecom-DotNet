import type { VariantDescriptor } from "./types";

/**
 * Build the CSS text that layers a variant's token overrides on top of the
 * globals.css defaults. Emitted as an inline <style> in the server-rendered
 * <head> so the variant theme is present on first paint (no flash).
 *
 * Returns an empty string when the variant has no overrides (e.g. bn-01, whose
 * palette IS the globals.css default).
 */
export function buildVariantThemeCss(variant: VariantDescriptor): string {
  const blocks: string[] = [];

  const root = variant.theme.root ?? {};
  const dark = variant.theme.dark ?? {};

  const toDecls = (tokens: Record<string, string>) =>
    Object.entries(tokens)
      .map(([name, value]) => `--${name}: ${value};`)
      .join(" ");

  // Use higher-specificity selectors than every globals.css layer so these
  // overrides always win regardless of stylesheet injection order:
  //   template worlds use `html[data-template="…"]`        (0,1,1)
  //   and their dark blocks `html[data-template="…"].dark` (0,2,1)
  //   `:root:root:root`       (0,3,0) beats both light layers
  //   `:root:root:root.dark`  (0,4,0) beats the dark layers
  if (Object.keys(root).length > 0) {
    blocks.push(`:root:root:root{${toDecls(root)}}`);
  }
  if (Object.keys(dark).length > 0) {
    blocks.push(`:root:root:root.dark{${toDecls(dark)}}`);
  }

  return blocks.join("");
}
