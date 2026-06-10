import type { OpenApiDocument } from "@repo/api";
import {
  addRouteContractsToOpenApi,
  addSchemasToOpenApi,
  defineRouteContract,
} from "@repo/api";
import { hrConsoleCapabilities } from "./feature-scope.ts";
import {
  grantHrDelegationCommandSchema,
  hrConsoleOverviewSchema,
  hrConsoleSectionSchema,
  hrDelegationGrantSchema,
  listHrConsoleSectionsQuerySchema,
  revokeHrDelegationCommandSchema,
} from "./schema.ts";

export const hrConsoleReadOverviewRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "readHrConsoleOverview",
  path: "/api/hr/console/overview",
  success: {
    description: "HR console overview",
    openApiSchema: {
      $ref: "#/components/schemas/HrConsoleOverview",
    },
    schema: hrConsoleOverviewSchema,
    status: 200,
  },
  summary: "Read HR console overview",
  tags: ["hr-console"],
});

export const hrConsoleListSectionsRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "listHrConsoleSections",
  path: "/api/hr/console/sections",
  request: {
    query: {
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          domain: { type: "string" },
        },
      },
      schema: listHrConsoleSectionsQuerySchema,
    },
  },
  success: {
    description: "HR console sections",
    openApiSchema: {
      type: "array",
      items: { $ref: "#/components/schemas/HrConsoleSection" },
    },
    schema: hrConsoleSectionSchema.array(),
    status: 200,
  },
  summary: "List HR console sections",
  tags: ["hr-console"],
});

export const hrConsoleListDelegationRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "listHrConsoleDelegationGrants",
  path: "/api/hr/console/delegation",
  success: {
    description: "HR console delegation grants",
    openApiSchema: {
      type: "array",
      items: { $ref: "#/components/schemas/HrDelegationGrant" },
    },
    schema: hrDelegationGrantSchema.array(),
    status: 200,
  },
  summary: "List HR console delegation grants",
  tags: ["hr-console"],
});

export const hrConsoleGrantDelegationRouteContract = defineRouteContract({
  audience: "client",
  method: "POST",
  operationId: "grantHrConsoleDelegation",
  path: "/api/hr/console/delegation",
  request: {
    body: {
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          capabilities: {
            type: "array",
            items: { type: "string" },
          },
          granteeId: { type: "string" },
          reason: { type: "string" },
          validFrom: { type: "string" },
          validTo: { type: "string" },
        },
        required: ["capabilities", "granteeId", "reason"],
      },
      schema: grantHrDelegationCommandSchema,
    },
  },
  success: {
    description: "Granted HR console delegation",
    openApiSchema: {
      $ref: "#/components/schemas/HrDelegationGrant",
    },
    schema: hrDelegationGrantSchema,
    status: 201,
  },
  summary: "Grant HR console delegation",
  tags: ["hr-console"],
});

export const hrConsoleRevokeDelegationRouteContract = defineRouteContract({
  audience: "client",
  method: "POST",
  operationId: "revokeHrConsoleDelegation",
  path: "/api/hr/console/delegation/revoke",
  request: {
    body: {
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          grantId: { type: "string" },
          reason: { type: "string" },
        },
        required: ["grantId", "reason"],
      },
      schema: revokeHrDelegationCommandSchema,
    },
  },
  success: {
    description: "Revoked HR console delegation",
    openApiSchema: {
      $ref: "#/components/schemas/HrDelegationGrant",
    },
    schema: hrDelegationGrantSchema,
    status: 200,
  },
  summary: "Revoke HR console delegation",
  tags: ["hr-console"],
});

export const hrConsoleRouteContracts = [
  hrConsoleReadOverviewRouteContract,
  hrConsoleListSectionsRouteContract,
  hrConsoleListDelegationRouteContract,
  hrConsoleGrantDelegationRouteContract,
  hrConsoleRevokeDelegationRouteContract,
] as const;

export const hrConsoleOpenApiSchemas = {
  HrConsoleOverview: {
    type: "object",
    additionalProperties: false,
    properties: {
      actingAsConsoleOperator: { type: "boolean" },
      canDelegate: { type: "boolean" },
      canDomainWrite: { type: "boolean" },
      companyId: { type: "string" },
      governanceMode: {
        type: "string",
        enum: ["unassigned_fallback", "operator_assigned"],
      },
      grantedCapabilities: {
        type: "array",
        items: { type: "string" },
      },
      sections: {
        type: "array",
        items: { $ref: "#/components/schemas/HrConsoleSection" },
      },
      tenantId: { type: "string" },
      warnings: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: [
      "canDelegate",
      "canDomainWrite",
      "companyId",
      "governanceMode",
      "grantedCapabilities",
      "sections",
      "tenantId",
      "warnings",
    ],
  },
  HrConsoleSection: {
    type: "object",
    additionalProperties: false,
    properties: {
      appPath: { type: "string" },
      description: { type: "string" },
      domain: { type: "string" },
      id: { type: "string" },
      requiredPermission: { type: "string" },
      status: { type: "string", enum: ["ready", "deferred", "blocked"] },
      title: { type: "string" },
    },
    required: [
      "appPath",
      "description",
      "domain",
      "id",
      "requiredPermission",
      "status",
      "title",
    ],
  },
  HrDelegationGrant: {
    type: "object",
    additionalProperties: false,
    properties: {
      capabilities: {
        type: "array",
        items: { type: "string" },
      },
      companyId: { type: "string" },
      createdAt: { type: "string" },
      granteeId: { type: "string" },
      grantorId: { type: "string" },
      id: { type: "string" },
      reason: { type: "string" },
      revokedAt: { type: "string" },
      tenantId: { type: "string" },
      validFrom: { type: "string" },
      validTo: { type: "string" },
    },
    required: [
      "capabilities",
      "companyId",
      "createdAt",
      "granteeId",
      "grantorId",
      "id",
      "tenantId",
    ],
  },
} as const;

export const registerHrConsoleOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, hrConsoleOpenApiSchemas);
  addRouteContractsToOpenApi(document, hrConsoleRouteContracts);
};

export { hrConsoleCapabilities };
