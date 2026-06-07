import { addRouteContractsToOpenApi, defineRouteContract } from "@repo/api";
import type { OpenApiDocument } from "@repo/openapi";
import { z } from "zod";
import { auditListQuerySchema } from "../contract.ts";

export const auditExportQuerySchema = auditListQuerySchema.extend({
  format: z.enum(["json", "csv"]).default("csv"),
});

export type AuditExportQuery = z.infer<typeof auditExportQuerySchema>;

export const auditExportRouteContract = defineRouteContract({
  audience: "client",
  description: "Exports tenant-scoped audit events for operators.",
  method: "GET",
  operationId: "exportAuditEvents",
  path: "/api/audit/export",
  request: {
    query: {
      schema: auditExportQuerySchema,
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          companyId: { type: "string", format: "uuid" },
          actorId: { type: "string" },
          actorType: {
            type: "string",
            enum: ["user", "system", "service", "integration", "agent"],
          },
          actorRole: { type: "string" },
          module: { type: "string" },
          surface: { type: "string" },
          route: { type: "string" },
          subjectType: { type: "string" },
          subjectId: { type: "string" },
          action: { type: "string" },
          summary: { type: "string" },
          outcome: {
            type: "string",
            enum: ["success", "failure", "denied"],
          },
          targetType: { type: "string" },
          targetId: { type: "string" },
          targetDisplayName: { type: "string" },
          channel: {
            type: "string",
            enum: [
              "web",
              "api",
              "server_action",
              "cron",
              "webhook",
              "migration",
            ],
          },
          requestId: { type: "string" },
          operationId: { type: "string" },
          from: { type: "string", format: "date-time" },
          to: { type: "string", format: "date-time" },
          format: {
            type: "string",
            enum: ["json", "csv"],
            default: "csv",
          },
          limit: { type: "number", minimum: 1, maximum: 100, default: 50 },
          offset: { type: "number", minimum: 0, default: 0 },
        },
      },
    },
  },
  success: {
    description: "Audit export payload",
    openApiSchema: {
      type: "string",
    },
    schema: z.string(),
    status: 200,
  },
  summary: "Export audit events",
  tags: ["audit"],
});

export const registerAuditExportOpenApi = (document: OpenApiDocument): void => {
  addRouteContractsToOpenApi(document, [auditExportRouteContract]);
};
