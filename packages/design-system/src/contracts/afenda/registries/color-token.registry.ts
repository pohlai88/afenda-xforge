import { z } from "zod";

import { defineGovernanceReferences, defineRegistry, governanceReferencesSchema } from "../../registry.schema";
import {
  AFENDA_GOV_QUALITY_GATE,
  AFENDA_PRESENTATION_GOVERNANCE_REFERENCES,
} from "../catalogs/governance-reference.catalog";
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

export const AFENDA_COLOR_TOKEN_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  ...AFENDA_PRESENTATION_GOVERNANCE_REFERENCES,
  AFENDA_GOV_QUALITY_GATE,
  "APCA",
  "WCAG:1.4.3",
]);

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
    governanceReferences: governanceReferencesSchema,
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
