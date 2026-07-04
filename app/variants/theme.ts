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

  // Use slightly higher-specificity selectors than globals.css (`:root` / `.dark`)
  // so these overrides always win regardless of stylesheet injection order:
  //   `:root:root`  (0,2,0) beats `:root`  (0,1,0)
  //   `:root.dark`  (0,2,0) beats `.dark`  (0,1,0)
  if (Object.keys(root).length > 0) {
    blocks.push(`:root:root{${toDecls(root)}}`);
  }
  if (Object.keys(dark).length > 0) {
    blocks.push(`:root.dark{${toDecls(dark)}}`);
  }

  return blocks.join("");
}
