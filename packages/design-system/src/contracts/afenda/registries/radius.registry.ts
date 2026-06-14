import { z } from "zod";

import { defineGovernanceReferences, defineRegistry, governanceReferencesSchema } from "../../registry.schema";
import {
  AFENDA_GOV_COMPONENT_VARIANT,
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_LAYOUT,
  AFENDA_GOV_THEME_TOKEN,
  AFENDA_GOV_VISUAL_DESIGN,
} from "../catalogs/governance-reference.catalog";

export const AFENDA_RADIUS_REGISTRY_ID = "afenda.radius-registry" as const;
export const AFENDA_RADIUS_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_RADIUS_SOURCE_TOKENS = defineRegistry(["radius"]);

export const AFENDA_RADIUS_TOKENS = defineRegistry([
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "control",
  "panel",
]);

export const AFENDA_RADIUS_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_VISUAL_DESIGN,
  AFENDA_GOV_LAYOUT,
  AFENDA_GOV_COMPONENT_VARIANT,
  AFENDA_GOV_THEME_TOKEN,
]);

export type AfendaRadiusSourceToken =
  (typeof AFENDA_RADIUS_SOURCE_TOKENS)[number];
export type AfendaRadiusToken = (typeof AFENDA_RADIUS_TOKENS)[number];

export const afendaRadiusSourceTokenSchema = z.enum(
  AFENDA_RADIUS_SOURCE_TOKENS
);
export const afendaRadiusTokenSchema = z.enum(AFENDA_RADIUS_TOKENS);

export const afendaRadiusRegistrySchema = z
  .object({
    governanceReferences: governanceReferencesSchema,
    id: z.literal(AFENDA_RADIUS_REGISTRY_ID),
    sourceTokens: z.array(afendaRadiusSourceTokenSchema).min(1).readonly(),
    tokens: z.array(afendaRadiusTokenSchema).min(1).readonly(),
    version: z.literal(AFENDA_RADIUS_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.sourceTokens.includes("radius") &&
      registry.tokens.includes("control") &&
      registry.tokens.includes("panel"),
    "Afenda radius registry must include source, control, and panel tokens"
  );

export const afendaRadiusRegistry = {
  id: AFENDA_RADIUS_REGISTRY_ID,
  version: AFENDA_RADIUS_REGISTRY_VERSION,
  sourceTokens: AFENDA_RADIUS_SOURCE_TOKENS,
  tokens: AFENDA_RADIUS_TOKENS,
  governanceReferences: AFENDA_RADIUS_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaRadiusRegistry(): void {
  afendaRadiusRegistrySchema.parse(afendaRadiusRegistry);
}
