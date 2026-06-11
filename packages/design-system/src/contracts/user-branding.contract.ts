import { z } from "zod";

import { themePresetNameSchema } from "./theme-preset.contract";
import {
  erpVisualLaneIdSchema,
  partialLaneColorModeScaleSchema,
} from "./tenant-branding.contract";

export const colorModePreferenceSchema = z.enum(["light", "dark", "system"]);

export type ColorModePreference = z.infer<typeof colorModePreferenceSchema>;

export const userBrandingPreferencesSchema = z
  .object({
    colorMode: colorModePreferenceSchema.optional(),
    themePreset: themePresetNameSchema.optional(),
    moduleLaneOverrides: z
      .record(z.string().trim().min(1), erpVisualLaneIdSchema)
      .optional(),
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

export type UserBrandingPreferences = z.infer<
  typeof userBrandingPreferencesSchema
>;

export const EMPTY_USER_BRANDING_PREFERENCES: UserBrandingPreferences = {};

export function validateUserBrandingPreferences(
  preferences: UserBrandingPreferences
): UserBrandingPreferences {
  return userBrandingPreferencesSchema.parse(preferences);
}

export function isUserBrandingEmpty(
  preferences: UserBrandingPreferences
): boolean {
  return (
    !preferences.colorMode &&
    !preferences.themePreset &&
    !preferences.moduleLaneOverrides &&
    !preferences.laneColorOverrides
  );
}
