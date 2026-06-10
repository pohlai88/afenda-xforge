import type { OpenApiDocument } from "@repo/api";
import { addRouteContractsToOpenApi, addSchemasToOpenApi } from "@repo/api";
import {
  accessCapabilities,
  accessRouteContracts,
} from "./domains/access/contract.ts";
import {
  auditCapabilities,
  auditRouteContracts,
} from "./domains/audit/contract.ts";
import {
  customizationCapabilities,
  customizationRouteContracts,
} from "./domains/customization/contract.ts";
import {
  integrationCapabilities,
  integrationsRouteContracts,
} from "./domains/integrations/contract.ts";
import {
  operationsCapabilities,
  operationsRouteContracts,
} from "./domains/operations/contract.ts";
import {
  overviewCapabilities,
  overviewRouteContracts,
} from "./domains/overview/contract.ts";
import {
  tenantSettingsCapabilities,
  tenantSettingsRouteContracts,
} from "./domains/tenant-settings/contract.ts";

export const systemAdminCapabilities = {
  ...auditCapabilities,
  ...customizationCapabilities,
  ...integrationCapabilities,
  ...operationsCapabilities,
  ...overviewCapabilities,
  ...tenantSettingsCapabilities,
  ...accessCapabilities,
} as const;

export const systemAdminRouteContracts = [
  ...overviewRouteContracts,
  ...tenantSettingsRouteContracts,
  ...accessRouteContracts,
  ...customizationRouteContracts,
  ...auditRouteContracts,
  ...operationsRouteContracts,
  ...integrationsRouteContracts,
] as const;

export { systemAdminAssignRoleRouteContract } from "./domains/access/contract.ts";
export {
  systemAdminPublishCustomizationRouteContract,
  systemAdminReviewCustomizationRouteContract,
} from "./domains/customization/contract.ts";
export {
  systemAdminListWebhookEndpointsRouteContract,
  systemAdminUpsertWebhookEndpointRouteContract,
} from "./domains/integrations/contract.ts";
export {
  systemAdminListSectionsRouteContract,
  systemAdminReadOverviewRouteContract,
} from "./domains/overview/contract.ts";
export { listSystemAdminSectionsQuerySchema } from "./domains/overview/schema.ts";
export {
  systemAdminReadTenantSettingsRouteContract,
  systemAdminUpdateTenantSettingRouteContract,
  tenantAdminSettingsReadSchema,
} from "./domains/tenant-settings/contract.ts";
export { roleAssignmentCommandSchema } from "./domains/access/schema.ts";
export {
  customizationGovernanceCommandSchema,
  systemAdminCustomizationReviewRequestSchema,
} from "./domains/customization/schema.ts";
export {
  systemAdminWebhookEndpointSchema,
  upsertSystemAdminWebhookEndpointInputSchema,
} from "./domains/integrations/contract.ts";
export { tenantAdminSettingUpdateSchema } from "./domains/tenant-settings/schema.ts";

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
  SystemAdminCustomizationReviewCategory: {
    type: "string",
    enum: [
      "identity",
      "layering",
      "policy",
      "reference",
      "schema",
      "scope",
      "surface",
    ],
  },
  SystemAdminCustomizationReviewReason: {
    type: "string",
    enum: [
      "duplicate-target",
      "metadata-version-drift",
      "node-removed",
      "node-renamed",
      "node-shape-drift",
    ],
  },
  SystemAdminCustomizationReviewItem: {
    type: "object",
    additionalProperties: false,
    properties: {
      category: {
        $ref: "#/components/schemas/SystemAdminCustomizationReviewCategory",
      },
      code: { type: "string" },
      hint: { type: "string" },
      message: { type: "string" },
      metadataNodeId: { type: "string" },
      metadataNodeKey: { type: "string" },
      path: {
        type: "array",
        items: {
          oneOf: [{ type: "string" }, { type: "integer" }],
        },
      },
      reason: {
        $ref: "#/components/schemas/SystemAdminCustomizationReviewReason",
      },
      severity: { type: "string", enum: ["error", "warning"] },
      surface: { type: "string" },
      targetNodeId: { type: "string" },
      targetNodeKey: { type: "string" },
    },
    required: ["category", "code", "message", "path", "severity"],
  },
  SystemAdminCustomizationReviewSummary: {
    type: "object",
    additionalProperties: false,
    properties: {
      blockedCount: { type: "integer" },
      byCategory: {
        type: "object",
        additionalProperties: false,
        properties: {
          identity: { type: "integer" },
          layering: { type: "integer" },
          policy: { type: "integer" },
          reference: { type: "integer" },
          schema: { type: "integer" },
          scope: { type: "integer" },
          surface: { type: "integer" },
        },
        required: [
          "identity",
          "layering",
          "policy",
          "reference",
          "schema",
          "scope",
          "surface",
        ],
      },
      reviewCount: { type: "integer" },
      totalCount: { type: "integer" },
    },
    required: ["blockedCount", "byCategory", "reviewCount", "totalCount"],
  },
  SystemAdminCustomizationReview: {
    type: "object",
    additionalProperties: false,
    properties: {
      customizationId: { type: "string" },
      items: {
        type: "array",
        items: {
          $ref: "#/components/schemas/SystemAdminCustomizationReviewItem",
        },
      },
      mode: {
        type: "string",
        enum: ["draft-with-warnings", "strict"],
      },
      publishable: { type: "boolean" },
      requiresReview: { type: "boolean" },
      status: {
        type: "string",
        enum: ["blocked", "review", "valid"],
      },
      summary: {
        $ref: "#/components/schemas/SystemAdminCustomizationReviewSummary",
      },
      tenantId: { type: "string" },
      valid: { type: "boolean" },
      warnings: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: [
      "customizationId",
      "items",
      "mode",
      "publishable",
      "requiresReview",
      "status",
      "summary",
      "tenantId",
      "valid",
      "warnings",
    ],
  },
  SystemAdminCustomizationReviewRequest: {
    type: "object",
    additionalProperties: false,
    properties: {
      fixture: {
        type: "object",
      },
      metadata: {
        oneOf: [{ type: "object" }, { type: "object" }],
      },
      mode: {
        type: "string",
        enum: ["draft-with-warnings", "strict"],
      },
    },
    required: ["fixture", "metadata", "mode"],
  },
  SystemAdminWebhookEndpoint: {
    type: "object",
    additionalProperties: false,
    properties: {
      applicationId: { type: "string" },
      applicationName: { type: "string" },
      companyId: { type: "string" },
      endpointId: { type: "string" },
      eventOwner: { type: "string" },
      id: { type: "string" },
      provider: { type: "string" },
      schemaVersion: { type: "string" },
      status: { type: "string" },
      tenantId: { type: "string" },
    },
    required: [
      "endpointId",
      "eventOwner",
      "id",
      "provider",
      "schemaVersion",
      "status",
      "tenantId",
    ],
  },
  UpsertSystemAdminWebhookEndpointInput: {
    type: "object",
    additionalProperties: false,
    properties: {
      applicationId: { type: "string" },
      applicationName: { type: "string" },
      companyId: { type: "string" },
      endpointId: { type: "string" },
      eventOwner: { type: "string" },
      provider: { type: "string" },
      schemaVersion: { type: "string" },
      secret: { type: "string" },
      status: { type: "string" },
    },
    required: [
      "endpointId",
      "eventOwner",
      "provider",
      "schemaVersion",
      "secret",
    ],
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
