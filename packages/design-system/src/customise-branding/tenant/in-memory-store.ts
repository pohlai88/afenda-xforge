import type { AfendaTenantBrandingSettings } from "../../contracts/afenda/customization";
import {
  AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS,
  afendaTenantBrandingSettingsSchema,
} from "../../contracts/afenda/customization";
import { afendaThemePresetRegistryNameSchema } from "../../contracts/afenda/registries";
import { applyTenantBrandingPatch } from "../resolution/tenant-branding-purpose";
import { assertValidTenantBrandingColors } from "../resolution/validate-branding-colors";

const tenantBrandingStore = new Map<string, AfendaTenantBrandingSettings>();

function assertBrandingStoreId(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required for branding storage`);
  }

  return trimmed;
}

export function getTenantBranding(
  tenantId: string
): AfendaTenantBrandingSettings {
  const key = assertBrandingStoreId(tenantId, "tenantId");
  const stored = tenantBrandingStore.get(key);
  if (!stored) {
    return { ...AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS };
  }

  return afendaTenantBrandingSettingsSchema.parse(stored);
}

export function setTenantBranding(
  tenantId: string,
  settings: AfendaTenantBrandingSettings
): AfendaTenantBrandingSettings {
  const key = assertBrandingStoreId(tenantId, "tenantId");
  const parsed = afendaTenantBrandingSettingsSchema.parse(settings);
  assertValidTenantBrandingColors(parsed);
  tenantBrandingStore.set(key, parsed);

  return parsed;
}

export function updateTenantBranding(
  tenantId: string,
  patch: Partial<AfendaTenantBrandingSettings>
): AfendaTenantBrandingSettings {
  const current = getTenantBranding(tenantId);
  const merged = applyTenantBrandingPatch(current, patch);

  return setTenantBranding(tenantId, merged);
}

export type TenantAdminBrandingSettingKey = "tenant-branding" | "theme-preset";

export function applyTenantAdminBrandingSetting(
  tenantId: string,
  key: TenantAdminBrandingSettingKey,
  value: string
): AfendaTenantBrandingSettings {
  if (key === "theme-preset") {
    const themePreset = afendaThemePresetRegistryNameSchema.parse(value.trim());

    return updateTenantBranding(tenantId, { themePreset });
  }

  const parsed = afendaTenantBrandingSettingsSchema.parse(JSON.parse(value));

  return setTenantBranding(tenantId, parsed);
}

export function clearTenantBrandingStore(): void {
  tenantBrandingStore.clear();
}
