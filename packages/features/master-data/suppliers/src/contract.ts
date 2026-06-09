import type { OpenApiDocument } from "@repo/api";
import {
  addRouteContractsToOpenApi,
  addSchemasToOpenApi,
  defineRouteContract,
} from "@repo/api";
import type { PaginatedList } from "@repo/shared";
import { z } from "zod";

export const supplierStatusSchema = z.enum(["active", "inactive"]);

export const supplierSchema = z.object({
  id: z.string(),
  code: z.string(),
  email: z.email().optional(),
  name: z.string(),
  status: supplierStatusSchema,
});

export const listSuppliersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().min(1).optional(),
});

export const supplierListSchema = z.object({
  items: z.array(supplierSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

export const createSupplierBodySchema = z.object({
  code: z.string().trim().min(1).max(32),
  email: z.email().optional(),
  name: z.string().trim().min(1).max(120),
});

export type Supplier = z.infer<typeof supplierSchema>;
export type SupplierList = PaginatedList<Supplier>;
export type CreateSupplierBody = z.infer<typeof createSupplierBodySchema>;
export type ListSuppliersQuery = z.infer<typeof listSuppliersQuerySchema>;

export const listSuppliersRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "listSuppliers",
  path: "/api/suppliers",
  request: {
    query: {
      schema: listSuppliersQuerySchema,
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
    description: "Supplier collection",
    openApiSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          items: {
            $ref: "#/components/schemas/Supplier",
          },
        },
        page: { type: "number" },
        pageSize: { type: "number" },
        total: { type: "number" },
      },
      required: ["items", "page", "pageSize", "total"],
    },
    schema: supplierListSchema,
    status: 200,
  },
  summary: "List suppliers",
  tags: ["suppliers"],
});

export const createSupplierRouteContract = defineRouteContract({
  audience: "client",
  description:
    "Creates a supplier record once the real execution pipeline is wired in.",
  method: "POST",
  operationId: "createSupplier",
  path: "/api/suppliers",
  request: {
    body: {
      schema: createSupplierBodySchema,
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          code: { type: "string" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
        },
        required: ["code", "name"],
      },
    },
  },
  success: {
    description: "Created supplier",
    openApiSchema: {
      $ref: "#/components/schemas/Supplier",
    },
    schema: supplierSchema,
    status: 201,
  },
  summary: "Create a supplier",
  tags: ["suppliers"],
});

export const supplierRouteContracts = [
  listSuppliersRouteContract,
  createSupplierRouteContract,
] as const;

export const supplierOpenApiSchemas = {
  Supplier: {
    type: "object",
    additionalProperties: false,
    properties: {
      id: { type: "string" },
      code: { type: "string" },
      email: { type: "string", format: "email" },
      name: { type: "string" },
      status: {
        type: "string",
        enum: ["active", "inactive"],
      },
    },
    required: ["id", "code", "name", "status"],
  },
} as const;

export const registerSupplierOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, supplierOpenApiSchemas);
  addRouteContractsToOpenApi(document, supplierRouteContracts);
};
