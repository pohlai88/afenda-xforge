/**
 * Semantic visual token families for metadata-ui production surfaces (MUI-VIS-014).
 * Renderers and components must compose @repo/ui primitives with these tokens —
 * not raw palette utilities or inline color literals.
 */
export const SEMANTIC_SURFACE_TOKENS = [
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

export const SEMANTIC_STATUS_TOKENS = [
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

export const VISUAL_TOKEN_RULES = [
  "Use semantic Tailwind tokens mapped from globals.css (@theme inline).",
  "Compose form controls and actions from @repo/ui — no raw HTML inputs or buttons.",
  "Prefer CSS variables (var(--primary)) in inline styles when tokens need runtime opacity.",
  "Do not use raw palette utilities (gray, slate, zinc, neutral, stone).",
] as const;

export type SemanticSurfaceToken = (typeof SEMANTIC_SURFACE_TOKENS)[number];
export type SemanticStatusToken = (typeof SEMANTIC_STATUS_TOKENS)[number];
export type VisualTokenRule = (typeof VISUAL_TOKEN_RULES)[number];
