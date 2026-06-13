/**
 * Compact Afenda typography scale.
 *
 * - read / head — 12px maximum for normal reading and topic titles
 * - caption / micro — sentence-case metadata below reading size
 * - label — 6px maximum for uppercase labels and chrome metadata
 */
import {
  AFENDA_FONT_FEATURE_TOKENS as AFENDA_TYPOGRAPHY_FONT_FEATURE_TOKENS,
  AFENDA_FONT_PRESETS,
  AFENDA_FONT_REGISTRY_VARIABLES,
  AFENDA_FONT_ROLES,
  AFENDA_TEXT_UTILITY_TOKENS as AFENDA_TYPOGRAPHY_TEXT_UTILITY_TOKENS,
  AFENDA_TYPE_SCALE_ROLES,
  AFENDA_TYPE_UTILITY_TOKENS,
  type AfendaFontRegistryVariable as FontRegistryVariable,
} from "../../contracts/afenda/registries/typography.registry";

export const TYPE_SCALE_ROLES = AFENDA_TYPE_SCALE_ROLES;
export const TYPE_UTILITY_TOKENS = AFENDA_TYPE_UTILITY_TOKENS;

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

export const TYPE_SCALE_DEFINITIONS: Record<
  TypeScaleRole,
  TypeScaleDefinition
> = {
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

export const FONT_FAMILY_TOKENS = AFENDA_FONT_ROLES;
export const FONT_FEATURE_TOKENS = AFENDA_TYPOGRAPHY_FONT_FEATURE_TOKENS;
export const TEXT_UTILITY_TOKENS = AFENDA_TYPOGRAPHY_TEXT_UTILITY_TOKENS;

export type FontFamilyToken = (typeof FONT_FAMILY_TOKENS)[number];

export type TypographyScaleSpec = {
  readonly role: TypeScaleRole;
  readonly utilityToken: TypeUtilityToken;
} & TypeScaleDefinition;

export type TypographyFontFamilySpec = {
  readonly cssVariable: FontRegistryVariable;
  readonly role: FontFamilyToken;
};

export type TypographyFontWeightSpec = {
  readonly fontWeight: string;
  readonly reference: `${TypeScaleDefinition["cssVarPrefix"]}-size`;
  readonly role: TypeScaleRole;
};

export type TypographyNumberSpec = {
  readonly letterSpacing: string;
  readonly reference: TypeUtilityToken;
  readonly role: TypeScaleRole;
};

const TYPOGRAPHY_FONT_FAMILY_CSS_VARIABLES = Object.fromEntries(
  AFENDA_FONT_PRESETS.map((preset) => [preset.role, preset.cssVariable])
) as Readonly<Record<FontFamilyToken, FontRegistryVariable>>;

export const TYPOGRAPHY_SCALE_SPECS = TYPE_SCALE_ROLES.map((role) => ({
  role,
  utilityToken: `type-${role}` as const,
  ...TYPE_SCALE_DEFINITIONS[role],
})) as readonly TypographyScaleSpec[];

export const TYPOGRAPHY_FONT_FAMILY_SPECS = FONT_FAMILY_TOKENS.map((role) => ({
  role,
  cssVariable: TYPOGRAPHY_FONT_FAMILY_CSS_VARIABLES[role],
})) as readonly TypographyFontFamilySpec[];

function hasFontWeight(
  spec: TypographyScaleSpec
): spec is TypographyScaleSpec & { readonly fontWeight: string } {
  return typeof spec.fontWeight === "string" && spec.fontWeight.length > 0;
}

function hasLetterSpacing(
  spec: TypographyScaleSpec
): spec is TypographyScaleSpec & { readonly letterSpacing: string } {
  return typeof spec.letterSpacing === "string" && spec.letterSpacing.length > 0;
}

export const TYPOGRAPHY_FONT_WEIGHT_SPECS = TYPOGRAPHY_SCALE_SPECS.filter(
  hasFontWeight
).map((spec) => ({
  role: spec.role,
  fontWeight: spec.fontWeight,
  reference: `${spec.cssVarPrefix}-size` as const,
})) as readonly TypographyFontWeightSpec[];

export const TYPOGRAPHY_NUMBER_SPECS = TYPOGRAPHY_SCALE_SPECS.filter(
  hasLetterSpacing
).map((spec) => ({
  role: spec.role,
  letterSpacing: spec.letterSpacing,
  reference: spec.utilityToken,
})) as readonly TypographyNumberSpec[];
