import { z } from "zod";

import { defineGovernanceReferences, defineRegistry, governanceReferencesSchema } from "../../registry.schema";
import {
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_INTERACTION,
  AFENDA_GOV_LAYOUT,
  AFENDA_GOV_THEME_TOKEN,
  AFENDA_GOV_VISUAL_DESIGN,
} from "../catalogs/governance-reference.catalog";

export const AFENDA_ORDER_REGISTRY_ID = "afenda.order-registry" as const;
export const AFENDA_ORDER_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_ORDER_TOKENS = defineRegistry([
  "background",
  "base",
  "ornament",
  "raised",
  "sticky",
  "popover",
  "overlay",
]);

export const AFENDA_ORDER_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_LAYOUT,
  AFENDA_GOV_INTERACTION,
  AFENDA_GOV_VISUAL_DESIGN,
  AFENDA_GOV_THEME_TOKEN,
  "WCAG:2.4.3",
]);

export type AfendaOrderToken = (typeof AFENDA_ORDER_TOKENS)[number];

export type AfendaOrderTokenBinding = {
  readonly token: AfendaOrderToken;
  readonly value: number;
};

export const afendaOrderTokenSchema = z.enum(AFENDA_ORDER_TOKENS);

export const afendaOrderTokenBindingSchema = z
  .object({
    token: afendaOrderTokenSchema,
    value: z.number().int(),
  })
  .strict();

export const AFENDA_ORDER_TOKEN_BINDINGS = [
  { token: "background", value: -10 },
  { token: "base", value: 0 },
  { token: "ornament", value: 1 },
  { token: "raised", value: 10 },
  { token: "sticky", value: 20 },
  { token: "popover", value: 30 },
  { token: "overlay", value: 50 },
] as const satisfies readonly AfendaOrderTokenBinding[];

export const afendaOrderRegistrySchema = z
  .object({
    bindings: z.array(afendaOrderTokenBindingSchema).min(1).readonly(),
    governanceReferences: governanceReferencesSchema,
    id: z.literal(AFENDA_ORDER_REGISTRY_ID),
    tokens: z.array(afendaOrderTokenSchema).min(1).readonly(),
    version: z.literal(AFENDA_ORDER_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.bindings.map((binding) => binding.token).join("|") ===
      registry.tokens.join("|"),
    "Afenda order token bindings must cover each governed order token"
  )
  .refine(
    (registry) =>
      new Set(registry.bindings.map((binding) => binding.value)).size ===
      registry.bindings.length,
    "Afenda order token bindings must preserve unique layer values"
  )
  .refine(
    (registry) =>
      registry.tokens.includes("background") &&
      registry.tokens.includes("base") &&
      registry.tokens.includes("ornament") &&
      registry.tokens.includes("raised") &&
      registry.tokens.includes("sticky") &&
      registry.tokens.includes("popover") &&
      registry.tokens.includes("overlay"),
    "Afenda order registry must preserve governed background/base/ornament/raised/sticky/popover/overlay tokens"
  );

export const afendaOrderRegistry = {
  id: AFENDA_ORDER_REGISTRY_ID,
  version: AFENDA_ORDER_REGISTRY_VERSION,
  tokens: AFENDA_ORDER_TOKENS,
  bindings: AFENDA_ORDER_TOKEN_BINDINGS,
  governanceReferences: AFENDA_ORDER_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaOrderRegistry(): void {
  afendaOrderRegistrySchema.parse(afendaOrderRegistry);
}
