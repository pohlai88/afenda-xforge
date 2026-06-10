import type { OpenApiDocument } from "@repo/api";
import {
  addRouteContractsToOpenApi,
  addSchemasToOpenApi,
  defineRouteContract,
} from "@repo/api";
import {
  companyListSchema,
  companySchema,
  createCompanyBodySchema,
  listCompaniesQuerySchema,
  updateActiveCompanyBodySchema,
} from "./schema.ts";

export type {
  Company,
  CompanyHierarchyNode,
  CompanyLifecycleBody,
  CompanyList,
  CreateCompanyBody,
  GetCompanyQuery,
  ListCompaniesQuery,
  UpdateActiveCompanyBody,
  UpdateCompanyBody,
} from "./schema.ts";
export {
  companyEstablishedOnSchema,
  companyHierarchyNodeSchema,
  companyHierarchySchema,
  companyLifecycleBodySchema,
  companyListSchema,
  companySchema,
  companyStatusSchema,
  createCompanyBodySchema,
  getCompanyQuerySchema,
  listCompaniesQuerySchema,
  updateActiveCompanyBodySchema,
  updateCompanyBodySchema,
} from "./schema.ts";

const companyOpenApiProperties = {
  code: { type: "string" },
  countryCode: { type: "string" },
  currencyCode: { type: "string" },
  description: { type: "string" },
  email: { type: "string", format: "email" },
  establishedOn: { type: "string", format: "date" },
  id: { type: "string" },
  isGroup: { type: "boolean" },
  name: { type: "string" },
  parentCompanyId: { type: "string" },
  phone: { type: "string" },
  registrationNumber: { type: "string" },
  status: {
    type: "string",
    enum: ["active", "inactive"],
  },
  taxId: { type: "string" },
  website: { type: "string", format: "uri" },
} as const;

const companyBodyOpenApiSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    code: companyOpenApiProperties.code,
    countryCode: companyOpenApiProperties.countryCode,
    currencyCode: companyOpenApiProperties.currencyCode,
    description: companyOpenApiProperties.description,
    email: companyOpenApiProperties.email,
    establishedOn: companyOpenApiProperties.establishedOn,
    isGroup: companyOpenApiProperties.isGroup,
    name: companyOpenApiProperties.name,
    parentCompanyId: companyOpenApiProperties.parentCompanyId,
    phone: companyOpenApiProperties.phone,
    registrationNumber: companyOpenApiProperties.registrationNumber,
    status: companyOpenApiProperties.status,
    taxId: companyOpenApiProperties.taxId,
    website: companyOpenApiProperties.website,
  },
  required: ["code", "name"],
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
          parentCompanyId: { type: "string" },
          rootOnly: { type: "boolean" },
          search: { type: "string" },
          status: companyOpenApiProperties.status,
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
      openApiSchema: companyBodyOpenApiSchema,
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
      openApiSchema: companyBodyOpenApiSchema,
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

export const companyRouteContracts = [
  listCompaniesRouteContract,
  createCompanyRouteContract,
  getActiveCompanyRouteContract,
  updateActiveCompanyRouteContract,
] as const;

export const companyOpenApiSchemas = {
  Company: {
    type: "object",
    additionalProperties: false,
    properties: companyOpenApiProperties,
    required: ["id", "code", "name", "status", "isGroup"],
  },
} as const;

export const registerCompanyOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, companyOpenApiSchemas);
  addRouteContractsToOpenApi(document, companyRouteContracts);
};
