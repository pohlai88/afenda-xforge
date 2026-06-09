import "server-only";

export {
  createDocumentsManagementRecord as createDocumentsManagement,
  updateDocumentsManagementRecord as updateDocumentsManagement,
} from "./actions.ts";
export {
  documentsManagementFeatureId,
  documentsManagementRouteContracts,
  documentsManagementRoutePaths,
  hrEmployeeDetailRoutePath,
  hrTenantDocumentDownloadPath,
  hrWorkforceDocumentsReadPermission,
  hrWorkforceDocumentsSensitiveReadPermission,
  hrWorkforceDocumentsWritePermission,
} from "./contract.ts";
export {
  getDocumentsManagementDocumentSummary,
  getDocumentsManagementRecord as getDocumentsManagement,
  listDocumentsManagementDocumentReadinessSummaries,
  listDocumentsManagementDocumentSummaries,
  listDocumentsManagementExpiringDocuments,
  listDocumentsManagementRecords as listDocumentsManagement,
} from "./queries.ts";
export {
  archiveDocumentsManagementDocument,
  expireDocumentsManagementDocument,
  getDocumentsManagementDocument,
  getDocumentsManagementDocumentLatestVersion,
  getDocumentsManagementDocumentVersion,
  listDocumentsManagementDocumentAuditTrail,
  listDocumentsManagementDocumentVersions,
  registerDocumentsManagementDocument,
  rejectDocumentsManagementDocument,
  updateDocumentsManagementDocument,
  updateDocumentsManagementDocumentRetention,
  verifyDocumentsManagementDocument,
} from "./registration.ts";
