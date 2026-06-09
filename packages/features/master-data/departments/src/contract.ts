import type { OpenApiDocument } from "@repo/api";
import {
  addRouteContractsToOpenApi,
  addSchemasToOpenApi,
  defineRouteContract,
} from "@repo/api";
import type { PaginatedList } from "@repo/shared";
import { z } from "zod";

export const departmentStatusSchema = z.enum(["active", "inactive"]);

export const departmentSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  status: departmentStatusSchema,
});

export const listDepartmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().min(1).optional(),
});

export const departmentListSchema = z.object({
  items: z.array(departmentSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

export const createDepartmentBodySchema = z.object({
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().min(1).max(120),
});

export type Department = z.infer<typeof departmentSchema>;
export type DepartmentList = PaginatedList<Department>;
export type CreateDepartmentBody = z.infer<typeof createDepartmentBodySchema>;
export type ListDepartmentsQuery = z.infer<typeof listDepartmentsQuerySchema>;

export const listDepartmentsRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "listDepartments",
  path: "/api/departments",
  request: {
    query: {
      schema: listDepartmentsQuerySchema,
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          page: { type: "number", minimum: 1, default: 1 },
          pageSize: { type: "number", minimum: 1, maximum: 100, default: 25 },
          search: { type: "string" },
        },
      },
    },
  },
  success: {
    description: "Department collection",
    openApiSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          items: {
            $ref: "#/components/schemas/Department",
          },
        },
        page: { type: "number" },
        pageSize: { type: "number" },
        total: { type: "number" },
      },
      required: ["items", "page", "pageSize", "total"],
    },
    schema: departmentListSchema,
    status: 200,
  },
  summary: "List departments",
  tags: ["departments"],
});

export const createDepartmentRouteContract = defineRouteContract({
  audience: "client",
  description:
    "Creates a department record once the real execution pipeline is wired in.",
  method: "POST",
  operationId: "createDepartment",
  path: "/api/departments",
  request: {
    body: {
      schema: createDepartmentBodySchema,
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          code: { type: "string" },
          name: { type: "string" },
        },
        required: ["code", "name"],
      },
    },
  },
  success: {
    description: "Created department",
    openApiSchema: {
      $ref: "#/components/schemas/Department",
    },
    schema: departmentSchema,
    status: 201,
  },
  summary: "Create a department",
  tags: ["departments"],
});

export const departmentRouteContracts = [
  listDepartmentsRouteContract,
  createDepartmentRouteContract,
] as const;

export const departmentOpenApiSchemas = {
  Department: {
    type: "object",
    additionalProperties: false,
    properties: {
      id: { type: "string" },
      code: { type: "string" },
      name: { type: "string" },
      status: {
        type: "string",
        enum: ["active", "inactive"],
      },
    },
    required: ["id", "code", "name", "status"],
  },
} as const;

export const registerDepartmentOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, departmentOpenApiSchemas);
  addRouteContractsToOpenApi(document, departmentRouteContracts);
};
