import { defineRouteContract } from "@repo/api";
import { systemAdminMutationResultSchema } from "../../schema.ts";
import {
  customizationGovernanceCommandSchema,
  systemAdminCustomizationReviewRequestSchema,
  systemAdminCustomizationReviewSchema,
} from "./schema.ts";

export const customizationCapabilities = {
  customizationPublish: "system-admin.customization.publish",
  customizationRead: "system-admin.customization.read",
} as const;

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

export const systemAdminReviewCustomizationRouteContract = defineRouteContract({
  audience: "client",
  method: "POST",
  operationId: "reviewSystemAdminCustomizationImport",
  path: "/api/system-admin/customizations/review",
  request: {
    body: {
      openApiSchema: {
        $ref: "#/components/schemas/SystemAdminCustomizationReviewRequest",
      },
      schema: systemAdminCustomizationReviewRequestSchema,
    },
  },
  success: {
    description: "Customization import review",
    openApiSchema: {
      $ref: "#/components/schemas/SystemAdminCustomizationReview",
    },
    schema: systemAdminCustomizationReviewSchema,
    status: 200,
  },
  summary: "Review governed customization import",
  tags: ["system-admin"],
});

export const customizationRouteContracts = [
  systemAdminPublishCustomizationRouteContract,
  systemAdminReviewCustomizationRouteContract,
] as const;
