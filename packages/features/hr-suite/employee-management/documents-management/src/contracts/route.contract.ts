import { z } from "zod";

import { optionalTrimmedStringSchema, trimmedStringSchema } from "./schema.ts";

export const DOCUMENTS_MANAGEMENT_CONTRACT_VERSION = "1.1.0" as const;

export const documentsManagementFeatureId =
  "hr-suite.employee-management.documents-management" as const;

export const documentsManagementRoutePaths: {
  readonly documents: "/hr/documents";
  readonly hub: "/hr";
} = {
  documents: "/hr/documents",
  hub: "/hr",
};

export type DocumentsManagementRoutePath =
  (typeof documentsManagementRoutePaths)[keyof typeof documentsManagementRoutePaths];

export const documentsManagementApiRoutePaths = {
  acknowledgments: "/api/hr/documents/acknowledgments",
  documentDownload: (
    documentId: string
  ): `/api/hr/documents/${string}/download` =>
    `/api/hr/documents/${documentId}/download`,
  document: (documentId: string): `/api/hr/documents/${string}` =>
    `/api/hr/documents/${documentId}`,
  documentUpload: "/api/hr/documents/upload",
  documents: "/api/hr/documents",
  essAcknowledgments:
    "/api/hr/employee-selfservice-portal/documents/acknowledgments",
  essDocuments: "/api/hr/employee-selfservice-portal/documents",
  expiring: "/api/hr/documents/expiring",
  obligations: "/api/hr/documents/obligations",
  readiness: "/api/hr/documents/readiness",
  retention: "/api/hr/documents/retention",
} as const;

export type DocumentsManagementApiRoutePath =
  | (typeof documentsManagementApiRoutePaths)["acknowledgments"]
  | (typeof documentsManagementApiRoutePaths)["documentUpload"]
  | (typeof documentsManagementApiRoutePaths)["documents"]
  | (typeof documentsManagementApiRoutePaths)["essAcknowledgments"]
  | (typeof documentsManagementApiRoutePaths)["essDocuments"]
  | (typeof documentsManagementApiRoutePaths)["expiring"]
  | (typeof documentsManagementApiRoutePaths)["obligations"]
  | (typeof documentsManagementApiRoutePaths)["readiness"]
  | (typeof documentsManagementApiRoutePaths)["retention"]
  | ReturnType<typeof documentsManagementApiRoutePaths.documentDownload>
  | ReturnType<typeof documentsManagementApiRoutePaths.document>;

export function hrEmployeeDetailRoutePath(
  employeeId: string
): `/hr/records/${string}` {
  return `/hr/records/${employeeId}`;
}

export function hrTenantDocumentDownloadPath(documentId: string): string {
  return documentsManagementApiRoutePaths.documentDownload(documentId);
}

export function hrTenantDocumentUploadPath(): string {
  return documentsManagementApiRoutePaths.documentUpload;
}

export type DocumentsManagementRouteContract = {
  description?: string | null;
  path: string;
};

export const documentsManagementRouteContractSchema: z.ZodType<DocumentsManagementRouteContract> =
  z.object({
    description: optionalTrimmedStringSchema,
    path: trimmedStringSchema,
  });

export const documentsManagementRouteContracts: readonly DocumentsManagementRouteContract[] =
  [
    {
      description:
        "List or create document summary projections with search, filtering, paging, and binary registration.",
      path: documentsManagementApiRoutePaths.documents,
    },
    {
      description:
        "Read a single document summary projection by id and record sensitive access when applicable.",
      path: "/api/hr/documents/[documentId]",
    },
    {
      description:
        "Download a stored document binary through the secured document-management API with dedicated download permission.",
      path: "/api/hr/documents/[documentId]/download",
    },
    {
      description:
        "Generate direct browser upload credentials for the active object storage backend.",
      path: documentsManagementApiRoutePaths.documentUpload,
    },
    {
      description:
        "List and create employee-scoped document obligations and policy acknowledgment requirements.",
      path: documentsManagementApiRoutePaths.obligations,
    },
    {
      description:
        "List and complete pending policy acknowledgments for authorized actors.",
      path: documentsManagementApiRoutePaths.acknowledgments,
    },
    {
      description:
        "List employee readiness projections grouped from obligations and document records.",
      path: documentsManagementApiRoutePaths.readiness,
    },
    {
      description:
        "List documents that are expired or approaching expiry within the default window.",
      path: documentsManagementApiRoutePaths.expiring,
    },
    {
      description:
        "List retention candidates and execute retention actions through the governed document-management surface.",
      path: documentsManagementApiRoutePaths.retention,
    },
    {
      description:
        "Expose employee-safe document summaries to the employee self-service portal.",
      path: documentsManagementApiRoutePaths.essDocuments,
    },
    {
      description:
        "Expose employee-safe pending acknowledgments and acknowledgment actions to the employee self-service portal.",
      path: documentsManagementApiRoutePaths.essAcknowledgments,
    },
  ];
