import "server-only";

import {
  database,
  timeDatabaseQuery,
  userAppearancePreferences,
} from "@repo/database";
import { setUserBrandingPreferences as setCachedUserBrandingPreferences } from "@repo/design-system";
import type { UserBrandingPreferences } from "@repo/design-system/contracts/user-branding.contract";
import {
  EMPTY_USER_BRANDING_PREFERENCES,
  userBrandingPreferencesSchema,
} from "@repo/design-system/contracts/user-branding.contract";
import { and, eq } from "drizzle-orm";

type UserAppearanceRow = typeof userAppearancePreferences.$inferSelect;

const mapRowToPreferences = (
  row: UserAppearanceRow
): UserBrandingPreferences => {
  const stored = row.branding as Partial<UserBrandingPreferences>;

  return userBrandingPreferencesSchema.parse({
    colorMode: stored.colorMode,
    themePreset: row.themePreset ?? stored.themePreset,
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
