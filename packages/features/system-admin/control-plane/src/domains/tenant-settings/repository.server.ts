import "server-only";

import { database, tenantSettings, timeDatabaseQuery } from "@repo/database";
import type { AfendaTenantBrandingSettings as TenantBrandingSettings } from "@repo/design-system/contracts/afenda/customization";
import {
  AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS as DEFAULT_TENANT_BRANDING_SETTINGS,
  afendaTenantBrandingSettingsSchema as tenantBrandingSettingsSchema,
} from "@repo/design-system/contracts/afenda/customization";
import { afendaThemePresetRegistryNameSchema as themePresetNameSchema } from "@repo/design-system/contracts/afenda/registries";
import { assertValidTenantBrandingColors } from "@repo/design-system/customise-branding";
import { eq } from "drizzle-orm";
import type { TenantAdminSettingsSnapshot } from "./contract.ts";
import type { TenantAdminSettingUpdateShape } from "./schema.ts";

type TenantSettingsRow = typeof tenantSettings.$inferSelect;

function serializeTenantBrandingJson(
  branding: TenantBrandingSettings
): Record<string, unknown> {
  const json: Record<string, unknown> = {};

  if (branding.moduleLaneOverrides) {
    json.moduleLaneOverrides = branding.moduleLaneOverrides;
  }

  if (branding.laneColorOverrides) {
    json.laneColorOverrides = branding.laneColorOverrides;
  }

  if (branding.density && branding.density !== "default") {
    json.density = branding.density;
  }

  return json;
}

const mapRowToBranding = (row: TenantSettingsRow): TenantBrandingSettings => {
  const storedBranding = row.branding as Partial<TenantBrandingSettings>;

  return tenantBrandingSettingsSchema.parse({
    themePreset: themePresetNameSchema.parse(row.themePreset.trim()),
    density: storedBranding.density,
    moduleLaneOverrides: storedBranding.moduleLaneOverrides,
    laneColorOverrides: storedBranding.laneColorOverrides,
  });
};

const ensureTenantSettingsRow = async (
  tenantId: string
): Promise<TenantSettingsRow> => {
  const existing = await timeDatabaseQuery(
    () =>
      database.query.tenantSettings.findFirst({
        where: eq(tenantSettings.tenantId, tenantId),
      }),
    {
      operation: "select",
      resource: "tenant_settings.ensure",
    }
  );

  if (existing) {
    return existing;
  }

  const inserted = await timeDatabaseQuery(
    () =>
      database
        .insert(tenantSettings)
        .values({
          tenantId,
          branding: {},
          themePreset: DEFAULT_TENANT_BRANDING_SETTINGS.themePreset,
        })
        .onConflictDoNothing()
        .returning(),
    {
      operation: "insert",
      resource: "tenant_settings.ensure",
    }
  );

  const [row] = inserted;
  if (row) {
    return row;
  }

  const refetched = await timeDatabaseQuery(
    () =>
      database.query.tenantSettings.findFirst({
        where: eq(tenantSettings.tenantId, tenantId),
      }),
    {
      operation: "select",
      resource: "tenant_settings.ensure.refetch",
    }
  );

  if (!refetched) {
    throw new Error("Tenant settings row could not be created");
  }

  return refetched;
};

export const readTenantBrandingSettings = async (
  tenantId: string
): Promise<TenantBrandingSettings> => {
  const row = await ensureTenantSettingsRow(tenantId);
  return mapRowToBranding(row);
};

export const readTenantAdminSettings = async (
  tenantId: string
): Promise<TenantAdminSettingsSnapshot> => {
  const row = await ensureTenantSettingsRow(tenantId);

  return {
    tenantId,
    displayName: row.displayName,
    defaultLocale: row.defaultLocale,
    defaultTimezone: row.defaultTimezone,
    customizationMode: row.customizationMode,
    branding: mapRowToBranding(row),
  };
};

export const upsertTenantAdminSetting = async (
  tenantId: string,
  input: TenantAdminSettingUpdateShape
): Promise<TenantBrandingSettings> => {
  const currentRow = await ensureTenantSettingsRow(tenantId);
  const currentBranding = mapRowToBranding(currentRow);
  const now = new Date();

  if (input.key === "tenant-branding") {
    const branding = tenantBrandingSettingsSchema.parse(
      JSON.parse(input.value)
    );
    assertValidTenantBrandingColors(branding);

    await timeDatabaseQuery(
      () =>
        database
          .update(tenantSettings)
          .set({
            branding: serializeTenantBrandingJson(branding),
            themePreset: branding.themePreset,
            updatedAt: now,
          })
          .where(eq(tenantSettings.tenantId, tenantId)),
      {
        operation: "update",
        resource: "tenant_settings.branding",
      }
    );

    return branding;
  }

  if (input.key === "theme-preset") {
    const themePreset = themePresetNameSchema.parse(input.value.trim());
    const branding = tenantBrandingSettingsSchema.parse({
      ...currentBranding,
      themePreset,
    });
    assertValidTenantBrandingColors(branding);

    await timeDatabaseQuery(
      () =>
        database
          .update(tenantSettings)
          .set({
            themePreset,
            updatedAt: now,
          })
          .where(eq(tenantSettings.tenantId, tenantId)),
      {
        operation: "update",
        resource: "tenant_settings.theme_preset",
      }
    );

    return branding;
  }

  const scalarUpdates: Partial<typeof tenantSettings.$inferInsert> = {
    updatedAt: now,
  };

  switch (input.key) {
    case "display-name":
      scalarUpdates.displayName = input.value;
      break;
    case "default-locale":
      scalarUpdates.defaultLocale = input.value;
      break;
    case "default-timezone":
      scalarUpdates.defaultTimezone = input.value;
      break;
    case "customization-mode":
      scalarUpdates.customizationMode = input.value;
      break;
    default:
      break;
  }

  await timeDatabaseQuery(
    () =>
      database
        .update(tenantSettings)
        .set(scalarUpdates)
        .where(eq(tenantSettings.tenantId, tenantId)),
    {
      operation: "update",
      resource: `tenant_settings.${input.key}`,
    }
  );

  return currentBranding;
};
