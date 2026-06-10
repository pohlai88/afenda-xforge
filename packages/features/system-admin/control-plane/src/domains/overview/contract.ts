import { defineRouteContract } from "@repo/api";
import {
  listSystemAdminSectionsQuerySchema,
  systemAdminOverviewSchema,
  systemAdminSectionSchema,
} from "./schema.ts";

export const overviewCapabilities = {
  overviewRead: "system-admin.overview.read",
} as const;

export const systemAdminReadOverviewRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "readSystemAdminOverview",
  path: "/api/system-admin/overview",
  success: {
    description: "System admin overview",
    openApiSchema: {
      $ref: "#/components/schemas/SystemAdminOverview",
    },
    schema: systemAdminOverviewSchema,
    status: 200,
  },
  summary: "Read system admin overview",
  tags: ["system-admin"],
});

export const systemAdminListSectionsRouteContract = defineRouteContract({
  audience: "client",
  method: "GET",
  operationId: "listSystemAdminSections",
  path: "/api/system-admin/sections",
  request: {
    query: {
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          domain: { type: "string" },
        },
      },
      schema: listSystemAdminSectionsQuerySchema,
    },
  },
  success: {
    description: "System admin sections",
    openApiSchema: {
      type: "array",
      items: { $ref: "#/components/schemas/SystemAdminSection" },
    },
    schema: systemAdminSectionSchema.array(),
    status: 200,
  },
  summary: "List system admin sections",
  tags: ["system-admin"],
});

export const overviewRouteContracts = [
  systemAdminReadOverviewRouteContract,
  systemAdminListSectionsRouteContract,
] as const;
