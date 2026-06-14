/**
 * Semantic visual token allowlist — design-system authority for production surfaces.
 * Consumers compose @repo/ui primitives with these Tailwind classes only.
 */
export const AFENDA_SEMANTIC_SURFACE_TOKENS = [
  "bg-background",
  "bg-card",
  "bg-muted",
  "bg-primary",
  "bg-secondary",
  "bg-accent",
  "bg-popover",
  "text-foreground",
  "text-muted-foreground",
  "text-primary",
  "text-secondary-foreground",
  "border-border",
  "border-input",
  "ring-ring",
] as const;

export const AFENDA_LANE_ACCENT_TOKENS = [
  "text-lane-active",
  "text-lane-active-foreground",
  "text-lane-active-muted-foreground",
  "bg-lane-active",
  "bg-lane-active-muted",
  "border-lane-active-border",
  "shadow-lane-active-glow",
] as const;

export const AFENDA_LANE_ACCENT_USAGE_RULES = [
  "Lane tokens scope module identity (90% neutral / 7% lane / 3% status).",
  "Use lane accents for active nav, module badges, and chart accents only.",
  "Do not use lane tokens for primary CTAs, form focus rings, or operational status.",
  "Resolve lanes via FeatureLaneScope, presentation metadata lane field, or tenant branding settings — not ad-hoc palette classes.",
] as const;

export const AFENDA_SEMANTIC_STATUS_TOKENS = [
  "text-destructive",
  "text-destructive-foreground",
  "text-success",
  "text-success-muted-foreground",
  "text-warning",
  "text-warning-muted-foreground",
  "text-info",
  "text-info-muted-foreground",
  "bg-destructive",
  "bg-success",
  "bg-warning",
  "bg-info",
] as const;

export const AFENDA_VISUAL_TOKEN_RULES = [
  "Use semantic Tailwind tokens mapped from globals.css (@theme inline).",
  "Compose form controls and actions from @repo/ui — no raw HTML inputs or buttons.",
  "Prefer CSS variables (var(--primary)) in inline styles when tokens need runtime opacity.",
  "Do not use raw palette utilities (gray, slate, zinc, neutral, stone).",
] as const;

export type AfendaSemanticSurfaceToken =
  (typeof AFENDA_SEMANTIC_SURFACE_TOKENS)[number];
export type AfendaLaneAccentToken = (typeof AFENDA_LANE_ACCENT_TOKENS)[number];
export type AfendaLaneAccentUsageRule =
  (typeof AFENDA_LANE_ACCENT_USAGE_RULES)[number];
export type AfendaSemanticStatusToken =
  (typeof AFENDA_SEMANTIC_STATUS_TOKENS)[number];
export type AfendaVisualTokenRule = (typeof AFENDA_VISUAL_TOKEN_RULES)[number];

export const AFENDA_ALLOWED_VISUAL_TOKENS = [
  ...AFENDA_SEMANTIC_SURFACE_TOKENS,
  ...AFENDA_LANE_ACCENT_TOKENS,
  ...AFENDA_SEMANTIC_STATUS_TOKENS,
] as const;

export type AfendaAllowedVisualToken =
  (typeof AFENDA_ALLOWED_VISUAL_TOKENS)[number];

export function isAfendaAllowedVisualToken(
  token: string
): token is AfendaAllowedVisualToken {
  return (AFENDA_ALLOWED_VISUAL_TOKENS as readonly string[]).includes(token);
}

/** Serializable mirror contract for @repo/metadata-ui parity checks (filesystem / CI). */
export const AFENDA_METADATA_UI_MIRROR = {
  densityModes: ["compact", "default", "comfortable"] as const,
  densityCssHooks: {
    controlHeightVar: "--density-control-height",
    tableRowHeightVar: "--density-table-row-height",
    controlUtility: "control-density",
    rowUtility: "row-density",
  },
  laneAccentTokens: AFENDA_LANE_ACCENT_TOKENS,
  laneAccentUsageRules: AFENDA_LANE_ACCENT_USAGE_RULES,
  semanticStatusTokens: AFENDA_SEMANTIC_STATUS_TOKENS,
  semanticSurfaceTokens: AFENDA_SEMANTIC_SURFACE_TOKENS,
  visualTokenRules: AFENDA_VISUAL_TOKEN_RULES,
} as const;

export type AfendaMetadataUiMirror = typeof AFENDA_METADATA_UI_MIRROR;
