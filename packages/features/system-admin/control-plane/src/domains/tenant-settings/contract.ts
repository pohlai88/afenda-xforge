import { defineRouteContract } from "@repo/api";
import { systemAdminMutationResultSchema } from "../../schema.ts";
import { tenantAdminSettingUpdateSchema } from "./schema.ts";

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

export const tenantSettingsRouteContracts = [
  systemAdminUpdateTenantSettingRouteContract,
] as const;
