import type { TenantBrandingSettings } from "../contracts/tenant-branding.contract";
import {
  DEFAULT_TENANT_BRANDING_SETTINGS,
  tenantBrandingSettingsSchema,
} from "../contracts/tenant-branding.contract";
import { themePresetNameSchema } from "../contracts/theme-preset.contract";
import { assertValidTenantBrandingColors } from "../resolution/validate-branding-colors";

const tenantBrandingStore = new Map<string, TenantBrandingSettings>();

export function getTenantBranding(tenantId: string): TenantBrandingSettings {
  const stored = tenantBrandingStore.get(tenantId);
  if (!stored) {
    return { ...DEFAULT_TENANT_BRANDING_SETTINGS };
  }

  return tenantBrandingSettingsSchema.parse(stored);
}

export function setTenantBranding(
  tenantId: string,
  settings: TenantBrandingSettings
): TenantBrandingSettings {
  const parsed = tenantBrandingSettingsSchema.parse(settings);
  assertValidTenantBrandingColors(parsed);
  tenantBrandingStore.set(tenantId, parsed);
  return parsed;
}

export function updateTenantBranding(
  tenantId: string,
  patch: Partial<TenantBrandingSettings>
): TenantBrandingSettings {
  const current = getTenantBranding(tenantId);
  const merged = tenantBrandingSettingsSchema.parse({
    ...current,
    ...patch,
    moduleLaneOverrides: patch.moduleLaneOverrides
      ? {
          ...current.moduleLaneOverrides,
          ...patch.moduleLaneOverrides,
        }
      : current.moduleLaneOverrides,
    laneColorOverrides: patch.laneColorOverrides
      ? {
          byLane: patch.laneColorOverrides.byLane
            ? {
                ...current.laneColorOverrides?.byLane,
                ...patch.laneColorOverrides.byLane,
              }
            : current.laneColorOverrides?.byLane,
          byFeature: patch.laneColorOverrides.byFeature
            ? {
                ...current.laneColorOverrides?.byFeature,
                ...patch.laneColorOverrides.byFeature,
              }
            : current.laneColorOverrides?.byFeature,
        }
      : current.laneColorOverrides,
  });

  return setTenantBranding(tenantId, merged);
}

export type TenantAdminBrandingSettingKey = "theme-preset" | "tenant-branding";

export function applyTenantAdminBrandingSetting(
  tenantId: string,
  key: TenantAdminBrandingSettingKey,
  value: string
): TenantBrandingSettings {
  if (key === "theme-preset") {
    const themePreset = themePresetNameSchema.parse(value.trim());
    return updateTenantBranding(tenantId, { themePreset });
  }

  const parsed = tenantBrandingSettingsSchema.parse(JSON.parse(value));
  return setTenantBranding(tenantId, parsed);
}

export function clearTenantBrandingStore(): void {
  tenantBrandingStore.clear();
}
