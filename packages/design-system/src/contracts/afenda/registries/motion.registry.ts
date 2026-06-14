import { z } from "zod";

import { defineGovernanceReferences, defineRegistry, governanceReferencesSchema } from "../../registry.schema";
import {
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_INTERACTION,
  AFENDA_GOV_MOTION,
  AFENDA_GOV_PERFORMANCE,
} from "../catalogs/governance-reference.catalog";

export const AFENDA_MOTION_REGISTRY_ID = "afenda.motion-registry" as const;
export const AFENDA_MOTION_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_MOTION_ANIMATION_TOKENS = defineRegistry(["shimmer"]);

export const AFENDA_MOTION_PREFERENCE_TOKENS = defineRegistry([
  "default",
  "reduced",
]);

export const AFENDA_MOTION_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_MOTION,
  AFENDA_GOV_INTERACTION,
  AFENDA_GOV_PERFORMANCE,
  "WCAG:2.2.2",
]);

export type AfendaMotionAnimationToken =
  (typeof AFENDA_MOTION_ANIMATION_TOKENS)[number];
export type AfendaMotionPreferenceToken =
  (typeof AFENDA_MOTION_PREFERENCE_TOKENS)[number];

export const afendaMotionAnimationTokenSchema = z.enum(
  AFENDA_MOTION_ANIMATION_TOKENS
);
export const afendaMotionPreferenceTokenSchema = z.enum(
  AFENDA_MOTION_PREFERENCE_TOKENS
);

export const afendaMotionRegistrySchema = z
  .object({
    animationTokens: z
      .array(afendaMotionAnimationTokenSchema)
      .min(1)
      .readonly(),
    governanceReferences: governanceReferencesSchema,
    id: z.literal(AFENDA_MOTION_REGISTRY_ID),
    preferenceTokens: z
      .array(afendaMotionPreferenceTokenSchema)
      .min(1)
      .readonly(),
    version: z.literal(AFENDA_MOTION_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.animationTokens.includes("shimmer") &&
      registry.preferenceTokens.includes("default") &&
      registry.preferenceTokens.includes("reduced"),
    "Afenda motion registry must preserve shimmer/default/reduced vocabulary"
  );

export const afendaMotionRegistry = {
  id: AFENDA_MOTION_REGISTRY_ID,
  version: AFENDA_MOTION_REGISTRY_VERSION,
  animationTokens: AFENDA_MOTION_ANIMATION_TOKENS,
  preferenceTokens: AFENDA_MOTION_PREFERENCE_TOKENS,
  governanceReferences: AFENDA_MOTION_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaMotionRegistry(): void {
  afendaMotionRegistrySchema.parse(afendaMotionRegistry);
}
