import { z } from "zod";

import { defineRegistry } from "../../registry.schema";
import { AFENDA_COLOR_MODES } from "../design-system.contract";

export const AFENDA_COLOR_TOKEN_REGISTRY_ID =
  "afenda.color-token-registry" as const;
export const AFENDA_COLOR_TOKEN_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_BASE_COLOR_TOKENS = defineRegistry([
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "surface",
  "surface-foreground",
  "surface-muted",
  "surface-accent",
  "muted",
  "muted-foreground",
  "border",
  "input",
  "ring",
]);

export const AFENDA_SURFACE_COLOR_TOKENS = defineRegistry([
  "surface",
  "surface-foreground",
  "surface-muted",
  "surface-accent",
]);

export const AFENDA_BRAND_COLOR_TOKENS = defineRegistry([
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "accent",
  "accent-foreground",
]);

export const AFENDA_SEMANTIC_COLOR_TOKENS = defineRegistry([
  ...AFENDA_BASE_COLOR_TOKENS,
  ...AFENDA_BRAND_COLOR_TOKENS,
]);

export const AFENDA_STATUS_COLOR_TOKENS = defineRegistry([
  "success",
  "success-foreground",
  "success-muted",
  "success-muted-foreground",
  "success-border",
  "warning",
  "warning-foreground",
  "warning-muted",
  "warning-muted-foreground",
  "warning-border",
  "destructive",
  "destructive-foreground",
  "destructive-muted",
  "destructive-muted-foreground",
  "destructive-border",
  "invert",
  "invert-foreground",
  "info",
  "info-foreground",
  "info-muted",
  "info-muted-foreground",
  "info-border",
]);

export const AFENDA_SIDEBAR_COLOR_TOKENS = defineRegistry([
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
]);

export const AFENDA_COLOR_TOKEN_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:theming-contract",
  "AFENDA:visual-design-contract",
  "AFENDA:theme-token-contract",
  "AFENDA:quality-gate-contract",
  "APCA",
  "WCAG:1.4.3",
] as const;

export type AfendaColorTokenMode = (typeof AFENDA_COLOR_MODES)[number];
export type AfendaBaseColorToken = (typeof AFENDA_BASE_COLOR_TOKENS)[number];
export type AfendaBrandColorToken = (typeof AFENDA_BRAND_COLOR_TOKENS)[number];
export type AfendaSurfaceColorToken =
  (typeof AFENDA_SURFACE_COLOR_TOKENS)[number];
export type AfendaSemanticColorToken =
  (typeof AFENDA_SEMANTIC_COLOR_TOKENS)[number];
export type AfendaStatusColorToken =
  (typeof AFENDA_STATUS_COLOR_TOKENS)[number];
export type AfendaSidebarColorToken =
  (typeof AFENDA_SIDEBAR_COLOR_TOKENS)[number];

export type AfendaColorToken =
  | AfendaBaseColorToken
  | AfendaBrandColorToken
  | AfendaSurfaceColorToken
  | AfendaStatusColorToken
  | AfendaSidebarColorToken;

export const afendaColorTokenModeSchema = z.enum(AFENDA_COLOR_MODES);
export const afendaBaseColorTokenSchema = z.enum(AFENDA_BASE_COLOR_TOKENS);
export const afendaBrandColorTokenSchema = z.enum(AFENDA_BRAND_COLOR_TOKENS);
export const afendaSurfaceColorTokenSchema = z.enum(
  AFENDA_SURFACE_COLOR_TOKENS
);
export const afendaSemanticColorTokenSchema = z.enum(
  AFENDA_SEMANTIC_COLOR_TOKENS
);
export const afendaStatusColorTokenSchema = z.enum(AFENDA_STATUS_COLOR_TOKENS);
export const afendaSidebarColorTokenSchema = z.enum(
  AFENDA_SIDEBAR_COLOR_TOKENS
);

