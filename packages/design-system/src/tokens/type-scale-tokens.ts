/**
 * Compact Afenda typography scale.
 *
 * - read / head — 12px maximum for normal reading and topic titles
 * - caption / micro — sentence-case metadata below reading size
 * - label — 6px maximum for uppercase labels and chrome metadata
 */
export const TYPE_SCALE_ROLES = [
  "read",
  "head",
  "caption",
  "micro",
  "label",
] as const;

export const TYPE_UTILITY_TOKENS = [
  "type-read",
  "type-head",
  "type-caption",
  "type-micro",
  "type-label",
] as const;

export type TypeScaleRole = (typeof TYPE_SCALE_ROLES)[number];
export type TypeUtilityToken = (typeof TYPE_UTILITY_TOKENS)[number];

export type TypeScaleDefinition = {
  readonly cssVarPrefix: `--type-${TypeScaleRole}`;
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly fontWeight?: string;
  readonly letterSpacing?: string;
  readonly textTransform?: string;
};

export const TYPE_SCALE_DEFINITIONS: Record<TypeScaleRole, TypeScaleDefinition> = {
  read: {
    cssVarPrefix: "--type-read",
    fontSize: "0.75rem",
    lineHeight: "1.0833",
  },
  head: {
    cssVarPrefix: "--type-head",
    fontSize: "0.75rem",
    lineHeight: "1.0833",
    fontWeight: "500",
  },
  caption: {
    cssVarPrefix: "--type-caption",
    fontSize: "0.625rem",
    lineHeight: "1.2",
  },
  micro: {
    cssVarPrefix: "--type-micro",
    fontSize: "0.5rem",
    lineHeight: "1.25",
  },
  label: {
    cssVarPrefix: "--type-label",
    fontSize: "0.375rem",
    lineHeight: "1.167",
    fontWeight: "500",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
} as const;

/** Tailwind default text steps remapped to the compact reading scale. */
export const TAILWIND_TEXT_SIZE_OVERRIDES = {
  xs: { size: "0.625rem", lineHeight: "1.2" },
  sm: { size: "0.75rem", lineHeight: "1.0833" },
  base: { size: "0.75rem", lineHeight: "1.0833" },
  lg: { size: "0.75rem", lineHeight: "1.0833" },
  xl: { size: "0.75rem", lineHeight: "1.0833" },
  "2xl": { size: "0.75rem", lineHeight: "1.0833" },
  "3xl": { size: "0.75rem", lineHeight: "1.0833" },
  "4xl": { size: "0.75rem", lineHeight: "1.0833" },
  "5xl": { size: "0.75rem", lineHeight: "1.0833" },
  "6xl": { size: "0.75rem", lineHeight: "1.0833" },
  "7xl": { size: "0.75rem", lineHeight: "1.0833" },
  "8xl": { size: "0.75rem", lineHeight: "1.0833" },
  "9xl": { size: "0.75rem", lineHeight: "1.0833" },
} as const;
