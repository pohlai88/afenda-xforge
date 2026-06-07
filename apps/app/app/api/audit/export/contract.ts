import { addRouteContractsToOpenApi, defineRouteContract } from "@repo/api";
import type { OpenApiDocument } from "@repo/openapi";
import { z } from "zod";

export const auditExportQuerySchema = z.object({
  companyId: z.string().uuid().optional(),
  actorId: z.string().trim().min(1).optional(),
  action: z.string().trim().min(1).optional(),
  targetType: z.string().trim().min(1).optional(),
  targetId: z.string().trim().min(1).optional(),
  requestId: z.string().trim().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
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
          action: { type: "string" },
          targetType: { type: "string" },
          targetId: { type: "string" },
          requestId: { type: "string" },
          from: { type: "string", format: "date-time" },
          to: { type: "string", format: "date-time" },
          format: {
            type: "string",
            enum: ["json", "csv"],
            default: "csv",
          },
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
