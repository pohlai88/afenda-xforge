import type AxeCore from "axe-core";

/**
 * jsdom cannot evaluate color-contrast (needs canvas + computed styles).
 * Structural a11y rules remain enforced per manifest renderer (MUI-VIS-016).
 */
export const metadataRendererAxeRules: AxeCore.RunOptions["rules"] = {
  "color-contrast": { enabled: false },
  region: { enabled: false },
};

export const metadataRendererAxeTags = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "best-practice",
] as const;
