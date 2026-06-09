import type { OpenApiDocument } from "@repo/api";
import {
  addRouteContractsToOpenApi,
  addSchemasToOpenApi,
  defineRouteContract,
} from "@repo/api";
import type { PaginatedList } from "@repo/shared";
import { z } from "zod";

export const taxCodeStatusSchema = z.enum(["active", "inactive"]);

export const taxCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  status: taxCodeStatusSchema,
});

export const listTaxCodesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().min(1).optional(),
});

export const taxCodeListSchema = z.object({
  items: z.array(taxCodeSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

export const createTaxCodeBodySchema = z.object({
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().min(1).max(120),
});

export type TaxCode = z.infer<typeof taxCodeSchema>;
export type TaxCodeList = PaginatedList<TaxCode>;
export type CreateTaxCodeBody = z.infer<typeof createTaxCodeBodySchema>;
export type ListTaxCodesQuery = z.infer<typeof listTaxCodesQuerySchema>;

export const listTaxCodesRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "listTaxCodes",
  path: "/api/tax-codes",
  request: {
    query: {
      schema: listTaxCodesQuerySchema,
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
    description: "Tax code collection",
    openApiSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          items: {
            $ref: "#/components/schemas/TaxCode",
          },
        },
        page: { type: "number" },
        pageSize: { type: "number" },
        total: { type: "number" },
      },
      required: ["items", "page", "pageSize", "total"],
    },
    schema: taxCodeListSchema,
    status: 200,
  },
  summary: "List tax codes",
  tags: ["tax-codes"],
});

export const createTaxCodeRouteContract = defineRouteContract({
  audience: "client",
  description:
    "Creates a tax code record once the real execution pipeline is wired in.",
  method: "POST",
  operationId: "createTaxCode",
  path: "/api/tax-codes",
  request: {
    body: {
      schema: createTaxCodeBodySchema,
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
    description: "Created tax code",
    openApiSchema: {
      $ref: "#/components/schemas/TaxCode",
    },
    schema: taxCodeSchema,
    status: 201,
  },
  summary: "Create a tax code",
  tags: ["tax-codes"],
});

export const taxCodeRouteContracts = [
  listTaxCodesRouteContract,
  createTaxCodeRouteContract,
] as const;

export const taxCodeOpenApiSchemas = {
  TaxCode: {
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

export const registerTaxCodeOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, taxCodeOpenApiSchemas);
  addRouteContractsToOpenApi(document, taxCodeRouteContracts);
};
