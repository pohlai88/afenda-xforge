import type { UserBrandingPreferences } from "../contracts/user-branding.contract";
import {
  EMPTY_USER_BRANDING_PREFERENCES,
  userBrandingPreferencesSchema,
} from "../contracts/user-branding.contract";
import { assertValidUserBrandingColors } from "../resolution/validate-branding-colors";

const userBrandingStore = new Map<string, UserBrandingPreferences>();

function preferenceKey(tenantId: string, userId: string): string {
  return `${tenantId}:${userId}`;
}

export function getUserBrandingPreferences(
  tenantId: string,
  userId: string
): UserBrandingPreferences {
  const stored = userBrandingStore.get(preferenceKey(tenantId, userId));
  if (!stored) {
    return EMPTY_USER_BRANDING_PREFERENCES;
  }

  return userBrandingPreferencesSchema.parse(stored);
}

export function setUserBrandingPreferences(
  tenantId: string,
  userId: string,
  preferences: UserBrandingPreferences
): UserBrandingPreferences {
  const parsed = userBrandingPreferencesSchema.parse(preferences);
  assertValidUserBrandingColors(parsed);
  userBrandingStore.set(preferenceKey(tenantId, userId), parsed);
  return parsed;
}

export function clearUserBrandingStore(): void {
  userBrandingStore.clear();
}
