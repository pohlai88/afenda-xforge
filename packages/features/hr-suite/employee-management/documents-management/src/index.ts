/**
 * Server-only public door for the feature package.
 *
 * This package exposes the governed documents-management contracts and feature
 * surfaces extracted from the legacy HR suite module.
 */
import "server-only";

export * from "./contracts/index.ts";
export type { DocumentsManagementPolicyContext } from "./execution.ts";
export {
  buildDocumentsManagementAuditMetadata,
  canDownloadDocumentsManagement,
  canExecuteDocumentsManagementRetention,
  canReadDocumentsManagement,
  canReadDocumentsManagementAudit,
  canSelfAcknowledgeDocumentsManagement,
  canViewDocumentsManagementSensitiveData,
  canWriteDocumentsManagement,
  documentsManagementExecutionSurface,
  normalizeDocumentsManagementActorId,
  redactDocumentsManagementDocument,
  redactDocumentsManagementDocumentObligation,
  redactDocumentsManagementDocumentSummary,
  redactDocumentsManagementRecord,
  requireDocumentsManagementRetentionAccess,
  requireDocumentsManagementWriteAccess,
} from "./execution.ts";
export { documentsManagementManifest } from "./manifest.ts";
export { documentsManagementMetadata } from "./metadata.ts";
export {
  getDocumentsManagementRepositoryPath,
  resetDocumentsManagementRepositoryForTesting,
  setDocumentsManagementRepositoryPathForTesting,
} from "./repository.testing.ts";
export {
  acknowledgeDocumentsManagementPolicy,
  anonymizeDocumentsManagementDocument,
  archiveDocumentsManagementDocument,
  archiveDocumentsManagementDocumentsForSeparatedEmployee,
  assignDocumentsManagementPolicyAcknowledgment,
  createDocumentsManagement,
  createDocumentsManagementDocumentObligation,
  deleteDocumentsManagementDocument,
  executeDocumentsManagementRetention,
  expireDocumentsManagementDocument,
  getDocumentsManagement,
  getDocumentsManagementDocument,
  getDocumentsManagementDocumentLatestVersion,
  getDocumentsManagementDocumentSummary,
  getDocumentsManagementDocumentVersion,
  listDocumentsManagement,
  listDocumentsManagementAlertReadyRecords,
  listDocumentsManagementDocumentAuditTrail,
  listDocumentsManagementDocumentObligations,
  listDocumentsManagementDocumentReadinessSummaries,
  listDocumentsManagementDocumentSummaries,
  listDocumentsManagementDocumentVersions,
  listDocumentsManagementDownstreamReadinessSummaries,
  listDocumentsManagementExpiringDocuments,
  listDocumentsManagementMissingRequirementSummaries,
  listDocumentsManagementPolicyAcknowledgmentSummaries,
  listDocumentsManagementRetentionCandidates,
  recordDocumentsManagementDocumentAccess,
  registerDocumentsManagementDocument,
  rejectDocumentsManagementDocument,
  updateDocumentsManagement,
  updateDocumentsManagementDocument,
  updateDocumentsManagementDocumentObligation,
  updateDocumentsManagementDocumentRetention,
  verifyDocumentsManagementDocument,
} from "./server.ts";
export { documentsManagementFeatureScope } from "./shared/index.ts";
