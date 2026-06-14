import { z } from "zod";

import {
  AFENDA_ALLOWED_CUSTOMIZATION_KEYS,
  AFENDA_DESIGN_SYSTEM_ID,
  AFENDA_DESIGN_SYSTEM_VERSION,
  AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS,
  afendaDesignSystemContract,
} from "./design-system.contract";
import { AFENDA_THEME_PRESET_NAMES } from "./registries/theme-preset.registry";
import {
  AFENDA_RUNTIME_REFERENCE_ID,
  afendaRuntimeReferenceContractSchema,
} from "./runtime-reference.contract";

export const afendaAllowedCustomizationKeySchema = z.enum(
  AFENDA_ALLOWED_CUSTOMIZATION_KEYS
);
export const afendaForbiddenCustomizationKeySchema = z.enum(
  AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS
);
export const afendaThemePresetSchema = z.enum(AFENDA_THEME_PRESET_NAMES);

export const afendaDesignSystemContractSchema = z
  .object({
    defaults: z
      .object({
        themePreset: afendaThemePresetSchema,
      })
      .strict(),
    description: z.string().trim().min(1),
    governance: z
      .object({
        allowedCustomization: z.array(afendaAllowedCustomizationKeySchema).readonly(),
        forbiddenCustomization: z
          .array(afendaForbiddenCustomizationKeySchema)
          .readonly(),
        principles: z.array(z.string().trim().min(1)).readonly(),
      })
      .strict(),
    id: z.literal(AFENDA_DESIGN_SYSTEM_ID),
    runtimeReference: afendaRuntimeReferenceContractSchema,
    version: z.literal(AFENDA_DESIGN_SYSTEM_VERSION),
  })
  .strict();

export function validateAfendaDesignSystemContract(): void {
  afendaDesignSystemContractSchema.parse(afendaDesignSystemContract);

  if (afendaDesignSystemContract.runtimeReference.id !== AFENDA_RUNTIME_REFERENCE_ID) {
    throw new Error("Afenda design system must bind to the runtime reference contract");
  }

  if (
    !AFENDA_THEME_PRESET_NAMES.includes(afendaDesignSystemContract.defaults.themePreset)
  ) {
    throw new Error(
      "Afenda design system default themePreset must be a registered theme preset name"
    );
  }
}
