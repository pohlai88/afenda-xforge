export const SHADOW_TOKENS = ["xs", "sm", "md"] as const;

export type ShadowToken = (typeof SHADOW_TOKENS)[number];
