import { z } from "zod";

import { optionalTrimmedStringSchema, trimmedStringSchema } from "../schema.ts";

export const DOCUMENTS_MANAGEMENT_CONTRACT_VERSION = "1.0.0" as const;

export const documentsManagementFeatureId =
  "hr-suite.employee-management.documents-management" as const;

export const documentsManagementRoutePaths: {
  readonly documents: "/hr/documents";
  readonly hub: "/hr";
} = {
  hub: "/hr",
  documents: "/hr/documents",
};

export type DocumentsManagementRoutePath =
  (typeof documentsManagementRoutePaths)[keyof typeof documentsManagementRoutePaths];

export const documentsManagementApiRoutePaths = {
  document: (documentId: string): `/api/hr/documents/${string}` =>
    `/api/hr/documents/${documentId}`,
  documents: "/api/hr/documents",
  expiring: "/api/hr/documents/expiring",
  readiness: "/api/hr/documents/readiness",
} as const;

export type DocumentsManagementApiRoutePath =
  | (typeof documentsManagementApiRoutePaths)["documents"]
  | (typeof documentsManagementApiRoutePaths)["expiring"]
  | (typeof documentsManagementApiRoutePaths)["readiness"]
  | ReturnType<typeof documentsManagementApiRoutePaths.document>;

export function hrEmployeeDetailRoutePath(
  employeeId: string
): `/hr/records/${string}` {
  return `/hr/records/${employeeId}`;
}

export function hrTenantDocumentDownloadPath(documentId: string): string {
  return `/api/internal/v1/documents/${documentId}/download?moduleId=hr`;
}

export type DocumentsManagementRouteContract = {
  description?: string | null;
  path: string;
};

export const documentsManagementRouteContractSchema: z.ZodType<DocumentsManagementRouteContract> =
  z.object({
    path: trimmedStringSchema,
    description: optionalTrimmedStringSchema,
  });

export const documentsManagementRouteContracts: readonly DocumentsManagementRouteContract[] =
  [
    {
      path: documentsManagementApiRoutePaths.documents,
      description:
        "List document summary projections with search, filtering, and paging.",
    },
    {
      path: "/api/hr/documents/[documentId]",
      description: "Read a single document summary projection by id.",
    },
    {
      path: documentsManagementApiRoutePaths.readiness,
      description:
        "List employee readiness projections grouped from document records.",
    },
    {
      path: documentsManagementApiRoutePaths.expiring,
      description:
        "List documents that are expired or approaching expiry within the default window.",
    },
  ];
