import type { AfendaUserBrandingPreferences } from "../../contracts/afenda/customization";
import {
  AFENDA_EMPTY_USER_BRANDING_PREFERENCES,
  afendaUserBrandingPreferencesSchema,
} from "../../contracts/afenda/customization";
import { assertValidUserBrandingColors } from "../resolution/validate-branding-colors";

const userBrandingStore = new Map<string, AfendaUserBrandingPreferences>();

function assertBrandingStoreId(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required for branding storage`);
  }

  return trimmed;
}

function preferenceKey(tenantId: string, userId: string): string {
  return `${assertBrandingStoreId(tenantId, "tenantId")}:${assertBrandingStoreId(
    userId,
    "userId"
  )}`;
}

export function getUserBrandingPreferences(
  tenantId: string,
  userId: string
): AfendaUserBrandingPreferences {
  const stored = userBrandingStore.get(preferenceKey(tenantId, userId));
  if (!stored) {
    return AFENDA_EMPTY_USER_BRANDING_PREFERENCES;
  }

  return afendaUserBrandingPreferencesSchema.parse(stored);
}

export function setUserBrandingPreferences(
  tenantId: string,
  userId: string,
  preferences: AfendaUserBrandingPreferences
): AfendaUserBrandingPreferences {
  const parsed = afendaUserBrandingPreferencesSchema.parse(preferences);
  assertValidUserBrandingColors(parsed);
  userBrandingStore.set(preferenceKey(tenantId, userId), parsed);

  return parsed;
}

export function clearUserBrandingStore(): void {
  userBrandingStore.clear();
}
