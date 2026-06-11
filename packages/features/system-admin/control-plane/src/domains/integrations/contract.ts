import { defineRouteContract } from "@repo/api";
import { z } from "zod";

export const systemAdminWebhookEndpointSchema = z.object({
  applicationId: z.string().trim().min(1).optional(),
  applicationName: z.string().trim().min(1).optional(),
  companyId: z.string().trim().min(1).optional(),
  endpointId: z.string().trim().min(1),
  eventOwner: z.string().trim().min(1),
  id: z.string().trim().min(1),
  provider: z.string().trim().min(1),
  schemaVersion: z.string().trim().min(1),
  status: z.string().trim().min(1),
  tenantId: z.string().trim().min(1),
});

export const upsertSystemAdminWebhookEndpointInputSchema = z.object({
  applicationId: z.string().trim().min(1).optional(),
  applicationName: z.string().trim().min(1).optional(),
  companyId: z.string().trim().min(1).optional(),
  endpointId: z.string().trim().min(1),
  eventOwner: z.string().trim().min(1),
  provider: z.string().trim().min(1),
  schemaVersion: z.string().trim().min(1),
  secret: z.string().trim().min(1),
  status: z.string().trim().min(1).optional(),
});

export const integrationCapabilities = {
  integrationsRead: "system-admin.integrations.read",
  integrationsWrite: "system-admin.integrations.write",
} as const;

export const systemAdminListWebhookEndpointsRouteContract = defineRouteContract(
  {
    audience: "client",
    method: "GET",
    operationId: "listSystemAdminWebhookEndpoints",
    path: "/api/system-admin/webhooks/endpoints",
    success: {
      description: "System admin webhook endpoints",
      openApiSchema: {
        type: "array",
        items: { $ref: "#/components/schemas/SystemAdminWebhookEndpoint" },
      },
      schema: systemAdminWebhookEndpointSchema.array(),
      status: 200,
    },
    summary: "List governed webhook endpoints",
    tags: ["system-admin", "webhooks"],
  }
);

export const systemAdminUpsertWebhookEndpointRouteContract =
  defineRouteContract({
    audience: "client",
    method: "POST",
    operationId: "upsertSystemAdminWebhookEndpoint",
    path: "/api/system-admin/webhooks/endpoints",
    request: {
      body: {
        openApiSchema: {
          $ref: "#/components/schemas/UpsertSystemAdminWebhookEndpointInput",
        },
        schema: upsertSystemAdminWebhookEndpointInputSchema,
      },
    },
    success: {
      description: "Upserted system admin webhook endpoint",
      openApiSchema: {
        $ref: "#/components/schemas/SystemAdminWebhookEndpoint",
      },
      schema: systemAdminWebhookEndpointSchema,
      status: 200,
    },
    summary: "Create or update a governed webhook endpoint",
    tags: ["system-admin", "webhooks"],
  });

export const integrationsRouteContracts = [
  systemAdminListWebhookEndpointsRouteContract,
  systemAdminUpsertWebhookEndpointRouteContract,
] as const;
