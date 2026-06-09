import type { OpenApiDocument } from "@repo/api";
import {
  addRouteContractsToOpenApi,
  addSchemasToOpenApi,
  defineRouteContract,
} from "@repo/api";
import type { PaginatedList } from "@repo/shared";
import { z } from "zod";

export const jobPositionStatusSchema = z.enum([
  "active",
  "planned",
  "frozen",
  "closed",
]);

export const jobPositionSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  orgUnitId: z.string(),
  status: jobPositionStatusSchema,
  managerEmployeeId: z.string().optional(),
  costCenterCode: z.string().optional(),
  locationCode: z.string().optional(),
  effectiveFrom: z.string().optional(),
});

export const listJobPositionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().min(1).optional(),
  status: jobPositionStatusSchema.optional(),
  orgUnitId: z.string().trim().min(1).optional(),
  locationCode: z.string().trim().min(1).optional(),
});

export const jobPositionListSchema = z.object({
  items: z.array(jobPositionSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

export const createJobPositionBodySchema = z.object({
  code: z.string().trim().min(1).max(32),
  title: z.string().trim().min(1).max(160),
  orgUnitId: z.string().trim().min(1).max(64),
  status: jobPositionStatusSchema.default("active").optional(),
  managerEmployeeId: z.string().trim().min(1).optional(),
  costCenterCode: z.string().trim().min(1).max(64).optional(),
  locationCode: z.string().trim().min(1).max(64).optional(),
  effectiveFrom: z.string().trim().min(1).max(64).optional(),
});

export type JobPositionStatus = z.infer<typeof jobPositionStatusSchema>;
export type JobPosition = z.infer<typeof jobPositionSchema>;
export type JobPositionList = PaginatedList<JobPosition>;
export type CreateJobPositionBody = z.infer<typeof createJobPositionBodySchema>;
export type ListJobPositionsQuery = z.infer<typeof listJobPositionsQuerySchema>;

export const listJobPositionsRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "listJobPositions",
  path: "/api/job-positions",
  request: {
    query: {
      schema: listJobPositionsQuerySchema,
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          page: { type: "number", minimum: 1, default: 1 },
          pageSize: { type: "number", minimum: 1, maximum: 100, default: 25 },
          search: { type: "string" },
          status: {
            type: "string",
            enum: ["active", "planned", "frozen", "closed"],
          },
          orgUnitId: { type: "string" },
          locationCode: { type: "string" },
        },
      },
    },
  },
  success: {
    description: "Job position collection",
    openApiSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          items: {
            $ref: "#/components/schemas/JobPosition",
          },
        },
        page: { type: "number" },
        pageSize: { type: "number" },
        total: { type: "number" },
      },
      required: ["items", "page", "pageSize", "total"],
    },
    schema: jobPositionListSchema,
    status: 200,
  },
  summary: "List job positions",
  tags: ["job-positions"],
});

export const createJobPositionRouteContract = defineRouteContract({
  audience: "client",
  method: "POST",
  operationId: "createJobPosition",
  path: "/api/job-positions",
  request: {
    body: {
      schema: createJobPositionBodySchema,
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          code: { type: "string" },
          title: { type: "string" },
          orgUnitId: { type: "string" },
          status: {
            type: "string",
            enum: ["active", "planned", "frozen", "closed"],
          },
          managerEmployeeId: { type: "string" },
          costCenterCode: { type: "string" },
          locationCode: { type: "string" },
          effectiveFrom: { type: "string" },
        },
        required: ["code", "title", "orgUnitId"],
      },
    },
  },
  success: {
    description: "Created job position",
    openApiSchema: {
      $ref: "#/components/schemas/JobPosition",
    },
    schema: jobPositionSchema,
    status: 201,
  },
  summary: "Create a job position",
  tags: ["job-positions"],
});

export const jobPositionRouteContracts = [
  listJobPositionsRouteContract,
  createJobPositionRouteContract,
] as const;

export const jobPositionOpenApiSchemas = {
  JobPosition: {
    type: "object",
    additionalProperties: false,
    properties: {
      id: { type: "string" },
      code: { type: "string" },
      title: { type: "string" },
      orgUnitId: { type: "string" },
      status: {
        type: "string",
        enum: ["active", "planned", "frozen", "closed"],
      },
      managerEmployeeId: { type: "string" },
      costCenterCode: { type: "string" },
      locationCode: { type: "string" },
      effectiveFrom: { type: "string" },
    },
    required: ["id", "code", "title", "orgUnitId", "status"],
  },
} as const;

export const registerJobPositionOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, jobPositionOpenApiSchemas);
  addRouteContractsToOpenApi(document, jobPositionRouteContracts);
};
