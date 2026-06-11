export const FONT_FAMILY_TOKENS = ["sans", "mono", "serif", "heading"] as const;

export const FONT_FEATURE_TOKENS = ["rlig", "calt", "tnum"] as const;

export const TEXT_UTILITY_TOKENS = ["text-tabular"] as const;

export type {
  TypeScaleDefinition,
  TypeScaleRole,
  TypeUtilityToken,
} from "./type-scale-tokens";
export {
  TAILWIND_TEXT_SIZE_OVERRIDES,
  TYPE_SCALE_DEFINITIONS,
  TYPE_SCALE_ROLES,
  TYPE_UTILITY_TOKENS,
} from "./type-scale-tokens";

export type FontFamilyToken = (typeof FONT_FAMILY_TOKENS)[number];
export type FontFeatureToken = (typeof FONT_FEATURE_TOKENS)[number];
export type TextUtilityToken = (typeof TEXT_UTILITY_TOKENS)[number];
