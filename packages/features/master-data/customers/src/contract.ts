import type { OpenApiDocument } from "@repo/api";
import {
  addRouteContractsToOpenApi,
  addSchemasToOpenApi,
  defineRouteContract,
} from "@repo/api";
import type { PaginatedList } from "@repo/shared";
import { z } from "zod";

export const customerStatusSchema = z.enum(["active", "inactive"]);

export const customerSchema = z.object({
  id: z.string(),
  code: z.string(),
  email: z.email().optional(),
  name: z.string(),
  status: customerStatusSchema,
});

export const listCustomersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().min(1).optional(),
});

export const customerListSchema = z.object({
  items: z.array(customerSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

export const createCustomerBodySchema = z.object({
  code: z.string().trim().min(1).max(32),
  email: z.email().optional(),
  name: z.string().trim().min(1).max(120),
});

export const updateCustomerBodySchema = createCustomerBodySchema;

export const customerIdParamsSchema = z.object({
  customerId: z.string().uuid(),
});

export type Customer = z.infer<typeof customerSchema>;
export type CustomerList = PaginatedList<Customer>;
export type CreateCustomerBody = z.infer<typeof createCustomerBodySchema>;
export type UpdateCustomerBody = z.infer<typeof updateCustomerBodySchema>;
export type CustomerIdParams = z.infer<typeof customerIdParamsSchema>;
export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;

export const customerApiRoutePaths = {
  collection: "/api/customers",
  customer: (customerId: string) => `/api/customers/${customerId}`,
} as const;

export const listCustomersRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "listCustomers",
  path: "/api/customers",
  request: {
    query: {
      schema: listCustomersQuerySchema,
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
    description: "Customer collection",
    openApiSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          items: {
            $ref: "#/components/schemas/Customer",
          },
        },
        page: { type: "number" },
        pageSize: { type: "number" },
        total: { type: "number" },
      },
      required: ["items", "page", "pageSize", "total"],
    },
    schema: customerListSchema,
    status: 200,
  },
  summary: "List customers",
  tags: ["customers"],
});

export const createCustomerRouteContract = defineRouteContract({
  audience: "client",
  description:
    "Creates a tenant-scoped customer record through the governed execution pipeline.",
  method: "POST",
  operationId: "createCustomer",
  path: "/api/customers",
  request: {
    body: {
      schema: createCustomerBodySchema,
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
    description: "Created customer",
    openApiSchema: {
      $ref: "#/components/schemas/Customer",
    },
    schema: customerSchema,
    status: 201,
  },
  summary: "Create a customer",
  tags: ["customers"],
});

export const updateCustomerRouteContract = defineRouteContract({
  audience: "client",
  method: "PATCH",
  operationId: "updateCustomer",
  path: "/api/customers/{customerId}",
  request: {
    body: {
      schema: updateCustomerBodySchema,
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
    params: {
      schema: customerIdParamsSchema,
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          customerId: { type: "string", format: "uuid" },
        },
        required: ["customerId"],
      },
    },
  },
  success: {
    description: "Updated customer",
    openApiSchema: {
      $ref: "#/components/schemas/Customer",
    },
    schema: customerSchema,
    status: 200,
  },
  summary: "Update a customer",
  tags: ["customers"],
});

export const archiveCustomerRouteContract = defineRouteContract({
  audience: "client",
  method: "DELETE",
  operationId: "archiveCustomer",
  path: "/api/customers/{customerId}",
  request: {
    params: {
      schema: customerIdParamsSchema,
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          customerId: { type: "string", format: "uuid" },
        },
        required: ["customerId"],
      },
    },
  },
  success: {
    description: "Archived customer",
    openApiSchema: {
      $ref: "#/components/schemas/Customer",
    },
    schema: customerSchema,
    status: 200,
  },
  summary: "Archive a customer",
  tags: ["customers"],
});

export const customerRouteContracts = [
  listCustomersRouteContract,
  createCustomerRouteContract,
  updateCustomerRouteContract,
  archiveCustomerRouteContract,
] as const;

export const customerOpenApiSchemas = {
  Customer: {
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

export const registerCustomerOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, customerOpenApiSchemas);
  addRouteContractsToOpenApi(document, customerRouteContracts);
};
