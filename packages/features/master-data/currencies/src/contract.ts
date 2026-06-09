import type { OpenApiDocument } from "@repo/api";
import {
  addRouteContractsToOpenApi,
  addSchemasToOpenApi,
  defineRouteContract,
} from "@repo/api";
import type { PaginatedList } from "@repo/shared";
import { z } from "zod";

export const currencyStatusSchema = z.enum(["active", "inactive"]);

export const currencySchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  status: currencyStatusSchema,
});

export const listCurrenciesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().min(1).optional(),
});

export const currencyListSchema = z.object({
  items: z.array(currencySchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

export const createCurrencyBodySchema = z.object({
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().min(1).max(120),
});

export type Currency = z.infer<typeof currencySchema>;
export type CurrencyList = PaginatedList<Currency>;
export type CreateCurrencyBody = z.infer<typeof createCurrencyBodySchema>;
export type ListCurrenciesQuery = z.infer<typeof listCurrenciesQuerySchema>;

export const listCurrenciesRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "listCurrencies",
  path: "/api/currencies",
  request: {
    query: {
      schema: listCurrenciesQuerySchema,
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
    description: "Currency collection",
    openApiSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          items: {
            $ref: "#/components/schemas/Currency",
          },
        },
        page: { type: "number" },
        pageSize: { type: "number" },
        total: { type: "number" },
      },
      required: ["items", "page", "pageSize", "total"],
    },
    schema: currencyListSchema,
    status: 200,
  },
  summary: "List currencies",
  tags: ["currencies"],
});

export const createCurrencyRouteContract = defineRouteContract({
  audience: "client",
  description:
    "Creates a currency record once the real execution pipeline is wired in.",
  method: "POST",
  operationId: "createCurrency",
  path: "/api/currencies",
  request: {
    body: {
      schema: createCurrencyBodySchema,
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
    description: "Created currency",
    openApiSchema: {
      $ref: "#/components/schemas/Currency",
    },
    schema: currencySchema,
    status: 201,
  },
  summary: "Create a currency",
  tags: ["currencies"],
});

export const currencyRouteContracts = [
  listCurrenciesRouteContract,
  createCurrencyRouteContract,
] as const;

export const currencyOpenApiSchemas = {
  Currency: {
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

export const registerCurrencyOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, currencyOpenApiSchemas);
  addRouteContractsToOpenApi(document, currencyRouteContracts);
};
