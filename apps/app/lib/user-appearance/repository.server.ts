import "server-only";

import {
  database,
  timeDatabaseQuery,
  userAppearancePreferences,
} from "@repo/database";
import type { AfendaUserBrandingPreferences as UserBrandingPreferences } from "@repo/design-system/contracts/afenda/customization";
import {
  AFENDA_EMPTY_USER_BRANDING_PREFERENCES as EMPTY_USER_BRANDING_PREFERENCES,
  afendaUserBrandingPreferencesSchema as userBrandingPreferencesSchema,
} from "@repo/design-system/contracts/afenda/customization";
import { afendaThemePresetRegistryNameSchema as themePresetNameSchema } from "@repo/design-system/contracts/afenda/registries";
import { setUserBrandingPreferences as setCachedUserBrandingPreferences } from "@repo/design-system/customise-branding";
import { and, eq } from "drizzle-orm";

type UserAppearanceRow = typeof userAppearancePreferences.$inferSelect;

const mapRowToPreferences = (
  row: UserAppearanceRow
): UserBrandingPreferences => {
  const stored = row.branding as Partial<UserBrandingPreferences>;
  const rawThemePreset = row.themePreset ?? stored.themePreset;

  return userBrandingPreferencesSchema.parse({
    colorMode: stored.colorMode,
    themePreset: rawThemePreset
      ? themePresetNameSchema.parse(rawThemePreset.trim())
      : undefined,
    moduleLaneOverrides: stored.moduleLaneOverrides,
    laneColorOverrides: stored.laneColorOverrides,
  });
};

export const readUserAppearancePreferences = async (
  tenantId: string,
  userId: string
): Promise<UserBrandingPreferences> => {
  const row = await timeDatabaseQuery(
    () =>
      database.query.userAppearancePreferences.findFirst({
        where: and(
          eq(userAppearancePreferences.tenantId, tenantId),
          eq(userAppearancePreferences.userId, userId)
        ),
      }),
    {
      operation: "select",
      resource: "user_appearance_preferences.read",
    }
  );

  if (!row) {
    return EMPTY_USER_BRANDING_PREFERENCES;
  }

  const preferences = mapRowToPreferences(row);
  setCachedUserBrandingPreferences(tenantId, userId, preferences);
  return preferences;
};

export const upsertUserAppearancePreferences = async (
  tenantId: string,
  userId: string,
  preferences: UserBrandingPreferences
): Promise<UserBrandingPreferences> => {
  const parsed = userBrandingPreferencesSchema.parse(preferences);
  const now = new Date();

  await timeDatabaseQuery(
    () =>
      database
        .insert(userAppearancePreferences)
        .values({
          tenantId,
          userId,
          themePreset: parsed.themePreset ?? null,
          branding: {
            colorMode: parsed.colorMode,
            moduleLaneOverrides: parsed.moduleLaneOverrides,
            laneColorOverrides: parsed.laneColorOverrides,
          },
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [
            userAppearancePreferences.tenantId,
            userAppearancePreferences.userId,
          ],
          set: {
            themePreset: parsed.themePreset ?? null,
            branding: {
              colorMode: parsed.colorMode,
              moduleLaneOverrides: parsed.moduleLaneOverrides,
              laneColorOverrides: parsed.laneColorOverrides,
            },
            updatedAt: now,
          },
        }),
    {
      operation: "upsert",
      resource: "user_appearance_preferences.upsert",
    }
  );

  setCachedUserBrandingPreferences(tenantId, userId, parsed);
  return parsed;
};
