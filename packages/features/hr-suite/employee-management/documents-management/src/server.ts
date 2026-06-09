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
  getDocumentsManagementRecord as getDocumentsManagement,
  listDocumentsManagementRecords as listDocumentsManagement,
} from "./queries.ts";
