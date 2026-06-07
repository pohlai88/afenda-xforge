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

const auditActorTypeSchema = z.enum([
  "user",
  "system",
  "service",
  "integration",
  "agent",
]);

const auditOutcomeSchema = z.enum(["success", "failure", "denied"]);

const auditChannelSchema = z.enum([
  "web",
  "api",
  "server_action",
  "cron",
  "webhook",
  "migration",
]);

const auditChangeSchema = z.object({
  change: z.enum(["added", "removed", "changed"]).optional(),
  field: z.string().min(1),
  newValue: z.unknown().optional(),
  oldValue: z.unknown().optional(),
});

const auditEventSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  companyId: z.string().uuid().nullable().optional(),
  grantId: z.string().uuid().nullable().optional(),
  actorId: z.string().min(1),
  actorType: auditActorTypeSchema,
  actorRole: z.string().min(1).nullable().optional(),
  module: z.string().min(1).nullable().optional(),
  surface: z.string().min(1).nullable().optional(),
  route: z.string().min(1).nullable().optional(),
  subjectType: z.string().min(1).nullable().optional(),
  subjectId: z.string().min(1).nullable().optional(),
  action: z.string().min(1),
  summary: z.string().min(1),
  outcome: auditOutcomeSchema,
  targetType: z.string().min(1),
  targetId: z.string().min(1),
  targetDisplayName: z.string().min(1).nullable().optional(),
  reason: z.string().min(1),
  policyReference: z.string().min(1).nullable().optional(),
  approvalId: z.string().min(1).nullable().optional(),
  channel: auditChannelSchema.nullable().optional(),
  requestId: z.string().min(1),
  operationId: z.string().min(1).nullable().optional(),
  before: z.record(z.string(), auditJsonValueSchema),
  after: z.record(z.string(), auditJsonValueSchema),
  diff: z.array(auditChangeSchema),
  metadata: z.record(z.string(), auditJsonValueSchema),
  occurredAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export const auditListQuerySchema = z.object({
  companyId: z.string().uuid().optional(),
  actorId: z.string().trim().min(1).optional(),
  actorType: auditActorTypeSchema.optional(),
  actorRole: z.string().trim().min(1).optional(),
  module: z.string().trim().min(1).optional(),
  surface: z.string().trim().min(1).optional(),
  route: z.string().trim().min(1).optional(),
  subjectType: z.string().trim().min(1).optional(),
  subjectId: z.string().trim().min(1).optional(),
  action: z.string().trim().min(1).optional(),
  summary: z.string().trim().min(1).optional(),
  outcome: auditOutcomeSchema.optional(),
  targetType: z.string().trim().min(1).optional(),
  targetId: z.string().trim().min(1).optional(),
  targetDisplayName: z.string().trim().min(1).optional(),
  channel: auditChannelSchema.optional(),
  requestId: z.string().trim().min(1).optional(),
  operationId: z.string().trim().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const auditEventListSchema = z.object({
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

const auditOpenApiSchemas = {
  AuditEvent: {
    type: "object",
    additionalProperties: false,
    properties: {
      id: { type: "string", format: "uuid" },
      tenantId: { type: "string", format: "uuid" },
      companyId: { type: "string", format: "uuid", nullable: true },
      grantId: { type: "string", format: "uuid", nullable: true },
      actorId: { type: "string" },
      actorType: {
        type: "string",
        enum: ["user", "system", "service", "integration", "agent"],
      },
      actorRole: { type: "string", nullable: true },
      module: { type: "string", nullable: true },
      surface: { type: "string", nullable: true },
      route: { type: "string", nullable: true },
      subjectType: { type: "string", nullable: true },
      subjectId: { type: "string", nullable: true },
      action: { type: "string" },
      summary: { type: "string" },
      outcome: {
        type: "string",
        enum: ["success", "failure", "denied"],
      },
      targetType: { type: "string" },
      targetId: { type: "string" },
      targetDisplayName: { type: "string", nullable: true },
      reason: { type: "string" },
      policyReference: { type: "string", nullable: true },
      approvalId: { type: "string", nullable: true },
      channel: {
        type: "string",
        nullable: true,
        enum: ["web", "api", "server_action", "cron", "webhook", "migration"],
      },
      requestId: { type: "string" },
      operationId: { type: "string", nullable: true },
      before: { type: "object", additionalProperties: true },
      after: { type: "object", additionalProperties: true },
      diff: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: true,
          properties: {
            change: {
              type: "string",
              enum: ["added", "removed", "changed"],
            },
            field: { type: "string" },
            newValue: {},
            oldValue: {},
          },
        },
      },
      metadata: { type: "object", additionalProperties: true },
      occurredAt: { type: "string", format: "date-time" },
      createdAt: { type: "string", format: "date-time" },
    },
    required: [
      "id",
      "tenantId",
      "actorId",
      "actorType",
      "action",
      "summary",
      "outcome",
      "targetType",
      "targetId",
      "reason",
      "requestId",
      "before",
      "after",
      "diff",
      "metadata",
      "occurredAt",
      "createdAt",
    ],
  },
} as const;

export const registerAuditOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, auditOpenApiSchemas);
  addRouteContractsToOpenApi(document, [listAuditEventsRouteContract]);
};
