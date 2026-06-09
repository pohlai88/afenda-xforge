import type { OpenApiDocument } from "@repo/api";
import {
  addRouteContractsToOpenApi,
  addSchemasToOpenApi,
  defineRouteContract,
} from "@repo/api";
import type { PaginatedList } from "@repo/shared";
import { z } from "zod";

export const productStatusSchema = z.enum(["active", "inactive"]);

export const productSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  status: productStatusSchema,
});

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().min(1).optional(),
});

export const productListSchema = z.object({
  items: z.array(productSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

export const createProductBodySchema = z.object({
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().min(1).max(120),
});

export type Product = z.infer<typeof productSchema>;
export type ProductList = PaginatedList<Product>;
export type CreateProductBody = z.infer<typeof createProductBodySchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

export const listProductsRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "listProducts",
  path: "/api/products",
  request: {
    query: {
      schema: listProductsQuerySchema,
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
    description: "Product collection",
    openApiSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          items: {
            $ref: "#/components/schemas/Product",
          },
        },
        page: { type: "number" },
        pageSize: { type: "number" },
        total: { type: "number" },
      },
      required: ["items", "page", "pageSize", "total"],
    },
    schema: productListSchema,
    status: 200,
  },
  summary: "List products",
  tags: ["products"],
});

export const createProductRouteContract = defineRouteContract({
  audience: "client",
  description:
    "Creates a product record once the real execution pipeline is wired in.",
  method: "POST",
  operationId: "createProduct",
  path: "/api/products",
  request: {
    body: {
      schema: createProductBodySchema,
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
    description: "Created product",
    openApiSchema: {
      $ref: "#/components/schemas/Product",
    },
    schema: productSchema,
    status: 201,
  },
  summary: "Create a product",
  tags: ["products"],
});

export const productRouteContracts = [
  listProductsRouteContract,
  createProductRouteContract,
] as const;

export const productOpenApiSchemas = {
  Product: {
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

export const registerProductOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, productOpenApiSchemas);
  addRouteContractsToOpenApi(document, productRouteContracts);
};