export const afendaColorTokenRegistrySchema = z
  .object({
    base: z.array(afendaBaseColorTokenSchema).min(1).readonly(),
    brand: z.array(afendaBrandColorTokenSchema).min(1).readonly(),
    colorModes: z.array(afendaColorTokenModeSchema).min(1).readonly(),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_COLOR_TOKEN_REGISTRY_ID),
    semantic: z.array(afendaSemanticColorTokenSchema).min(1).readonly(),
    sidebar: z.array(afendaSidebarColorTokenSchema).min(1).readonly(),
    status: z.array(afendaStatusColorTokenSchema).min(1).readonly(),
    surface: z.array(afendaSurfaceColorTokenSchema).min(1).readonly(),
    version: z.literal(AFENDA_COLOR_TOKEN_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.surface.every((token) => registry.base.includes(token)) &&
      registry.semantic.length === registry.base.length + registry.brand.length,
    "Afenda color registry semantic and surface groups must stay aligned"
  );

export const afendaColorTokenRegistry = {
  id: AFENDA_COLOR_TOKEN_REGISTRY_ID,
  version: AFENDA_COLOR_TOKEN_REGISTRY_VERSION,
  colorModes: AFENDA_COLOR_MODES,
  base: AFENDA_BASE_COLOR_TOKENS,
  surface: AFENDA_SURFACE_COLOR_TOKENS,
  brand: AFENDA_BRAND_COLOR_TOKENS,
  semantic: AFENDA_SEMANTIC_COLOR_TOKENS,
  status: AFENDA_STATUS_COLOR_TOKENS,
  sidebar: AFENDA_SIDEBAR_COLOR_TOKENS,
  governanceReferences: AFENDA_COLOR_TOKEN_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaColorTokenRegistry(): void {
  afendaColorTokenRegistrySchema.parse(afendaColorTokenRegistry);
}

export const AFENDA_STATUS_TONE_REGISTRY_ID =
  "afenda.status-tone-registry" as const;
export const AFENDA_STATUS_TONE_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_STATUS_TONES = defineRegistry([
  "neutral",
  "success",
  "warning",
  "destructive",
  "info",
]);

export const AFENDA_STATUS_INTENTS = defineRegistry([
  "default",
  "muted",
  "solid",
  "outline",
]);

export const AFENDA_STATUS_TONE_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:data-display-contract",
  "AFENDA:visual-design-contract",
  "AFENDA:copy-contract",
  "AFENDA:theming-contract",
  "AFENDA:component-variant-registry",
  "WCAG:1.4.1",
] as const;

export type AfendaStatusTone = (typeof AFENDA_STATUS_TONES)[number];
export type AfendaStatusIntent = (typeof AFENDA_STATUS_INTENTS)[number];

export type AfendaStatusToneBinding = {
  intent: AfendaStatusIntent;
  label: string;
  tone: AfendaStatusTone;
};

export const afendaStatusToneSchema = z.enum(AFENDA_STATUS_TONES);
export const afendaStatusIntentSchema = z.enum(AFENDA_STATUS_INTENTS);

export const afendaStatusToneBindingSchema = z
  .object({
    intent: afendaStatusIntentSchema,
    label: z.string().trim().min(1),
    tone: afendaStatusToneSchema,
  })
  .strict();

export const afendaStatusToneRegistrySchema = z
  .object({
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_STATUS_TONE_REGISTRY_ID),
    intents: z.array(afendaStatusIntentSchema).min(1).readonly(),
    tones: z.array(afendaStatusToneSchema).min(1).readonly(),
    version: z.literal(AFENDA_STATUS_TONE_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.tones.includes("neutral") &&
      registry.tones.includes("destructive") &&
      registry.intents.includes("outline"),
    "Afenda status tone registry must include neutral, destructive, and outline vocabulary"
  );

export const afendaStatusToneRegistry = {
  id: AFENDA_STATUS_TONE_REGISTRY_ID,
  version: AFENDA_STATUS_TONE_REGISTRY_VERSION,
  tones: AFENDA_STATUS_TONES,
  intents: AFENDA_STATUS_INTENTS,
  governanceReferences: AFENDA_STATUS_TONE_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaStatusToneRegistry(): void {
  afendaStatusToneRegistrySchema.parse(afendaStatusToneRegistry);
}
