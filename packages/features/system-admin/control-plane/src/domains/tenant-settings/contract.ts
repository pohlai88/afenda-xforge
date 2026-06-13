import { defineRouteContract } from "@repo/api";
import { afendaTenantBrandingSettingsSchema as tenantBrandingSettingsSchema } from "@repo/design-system/contracts/afenda/customization";
import { z } from "zod";
import { systemAdminMutationResultSchema } from "../../schema.ts";
import { tenantAdminSettingUpdateSchema } from "./schema.ts";

export const tenantAdminSettingsReadSchema = z
  .object({
    tenantId: z.string().uuid(),
    displayName: z.string().nullable(),
    defaultLocale: z.string(),
    defaultTimezone: z.string(),
    customizationMode: z.string().nullable(),
    branding: tenantBrandingSettingsSchema,
  })
  .strict();

export type TenantAdminSettingsSnapshot = z.infer<
  typeof tenantAdminSettingsReadSchema
>;

export const tenantSettingsCapabilities = {
  tenantSettingsRead: "system-admin.tenant-settings.read",
  tenantSettingsWrite: "system-admin.tenant-settings.write",
} as const;

export const systemAdminUpdateTenantSettingRouteContract = defineRouteContract({
  audience: "client",
  method: "POST",
  operationId: "updateTenantAdminSetting",
  path: "/api/system-admin/tenant-settings",
  request: {
    body: {
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          key: { type: "string" },
          reason: { type: "string" },
          value: { type: "string" },
        },
        required: ["key", "reason", "value"],
      },
      schema: tenantAdminSettingUpdateSchema,
    },
  },
  success: {
    description: "Accepted tenant setting update",
    openApiSchema: {
      $ref: "#/components/schemas/SystemAdminMutationResult",
    },
    schema: systemAdminMutationResultSchema,
    status: 202,
  },
  summary: "Update governed tenant admin setting",
  tags: ["system-admin"],
});

export const systemAdminReadTenantSettingsRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "readTenantAdminSettings",
  path: "/api/system-admin/tenant-settings",
  success: {
    description: "Tenant admin settings snapshot",
    openApiSchema: {
      type: "object",
      additionalProperties: false,
    },
    schema: tenantAdminSettingsReadSchema,
    status: 200,
  },
  summary: "Read tenant admin settings",
  tags: ["system-admin"],
});

export const tenantSettingsRouteContracts = [
  systemAdminReadTenantSettingsRouteContract,
  systemAdminUpdateTenantSettingRouteContract,
] as const;
