import { z } from "zod";

import { defineGovernanceReferences, defineRegistry, governanceReferencesSchema } from "../../registry.schema";
import {
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_ELEVATION,
  AFENDA_GOV_THEME_TOKEN,
  AFENDA_GOV_VISUAL_DESIGN,
  AFENDA_GOV_VISUAL_LANE_REGISTRY,
} from "../catalogs/governance-reference.catalog";

export const AFENDA_SHADOW_REGISTRY_ID = "afenda.shadow-registry" as const;
export const AFENDA_SHADOW_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_SHADOW_TOKENS = defineRegistry(["xs", "sm", "md"]);

export const AFENDA_SHADOW_ALIAS_TOKENS = defineRegistry([
  "lane-active-glow",
]);

export const AFENDA_SHADOW_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_VISUAL_DESIGN,
  AFENDA_GOV_ELEVATION,
  AFENDA_GOV_VISUAL_LANE_REGISTRY,
  AFENDA_GOV_THEME_TOKEN,
]);

export type AfendaShadowToken = (typeof AFENDA_SHADOW_TOKENS)[number];
export type AfendaShadowAliasToken = (typeof AFENDA_SHADOW_ALIAS_TOKENS)[number];

export const afendaShadowTokenSchema = z.enum(AFENDA_SHADOW_TOKENS);
export const afendaShadowAliasTokenSchema = z.enum(AFENDA_SHADOW_ALIAS_TOKENS);

export const afendaShadowRegistrySchema = z
  .object({
    aliasTokens: z.array(afendaShadowAliasTokenSchema).min(1).readonly(),
    governanceReferences: governanceReferencesSchema,
    id: z.literal(AFENDA_SHADOW_REGISTRY_ID),
    tokens: z.array(afendaShadowTokenSchema).min(1).readonly(),
    version: z.literal(AFENDA_SHADOW_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.tokens.includes("xs") &&
      registry.tokens.includes("sm") &&
      registry.tokens.includes("md") &&
      registry.aliasTokens.includes("lane-active-glow"),
    "Afenda shadow registry must preserve xs/sm/md and lane-active-glow vocabulary"
  );

export const afendaShadowRegistry = {
  id: AFENDA_SHADOW_REGISTRY_ID,
  version: AFENDA_SHADOW_REGISTRY_VERSION,
  tokens: AFENDA_SHADOW_TOKENS,
  aliasTokens: AFENDA_SHADOW_ALIAS_TOKENS,
  governanceReferences: AFENDA_SHADOW_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaShadowRegistry(): void {
  afendaShadowRegistrySchema.parse(afendaShadowRegistry);
}
