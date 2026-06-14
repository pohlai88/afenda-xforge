import { z } from "zod";

import { defineGovernanceReferences, defineRegistry, governanceReferencesSchema } from "../../registry.schema";
import {
  AFENDA_GOV_COMPONENT_VARIANT_REGISTRY,
  AFENDA_GOV_COPY,
  AFENDA_GOV_DATA_DISPLAY,
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_THEMING,
  AFENDA_GOV_VISUAL_DESIGN,
} from "../catalogs/governance-reference.catalog";

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

export const AFENDA_STATUS_TONE_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_DATA_DISPLAY,
  AFENDA_GOV_VISUAL_DESIGN,
  AFENDA_GOV_COPY,
  AFENDA_GOV_THEMING,
  AFENDA_GOV_COMPONENT_VARIANT_REGISTRY,
  "WCAG:1.4.1",
]);

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
    governanceReferences: governanceReferencesSchema,
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
