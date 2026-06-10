import { z } from "zod";

import { themePresetNameSchema } from "./theme-preset.contract";
import {
  type ErpVisualLaneId,
  ERP_VISUAL_LANE_IDS,
  laneColorModeScaleSchema,
  laneColorScaleSchema,
  type LaneColorScale,
  type LaneColorScaleField,
} from "./visual-lane.contract";

const cssColorValueSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) =>
      value.startsWith("oklch(") ||
      value.startsWith("var(") ||
      value.startsWith("color-mix("),
    "Tenant branding color values must be oklch(), var(), or color-mix()"
  );

export const partialLaneColorScaleSchema = laneColorScaleSchema.partial();

export const partialLaneColorModeScaleSchema = z
  .object({
    light: partialLaneColorScaleSchema.optional(),
    dark: partialLaneColorScaleSchema.optional(),
  })
  .strict();

export const erpVisualLaneIdSchema = z.enum(
  ERP_VISUAL_LANE_IDS as unknown as [ErpVisualLaneId, ...ErpVisualLaneId[]]
);

export const tenantBrandingSettingsSchema = z
  .object({
    themePreset: themePresetNameSchema,
    moduleLaneOverrides: z.record(z.string().trim().min(1), erpVisualLaneIdSchema).optional(),
    laneColorOverrides: z
      .object({
        byLane: z
          .record(z.string().trim().min(1), partialLaneColorModeScaleSchema)
          .optional(),
        byFeature: z
          .record(z.string().trim().min(1), partialLaneColorModeScaleSchema)
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type TenantBrandingSettings = z.infer<typeof tenantBrandingSettingsSchema>;

export type PartialLaneColorScale = z.infer<typeof partialLaneColorScaleSchema>;

export type PartialLaneColorModeScale = z.infer<
  typeof partialLaneColorModeScaleSchema
>;

export const DEFAULT_TENANT_BRANDING_SETTINGS: TenantBrandingSettings = {
  themePreset: "xforge",
};

export function mergeLaneScaleFields(
  base: LaneColorScale,
  override?: PartialLaneColorScale
): LaneColorScale {
  if (!override) {
    return base;
  }

  const merged = { ...base };
  for (const field of Object.keys(override) as LaneColorScaleField[]) {
    const value = override[field];
    if (value) {
      merged[field] = value;
    }
  }

  return merged;
}

function assertValidLaneOverrideKeys(
  settings: TenantBrandingSettings
): TenantBrandingSettings {
  const byLane = settings.laneColorOverrides?.byLane;
  if (byLane) {
    for (const laneId of Object.keys(byLane)) {
      erpVisualLaneIdSchema.parse(laneId);
    }
  }

  return settings;
}

export function validateTenantBrandingSettings(
  settings: TenantBrandingSettings
): TenantBrandingSettings {
  return assertValidLaneOverrideKeys(tenantBrandingSettingsSchema.parse(settings));
}
