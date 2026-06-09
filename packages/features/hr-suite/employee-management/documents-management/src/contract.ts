export type DocumentsManagementStatus = "draft" | "active" | "archived";

export type DocumentsManagementRecord = {
  id: string;
  name: string;
  status: DocumentsManagementStatus;
};

export type ListDocumentsManagementQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateDocumentsManagementInput = {
  name: string;
};

export type UpdateDocumentsManagementInput = {
  id: string;
  name?: string;
  status?: DocumentsManagementStatus;
};

export const hrWorkforceDocumentsReadPermission = {
  module: "hr",
  object: "documents",
  function: "read",
} as const;

export const hrWorkforceDocumentsWritePermission = {
  module: "hr",
  object: "documents",
  function: "update",
} as const;

export const hrWorkforceDocumentsSensitiveReadPermission = {
  module: "hr",
  object: "documents",
  function: "read",
} as const;

export const documentsManagementRoutePaths = {
  hub: "/hr",
  documents: "/hr/documents",
} as const;

export type DocumentsManagementRoutePath =
  (typeof documentsManagementRoutePaths)[keyof typeof documentsManagementRoutePaths];

export function hrEmployeeDetailRoutePath(
  employeeId: string
): `/hr/records/${string}` {
  return `/hr/records/${employeeId}`;
}

export function hrTenantDocumentDownloadPath(documentId: string): string {
  return `/api/internal/v1/documents/${documentId}/download?moduleId=hr`;
}

export const documentsManagementRouteContracts = [] as const;

export const documentsManagementFeatureId =
  "hr-suite.employee-management.documents-management" as const;
