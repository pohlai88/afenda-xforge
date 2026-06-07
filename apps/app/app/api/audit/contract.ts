import {
  addRouteContractsToOpenApi,
  addSchemasToOpenApi,
  defineRouteContract,
} from "@repo/api";
import type { OpenApiDocument } from "@repo/openapi";
import { z } from "zod";

const auditJsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(auditJsonValueSchema),
    z.record(z.string(), auditJsonValueSchema),
  ])
);

export const auditEventSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  companyId: z.string().uuid().nullable().optional(),
  grantId: z.string().uuid().nullable().optional(),
  actorId: z.string().min(1),
  action: z.string().min(1),
  targetType: z.string().min(1),
  targetId: z.string().min(1),
  before: z.record(z.string(), auditJsonValueSchema),
  after: z.record(z.string(), auditJsonValueSchema),
  reason: z.string().min(1),
  requestId: z.string().min(1),
  metadata: z.record(z.string(), auditJsonValueSchema).nullable().optional(),
  createdAt: z.string().datetime(),
});

export const auditListQuerySchema = z.object({
  companyId: z.string().uuid().optional(),
  actorId: z.string().trim().min(1).optional(),
  action: z.string().trim().min(1).optional(),
  targetType: z.string().trim().min(1).optional(),
  targetId: z.string().trim().min(1).optional(),
  requestId: z.string().trim().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const auditEventListSchema = z.object({
  items: z.array(auditEventSchema),
  limit: z.number().int().min(1).max(100),
  offset: z.number().int().min(0),
  total: z.number().int().min(0),
});

export type AuditEvent = z.infer<typeof auditEventSchema>;
export type AuditEventList = z.infer<typeof auditEventListSchema>;
export type AuditListQuery = z.infer<typeof auditListQuerySchema>;

export const listAuditEventsRouteContract = defineRouteContract({
  audience: "client",
  description: "Lists tenant-scoped audit events for operators.",
  method: "GET",
  operationId: "listAuditEvents",
  path: "/api/audit",
  request: {
    query: {
      schema: auditListQuerySchema,
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
          limit: { type: "number", minimum: 1, maximum: 100, default: 50 },
          offset: { type: "number", minimum: 0, default: 0 },
        },
      },
    },
  },
  success: {
    description: "Audit event collection",
    openApiSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          items: {
            $ref: "#/components/schemas/AuditEvent",
          },
        },
        limit: { type: "number" },
        offset: { type: "number" },
        total: { type: "number" },
      },
      required: ["items", "limit", "offset", "total"],
    },
    schema: auditEventListSchema,
    status: 200,
  },
  summary: "List audit events",
  tags: ["audit"],
});

export const auditOpenApiSchemas = {
  AuditEvent: {
    type: "object",
    additionalProperties: false,
    properties: {
      id: { type: "string", format: "uuid" },
      tenantId: { type: "string", format: "uuid" },
      companyId: { type: "string", format: "uuid", nullable: true },
      grantId: { type: "string", format: "uuid", nullable: true },
      actorId: { type: "string" },
      action: { type: "string" },
      targetType: { type: "string" },
      targetId: { type: "string" },
      before: { type: "object", additionalProperties: true },
      after: { type: "object", additionalProperties: true },
      reason: { type: "string" },
      requestId: { type: "string" },
      metadata: { type: "object", additionalProperties: true, nullable: true },
      createdAt: { type: "string", format: "date-time" },
    },
    required: [
      "id",
      "tenantId",
      "actorId",
      "action",
      "targetType",
      "targetId",
      "before",
      "after",
      "reason",
      "requestId",
      "createdAt",
    ],
  },
} as const;

export const registerAuditOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, auditOpenApiSchemas);
  addRouteContractsToOpenApi(document, [listAuditEventsRouteContract]);
};
