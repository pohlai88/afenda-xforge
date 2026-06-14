import { z } from "zod";

import { defineGovernanceReferences, defineRegistry, governanceReferencesSchema } from "../registry.schema";
import {
  AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS,
  type AfendaForbiddenCustomizationKey,
} from "./design-system.contract";
import {
  AFENDA_COMPONENT_TOKEN_FAMILIES,
  type AfendaComponentTokenFamily,
} from "./registries/component-token.registry";
import {
  AFENDA_DENSITY_MODES,
  type AfendaDensityRegistryMode,
} from "./registries/density.registry";
import {
  AFENDA_CONTROL_SIZES,
  type AfendaControlSize,
} from "./registries/component-size.registry";
import {
  AFENDA_STATUS_TONES,
  type AfendaStatusTone,
} from "./registries/status-tone.registry";
import {
  AFENDA_ERP_VISUAL_LANE_IDS,
  type AfendaErpVisualLaneId,
} from "./registries/visual-lane.registry";
import {
  AFENDA_BUTTON_VARIANTS,
  AFENDA_BADGE_VARIANTS,
  AFENDA_CARD_VARIANTS,
  AFENDA_FIELD_VARIANTS,
  AFENDA_TABLE_VARIANTS,
  type AfendaButtonVariant,
  type AfendaBadgeVariant,
  type AfendaCardVariant,
  type AfendaFieldVariant,
  type AfendaTableVariant,
} from "./registries/component-variant.registry";

export const AFENDA_PRESENTATION_METADATA_CONTRACT_ID =
  "afenda.presentation-metadata-contract" as const;
export const AFENDA_PRESENTATION_METADATA_CONTRACT_VERSION = "0.1.0" as const;

export const AFENDA_PRESENTATION_VARIANT_FAMILIES = defineRegistry([
  "button",
  "badge",
  "card",
  "field",
  "table",
]);

export const AFENDA_PRESENTATION_METADATA_GOVERNANCE_REFERENCES =
  defineGovernanceReferences([
    "afenda.design-system",
    "afenda.presentation-metadata-contract",
    "afenda.component-variant-registry",
    "afenda.density-registry",
    "afenda.status-tone-registry",
    "afenda.visual-lane-registry",
  ]);

export type AfendaPresentationVariantFamily =
  (typeof AFENDA_PRESENTATION_VARIANT_FAMILIES)[number];

export type AfendaPresentationVariant =
  | AfendaButtonVariant
  | AfendaBadgeVariant
  | AfendaCardVariant
  | AfendaFieldVariant
  | AfendaTableVariant;

export type AfendaPresentationMetadata = {
  componentFamily?: AfendaComponentTokenFamily;
  density?: AfendaDensityRegistryMode;
  lane?: AfendaErpVisualLaneId;
  size?: AfendaControlSize;
  tone?: AfendaStatusTone;
  variant?: AfendaPresentationVariant;
  variantFamily?: AfendaPresentationVariantFamily;
};

export const AFENDA_PRESENTATION_FORBIDDEN_KEYS =
  AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS;

export type AfendaPresentationForbiddenKey = AfendaForbiddenCustomizationKey;

export const afendaPresentationVariantFamilySchema = z.enum(
  AFENDA_PRESENTATION_VARIANT_FAMILIES
);
export const afendaPresentationDensitySchema = z.enum(AFENDA_DENSITY_MODES);
export const afendaPresentationControlSizeSchema = z.enum(AFENDA_CONTROL_SIZES);
export const afendaPresentationStatusToneSchema = z.enum(AFENDA_STATUS_TONES);
export const afendaPresentationLaneSchema = z.enum(AFENDA_ERP_VISUAL_LANE_IDS);
export const afendaPresentationComponentFamilySchema = z.enum(
  AFENDA_COMPONENT_TOKEN_FAMILIES
);

const presentationVariantSchema = z.union([
  z.enum(AFENDA_BUTTON_VARIANTS),
  z.enum(AFENDA_BADGE_VARIANTS),
  z.enum(AFENDA_CARD_VARIANTS),
  z.enum(AFENDA_FIELD_VARIANTS),
  z.enum(AFENDA_TABLE_VARIANTS),
]);

export const afendaPresentationMetadataSchema = z
  .object({
    componentFamily: afendaPresentationComponentFamilySchema.optional(),
    density: afendaPresentationDensitySchema.optional(),
    lane: afendaPresentationLaneSchema.optional(),
    size: afendaPresentationControlSizeSchema.optional(),
    tone: afendaPresentationStatusToneSchema.optional(),
    variant: presentationVariantSchema.optional(),
    variantFamily: afendaPresentationVariantFamilySchema.optional(),
  })
  .strict();

export const afendaPresentationMetadataContractSchema = z
  .object({
    componentFamilies: z
      .array(afendaPresentationComponentFamilySchema)
      .min(1)
      .readonly(),
    forbiddenKeys: z
      .array(z.enum(AFENDA_PRESENTATION_FORBIDDEN_KEYS))
      .min(1)
      .readonly(),
    governanceReferences: governanceReferencesSchema,
    id: z.literal(AFENDA_PRESENTATION_METADATA_CONTRACT_ID),
    variantFamilies: z
      .array(afendaPresentationVariantFamilySchema)
      .min(1)
      .readonly(),
    version: z.literal(AFENDA_PRESENTATION_METADATA_CONTRACT_VERSION),
  })
  .strict();

export const afendaPresentationMetadataContract = {
  id: AFENDA_PRESENTATION_METADATA_CONTRACT_ID,
  version: AFENDA_PRESENTATION_METADATA_CONTRACT_VERSION,
  componentFamilies: AFENDA_COMPONENT_TOKEN_FAMILIES,
  variantFamilies: AFENDA_PRESENTATION_VARIANT_FAMILIES,
  forbiddenKeys: AFENDA_PRESENTATION_FORBIDDEN_KEYS,
  governanceReferences: AFENDA_PRESENTATION_METADATA_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaPresentationMetadataContract(): void {
  afendaPresentationMetadataContractSchema.parse(
    afendaPresentationMetadataContract
  );
}

export function assertPresentationSafeInput(
  input: Record<string, unknown>
): void {
  for (const key of Object.keys(input)) {
    if (
      (AFENDA_PRESENTATION_FORBIDDEN_KEYS as readonly string[]).includes(key)
    ) {
      throw new Error(
        `Presentation metadata rejected forbidden authority key: ${key}`
      );
    }
  }
}

export function parseAfendaPresentationMetadata(
  input: unknown
): AfendaPresentationMetadata {
  if (input !== null && typeof input === "object") {
    assertPresentationSafeInput(input as Record<string, unknown>);
  }

  const parsed = afendaPresentationMetadataSchema.parse(input);
  const metadata: AfendaPresentationMetadata = {};

  if (parsed.componentFamily !== undefined) {
    metadata.componentFamily = parsed.componentFamily;
  }
  if (parsed.density !== undefined) {
    metadata.density = parsed.density;
  }
  if (parsed.lane !== undefined) {
    metadata.lane = parsed.lane;
  }
  if (parsed.size !== undefined) {
    metadata.size = parsed.size;
  }
  if (parsed.tone !== undefined) {
    metadata.tone = parsed.tone;
  }
  if (parsed.variant !== undefined) {
    metadata.variant = parsed.variant;
  }
  if (parsed.variantFamily !== undefined) {
    metadata.variantFamily = parsed.variantFamily;
  }

  return metadata;
}
