import type { OpenApiDocument } from "@repo/api";
import {
  addRouteContractsToOpenApi,
  addSchemasToOpenApi,
  defineRouteContract,
} from "@repo/api";
import type { PaginatedList } from "@repo/shared";
import { z } from "zod";

export const locationStatusSchema = z.enum(["active", "inactive"]);

export const locationSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  status: locationStatusSchema,
});

export const listLocationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().min(1).optional(),
});

export const locationListSchema = z.object({
  items: z.array(locationSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

export const createLocationBodySchema = z.object({
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().min(1).max(120),
});

export type Location = z.infer<typeof locationSchema>;
export type LocationList = PaginatedList<Location>;
export type CreateLocationBody = z.infer<typeof createLocationBodySchema>;
export type ListLocationsQuery = z.infer<typeof listLocationsQuerySchema>;

export const listLocationsRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "listLocations",
  path: "/api/locations",
  request: {
    query: {
      schema: listLocationsQuerySchema,
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
    description: "Location collection",
    openApiSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          items: {
            $ref: "#/components/schemas/Location",
          },
        },
        page: { type: "number" },
        pageSize: { type: "number" },
        total: { type: "number" },
      },
      required: ["items", "page", "pageSize", "total"],
    },
    schema: locationListSchema,
    status: 200,
  },
  summary: "List locations",
  tags: ["locations"],
});

export const createLocationRouteContract = defineRouteContract({
  audience: "client",
  description:
    "Creates a location record once the real execution pipeline is wired in.",
  method: "POST",
  operationId: "createLocation",
  path: "/api/locations",
  request: {
    body: {
      schema: createLocationBodySchema,
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
    description: "Created location",
    openApiSchema: {
      $ref: "#/components/schemas/Location",
    },
    schema: locationSchema,
    status: 201,
  },
  summary: "Create a location",
  tags: ["locations"],
});

export const locationRouteContracts = [
  listLocationsRouteContract,
  createLocationRouteContract,
] as const;

export const locationOpenApiSchemas = {
  Location: {
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

export const registerLocationOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, locationOpenApiSchemas);
  addRouteContractsToOpenApi(document, locationRouteContracts);
};
