import type { OpenApiDocument } from "@repo/api";
import {
  addRouteContractsToOpenApi,
  addSchemasToOpenApi,
  defineRouteContract,
} from "@repo/api";
import {
  customizationGovernanceCommandSchema,
  listSystemAdminSectionsQuerySchema,
  roleAssignmentCommandSchema,
  systemAdminMutationResultSchema,
  systemAdminOverviewSchema,
  systemAdminSectionSchema,
  tenantAdminSettingUpdateSchema,
} from "./schema.ts";

export const systemAdminCapabilities = {
  auditRead: "system-admin.audit.read",
  customizationPublish: "system-admin.customization.publish",
  customizationRead: "system-admin.customization.read",
  healthRead: "system-admin.health.read",
  overviewRead: "system-admin.overview.read",
  tenantSettingsRead: "system-admin.tenant-settings.read",
  tenantSettingsWrite: "system-admin.tenant-settings.write",
  usersAccessRead: "system-admin.users-access.read",
  usersAccessWrite: "system-admin.users-access.write",
} as const;

export const systemAdminReadOverviewRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "readSystemAdminOverview",
  path: "/api/system-admin/overview",
  success: {
    description: "System admin overview",
    openApiSchema: {
      $ref: "#/components/schemas/SystemAdminOverview",
    },
    schema: systemAdminOverviewSchema,
    status: 200,
  },
  summary: "Read system admin overview",
  tags: ["system-admin"],
});

export const systemAdminListSectionsRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "listSystemAdminSections",
  path: "/api/system-admin/sections",
  request: {
    query: {
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          domain: { type: "string" },
        },
      },
      schema: listSystemAdminSectionsQuerySchema,
    },
  },
  success: {
    description: "System admin sections",
    openApiSchema: {
      type: "array",
      items: { $ref: "#/components/schemas/SystemAdminSection" },
    },
    schema: systemAdminSectionSchema.array(),
    status: 200,
  },
  summary: "List system admin sections",
  tags: ["system-admin"],
});

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

export const systemAdminAssignRoleRouteContract = defineRouteContract({
  audience: "client",
  method: "POST",
  operationId: "assignSystemAdminRole",
  path: "/api/system-admin/users/roles",
  request: {
    body: {
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          reason: { type: "string" },
          roleKey: { type: "string" },
          targetUserId: { type: "string" },
        },
        required: ["reason", "roleKey", "targetUserId"],
      },
      schema: roleAssignmentCommandSchema,
    },
  },
  success: {
    description: "Accepted role assignment",
    openApiSchema: {
      $ref: "#/components/schemas/SystemAdminMutationResult",
    },
    schema: systemAdminMutationResultSchema,
    status: 202,
  },
  summary: "Assign governed tenant role",
  tags: ["system-admin"],
});

export const systemAdminPublishCustomizationRouteContract = defineRouteContract(
  {
    audience: "client",
    method: "POST",
    operationId: "publishSystemAdminCustomization",
    path: "/api/system-admin/customizations/publish",
    request: {
      body: {
        openApiSchema: {
          type: "object",
          additionalProperties: false,
          properties: {
            customizationId: { type: "string" },
            reason: { type: "string" },
          },
          required: ["customizationId", "reason"],
        },
        schema: customizationGovernanceCommandSchema,
      },
    },
    success: {
      description: "Accepted customization publication",
      openApiSchema: {
        $ref: "#/components/schemas/SystemAdminMutationResult",
      },
      schema: systemAdminMutationResultSchema,
      status: 202,
    },
    summary: "Publish governed customization",
    tags: ["system-admin"],
  }
);

export const systemAdminRouteContracts = [
  systemAdminReadOverviewRouteContract,
  systemAdminListSectionsRouteContract,
  systemAdminUpdateTenantSettingRouteContract,
  systemAdminAssignRoleRouteContract,
  systemAdminPublishCustomizationRouteContract,
] as const;

export const systemAdminOpenApiSchemas = {
  SystemAdminMutationResult: {
    type: "object",
    additionalProperties: false,
    properties: {
      action: { type: "string" },
      id: { type: "string" },
      status: { type: "string", enum: ["accepted"] },
      summary: { type: "string" },
      tenantId: { type: "string" },
    },
    required: ["action", "id", "status", "summary", "tenantId"],
  },
  SystemAdminOverview: {
    type: "object",
    additionalProperties: false,
    properties: {
      sections: {
        type: "array",
        items: { $ref: "#/components/schemas/SystemAdminSection" },
      },
      tenantId: { type: "string" },
      warnings: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: ["sections", "tenantId", "warnings"],
  },
  SystemAdminSection: {
    type: "object",
    additionalProperties: false,
    properties: {
      description: { type: "string" },
      domain: { type: "string" },
      id: { type: "string" },
      requiredPermission: { type: "string" },
      status: { type: "string", enum: ["ready", "deferred", "blocked"] },
      title: { type: "string" },
    },
    required: [
      "description",
      "domain",
      "id",
      "requiredPermission",
      "status",
      "title",
    ],
  },
} as const;

export const registerSystemAdminOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, systemAdminOpenApiSchemas);
  addRouteContractsToOpenApi(document, systemAdminRouteContracts);
};
