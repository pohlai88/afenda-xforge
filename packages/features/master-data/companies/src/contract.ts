import type { OpenApiDocument } from "@repo/api";
import {
  addRouteContractsToOpenApi,
  addSchemasToOpenApi,
  defineRouteContract,
} from "@repo/api";
import type { PaginatedList } from "@repo/shared";
import { z } from "zod";

export const companyStatusSchema = z.enum(["active", "inactive"]);

export const companySchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  status: companyStatusSchema,
});

export const listCompaniesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().min(1).optional(),
});

export const companyListSchema = z.object({
  items: z.array(companySchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

export const createCompanyBodySchema = z.object({
  code: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(120),
});

export const updateActiveCompanyBodySchema = z.object({
  code: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(120),
});

export const updateCompanyBodySchema = updateActiveCompanyBodySchema;

export const companyIdParamsSchema = z.object({
  companyId: z.string().uuid(),
});

export type Company = z.infer<typeof companySchema>;
export type CompanyList = PaginatedList<Company>;
export type CreateCompanyBody = z.infer<typeof createCompanyBodySchema>;
export type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>;
export type UpdateActiveCompanyBody = z.infer<
  typeof updateActiveCompanyBodySchema
>;
export type UpdateCompanyBody = z.infer<typeof updateCompanyBodySchema>;
export type CompanyIdParams = z.infer<typeof companyIdParamsSchema>;

export const companyApiRoutePaths = {
  collection: "/api/companies",
  company: (companyId: string) => `/api/companies/${companyId}`,
} as const;

export const listCompaniesRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "listCompanies",
  path: "/api/companies",
  request: {
    query: {
      schema: listCompaniesQuerySchema,
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
    description: "Company collection",
    openApiSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          items: {
            $ref: "#/components/schemas/Company",
          },
        },
        page: { type: "number" },
        pageSize: { type: "number" },
        total: { type: "number" },
      },
      required: ["items", "page", "pageSize", "total"],
    },
    schema: companyListSchema,
    status: 200,
  },
  summary: "List companies",
  tags: ["companies"],
});

export const createCompanyRouteContract = defineRouteContract({
  audience: "client",
  method: "POST",
  operationId: "createCompany",
  path: "/api/companies",
  request: {
    body: {
      schema: createCompanyBodySchema,
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
    description: "Created company",
    openApiSchema: {
      $ref: "#/components/schemas/Company",
    },
    schema: companySchema,
    status: 201,
  },
  summary: "Create a company",
  tags: ["companies"],
});

export const getActiveCompanyRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "getActiveCompany",
  path: "/api/companies/active",
  success: {
    description: "Active company",
    openApiSchema: {
      $ref: "#/components/schemas/Company",
    },
    schema: companySchema,
    status: 200,
  },
  summary: "Get the active company",
  tags: ["companies"],
});

export const updateActiveCompanyRouteContract = defineRouteContract({
  audience: "client",
  method: "PATCH",
  operationId: "updateActiveCompany",
  path: "/api/companies/active",
  request: {
    body: {
      schema: updateActiveCompanyBodySchema,
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
    description: "Updated company",
    openApiSchema: {
      $ref: "#/components/schemas/Company",
    },
    schema: companySchema,
    status: 200,
  },
  summary: "Update the active company",
  tags: ["companies"],
});

export const updateCompanyRouteContract = defineRouteContract({
  audience: "client",
  method: "PATCH",
  operationId: "updateCompany",
  path: "/api/companies/{companyId}",
  request: {
    body: {
      schema: updateCompanyBodySchema,
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
    params: {
      schema: companyIdParamsSchema,
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          companyId: { type: "string", format: "uuid" },
        },
        required: ["companyId"],
      },
    },
  },
  success: {
    description: "Updated company",
    openApiSchema: {
      $ref: "#/components/schemas/Company",
    },
    schema: companySchema,
    status: 200,
  },
  summary: "Update a company",
  tags: ["companies"],
});

export const archiveCompanyRouteContract = defineRouteContract({
  audience: "client",
  method: "DELETE",
  operationId: "archiveCompany",
  path: "/api/companies/{companyId}",
  request: {
    params: {
      schema: companyIdParamsSchema,
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          companyId: { type: "string", format: "uuid" },
        },
        required: ["companyId"],
      },
    },
  },
  success: {
    description: "Archived company",
    openApiSchema: {
      $ref: "#/components/schemas/Company",
    },
    schema: companySchema,
    status: 200,
  },
  summary: "Archive a company",
  tags: ["companies"],
});

export const companyRouteContracts = [
  listCompaniesRouteContract,
  createCompanyRouteContract,
  getActiveCompanyRouteContract,
  updateActiveCompanyRouteContract,
  updateCompanyRouteContract,
  archiveCompanyRouteContract,
] as const;

export const companyOpenApiSchemas = {
  Company: {
    type: "object",
    additionalProperties: false,
    properties: {
      id: { type: "string" },
      code: { type: "string" },
      name: { type: "string" },
      status: { type: "string", enum: ["active", "inactive"] },
    },
    required: ["id", "code", "name", "status"],
  },
} as const;

export const registerCompanyOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, companyOpenApiSchemas);
  addRouteContractsToOpenApi(document, companyRouteContracts);
};
