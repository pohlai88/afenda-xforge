export const FONT_FAMILY_TOKENS = ["sans", "mono", "serif", "heading"] as const;

export const FONT_FEATURE_TOKENS = ["rlig", "calt", "tnum"] as const;

export const TEXT_UTILITY_TOKENS = ["text-tabular"] as const;

export type FontFamilyToken = (typeof FONT_FAMILY_TOKENS)[number];
export type FontFeatureToken = (typeof FONT_FEATURE_TOKENS)[number];
export type TextUtilityToken = (typeof TEXT_UTILITY_TOKENS)[number];
