import type { OpenApiDocument } from "@repo/api";
import {
  addRouteContractsToOpenApi,
  addSchemasToOpenApi,
  defineRouteContract,
} from "@repo/api";
import type { PaginatedList } from "@repo/shared";
import { z } from "zod";

export const orgUnitTypeSchema = z.enum([
  "business_unit",
  "department",
  "legal_entity",
  "location",
  "sub_department",
  "team",
]);

export const orgUnitStatusSchema = z.enum([
  "active",
  "planned",
  "frozen",
  "closed",
]);

export const orgUnitSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  unitType: orgUnitTypeSchema,
  status: orgUnitStatusSchema,
  parentOrgUnitId: z.string().optional(),
  managerEmployeeId: z.string().optional(),
  costCenterCode: z.string().optional(),
  locationCode: z.string().optional(),
  legalEntityCode: z.string().optional(),
  effectiveFrom: z.string().optional(),
});

export const listOrgUnitsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().min(1).optional(),
  status: orgUnitStatusSchema.optional(),
  unitType: orgUnitTypeSchema.optional(),
  parentOrgUnitId: z.string().trim().min(1).optional(),
  locationCode: z.string().trim().min(1).optional(),
  legalEntityCode: z.string().trim().min(1).optional(),
});

export const orgUnitListSchema = z.object({
  items: z.array(orgUnitSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

export const createOrgUnitBodySchema = z.object({
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().min(1).max(160),
  unitType: orgUnitTypeSchema,
  status: orgUnitStatusSchema.default("active").optional(),
  parentOrgUnitId: z.string().trim().min(1).optional(),
  managerEmployeeId: z.string().trim().min(1).optional(),
  costCenterCode: z.string().trim().min(1).max(64).optional(),
  locationCode: z.string().trim().min(1).max(64).optional(),
  legalEntityCode: z.string().trim().min(1).max(64).optional(),
  effectiveFrom: z.string().trim().min(1).max(64).optional(),
});

export type OrgUnitType = z.infer<typeof orgUnitTypeSchema>;
export type OrgUnitStatus = z.infer<typeof orgUnitStatusSchema>;
export type OrgUnit = z.infer<typeof orgUnitSchema>;
export type OrgUnitList = PaginatedList<OrgUnit>;
export type CreateOrgUnitBody = z.infer<typeof createOrgUnitBodySchema>;
export type ListOrgUnitsQuery = z.infer<typeof listOrgUnitsQuerySchema>;

export const listOrgUnitsRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "listOrgUnits",
  path: "/api/org-units",
  request: {
    query: {
      schema: listOrgUnitsQuerySchema,
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
          unitType: {
            type: "string",
            enum: [
              "business_unit",
              "department",
              "legal_entity",
              "location",
              "sub_department",
              "team",
            ],
          },
          parentOrgUnitId: { type: "string" },
          locationCode: { type: "string" },
          legalEntityCode: { type: "string" },
        },
      },
    },
  },
  success: {
    description: "Organizational unit collection",
    openApiSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          items: {
            $ref: "#/components/schemas/OrgUnit",
          },
        },
        page: { type: "number" },
        pageSize: { type: "number" },
        total: { type: "number" },
      },
      required: ["items", "page", "pageSize", "total"],
    },
    schema: orgUnitListSchema,
    status: 200,
  },
  summary: "List organizational units",
  tags: ["org-units"],
});

export const createOrgUnitRouteContract = defineRouteContract({
  audience: "client",
  method: "POST",
  operationId: "createOrgUnit",
  path: "/api/org-units",
  request: {
    body: {
      schema: createOrgUnitBodySchema,
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          code: { type: "string" },
          name: { type: "string" },
          unitType: {
            type: "string",
            enum: [
              "business_unit",
              "department",
              "legal_entity",
              "location",
              "sub_department",
              "team",
            ],
          },
          status: {
            type: "string",
            enum: ["active", "planned", "frozen", "closed"],
          },
          parentOrgUnitId: { type: "string" },
          managerEmployeeId: { type: "string" },
          costCenterCode: { type: "string" },
          locationCode: { type: "string" },
          legalEntityCode: { type: "string" },
          effectiveFrom: { type: "string" },
        },
        required: ["code", "name", "unitType"],
      },
    },
  },
  success: {
    description: "Created organizational unit",
    openApiSchema: {
      $ref: "#/components/schemas/OrgUnit",
    },
    schema: orgUnitSchema,
    status: 201,
  },
  summary: "Create an organizational unit",
  tags: ["org-units"],
});

export const orgUnitRouteContracts = [
  listOrgUnitsRouteContract,
  createOrgUnitRouteContract,
] as const;

export const orgUnitOpenApiSchemas = {
  OrgUnit: {
    type: "object",
    additionalProperties: false,
    properties: {
      id: { type: "string" },
      code: { type: "string" },
      name: { type: "string" },
      unitType: {
        type: "string",
        enum: [
          "business_unit",
          "department",
          "legal_entity",
          "location",
          "sub_department",
          "team",
        ],
      },
      status: {
        type: "string",
        enum: ["active", "planned", "frozen", "closed"],
      },
      parentOrgUnitId: { type: "string" },
      managerEmployeeId: { type: "string" },
      costCenterCode: { type: "string" },
      locationCode: { type: "string" },
      legalEntityCode: { type: "string" },
      effectiveFrom: { type: "string" },
    },
    required: ["id", "code", "name", "unitType", "status"],
  },
} as const;

export const registerOrgUnitOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, orgUnitOpenApiSchemas);
  addRouteContractsToOpenApi(document, orgUnitRouteContracts);
};
