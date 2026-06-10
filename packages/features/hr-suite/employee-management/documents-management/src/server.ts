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
  hrWorkforceDocumentsAuditReadPermission,
  hrWorkforceDocumentsDownloadPermission,
  hrWorkforceDocumentsReadPermission,
  hrWorkforceDocumentsRetentionExecutePermission,
  hrWorkforceDocumentsSelfAcknowledgePermission,
  hrWorkforceDocumentsSensitiveReadPermission,
  hrWorkforceDocumentsWritePermission,
} from "./contract.ts";
export {
  canDownloadDocumentsManagement,
  canExecuteDocumentsManagementRetention,
  canWriteDocumentsManagement,
} from "./policy.ts";
export {
  getDocumentsManagementDocumentSummary,
  getDocumentsManagementRecord as getDocumentsManagement,
  listDocumentsManagementAlertReadyRecords,
  listDocumentsManagementDocumentObligations,
  listDocumentsManagementDocumentReadinessSummaries,
  listDocumentsManagementDocumentSummaries,
  listDocumentsManagementDownstreamReadinessSummaries,
  listDocumentsManagementExpiringDocuments,
  listDocumentsManagementMissingRequirementSummaries,
  listDocumentsManagementPolicyAcknowledgmentSummaries,
  listDocumentsManagementRecords as listDocumentsManagement,
  listDocumentsManagementRetentionCandidates,
} from "./queries.ts";
export {
  acknowledgeDocumentsManagementPolicy,
  anonymizeDocumentsManagementDocument,
  archiveDocumentsManagementDocument,
  archiveDocumentsManagementDocumentsForSeparatedEmployee,
  createDocumentsManagementDocumentObligation,
  deleteDocumentsManagementDocument,
  executeDocumentsManagementRetention,
  expireDocumentsManagementDocument,
  getDocumentsManagementDocument,
  getDocumentsManagementDocumentLatestVersion,
  getDocumentsManagementDocumentVersion,
  listDocumentsManagementDocumentAuditTrail,
  listDocumentsManagementDocumentVersions,
  recordDocumentsManagementDocumentAccess,
  registerDocumentsManagementDocument,
  rejectDocumentsManagementDocument,
  assignDocumentsManagementPolicyAcknowledgment,
  updateDocumentsManagementDocument,
  updateDocumentsManagementDocumentObligation,
  updateDocumentsManagementDocumentRetention,
  verifyDocumentsManagementDocument,
} from "./registration.ts";
