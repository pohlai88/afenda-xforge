import { VERCEL_GEIST_TYPOGRAPHY_STYLES } from "@repo/design-system/contracts/afenda/references";
import type { CSSProperties } from "react";

export type GeistTypographyStyleName = keyof typeof VERCEL_GEIST_TYPOGRAPHY_STYLES;

/** Geist display sizes are pixel-based — Afenda globals clamp `text-*` utilities to 12px. */
export function geistTypeStyle(styleName: GeistTypographyStyleName): CSSProperties {
  const style = VERCEL_GEIST_TYPOGRAPHY_STYLES[styleName];

  return {
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing,
    lineHeight: style.lineHeight,
  };
}
