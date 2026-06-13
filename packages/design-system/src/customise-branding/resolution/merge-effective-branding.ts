import type {
  AfendaPartialLaneColorModeScale as PartialLaneColorModeScale,
  AfendaTenantBrandingSettings as TenantBrandingSettings,
} from "../../contracts/afenda/customization/branding.contract";
import { validateAfendaTenantBrandingSettings as validateTenantBrandingSettings } from "../../contracts/afenda/customization/branding.contract";
import type { AfendaUserBrandingPreferences as UserBrandingPreferences } from "../../contracts/afenda/customization/branding.contract";
import { validateAfendaUserBrandingPreferences as validateUserBrandingPreferences } from "../../contracts/afenda/customization/branding.contract";
import { assertValidTenantBrandingColors } from "./validate-branding-colors";

function mergeRecord<T extends Record<string, unknown>>(
  base: T | undefined,
  overlay: T | undefined
): T | undefined {
  if (!overlay) {
    return base;
  }

  if (!base) {
    return overlay;
  }

  return { ...base, ...overlay };
}

function mergePartialLaneColorModeScale(
  base: PartialLaneColorModeScale | undefined,
  overlay: PartialLaneColorModeScale | undefined
): PartialLaneColorModeScale | undefined {
  if (!overlay) {
    return base;
  }

  if (!base) {
    return overlay;
  }

  return {
    light: overlay.light ?? base.light,
    dark: overlay.dark ?? base.dark,
  };
}

function mergeLaneColorRecord(
  base: Record<string, PartialLaneColorModeScale> | undefined,
  overlay: Record<string, PartialLaneColorModeScale> | undefined
): Record<string, PartialLaneColorModeScale> | undefined {
  if (!overlay) {
    return base;
  }

  if (!base) {
    return overlay;
  }

  const keys = new Set([...Object.keys(base), ...Object.keys(overlay)]);
  const next: Record<string, PartialLaneColorModeScale> = {};

  for (const key of keys) {
    const merged = mergePartialLaneColorModeScale(base[key], overlay[key]);
    if (merged) {
      next[key] = merged;
    }
  }

  return Object.keys(next).length > 0 ? next : undefined;
}

function mergeLaneColorOverrides(
  tenant: TenantBrandingSettings,
  user: UserBrandingPreferences
): TenantBrandingSettings["laneColorOverrides"] {
  const tenantOverrides = tenant.laneColorOverrides;
  const userOverrides = user.laneColorOverrides;

  if (!(tenantOverrides || userOverrides)) {
    return;
  }

  return {
    byLane: mergeLaneColorRecord(
      tenantOverrides?.byLane,
      userOverrides?.byLane
    ),
    byFeature: mergeLaneColorRecord(
      tenantOverrides?.byFeature,
      userOverrides?.byFeature
    ),
  };
}

export function mergeEffectiveBranding(
  tenant: TenantBrandingSettings,
  user: UserBrandingPreferences = {}
): TenantBrandingSettings {
  const tenantSettings = validateTenantBrandingSettings(tenant);
  const userPreferences = validateUserBrandingPreferences(user);

  const merged = validateTenantBrandingSettings({
    themePreset: userPreferences.themePreset ?? tenantSettings.themePreset,
    density: tenantSettings.density,
    moduleLaneOverrides: mergeRecord(
      tenantSettings.moduleLaneOverrides,
      userPreferences.moduleLaneOverrides
    ),
    laneColorOverrides: mergeLaneColorOverrides(
      tenantSettings,
      userPreferences
    ),
  });

  assertValidTenantBrandingColors(merged);

  return merged;
}
