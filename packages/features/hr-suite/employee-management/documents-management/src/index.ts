/**
 * Server-only public door for the feature package.
 *
 * This package exposes the governed documents-management contracts and feature
 * surfaces extracted from the legacy HR suite module.
 */
import "server-only";

export * from "./contracts/index.ts";
export type { DocumentsManagementPolicyContext } from "./execution/index.ts";
export {
  buildDocumentsManagementAuditMetadata,
  canReadDocumentsManagement,
  canViewDocumentsManagementSensitiveData,
  canWriteDocumentsManagement,
  documentsManagementExecutionSurface,
  normalizeDocumentsManagementActorId,
  redactDocumentsManagementDocument,
  redactDocumentsManagementDocumentSummary,
  redactDocumentsManagementRecord,
  requireDocumentsManagementWriteAccess,
} from "./execution/index.ts";
export { documentsManagementManifest } from "./manifest.ts";
export { documentsManagementMetadata } from "./metadata.ts";
export {
  archiveDocumentsManagementDocument,
  createDocumentsManagement,
  expireDocumentsManagementDocument,
  getDocumentsManagement,
  getDocumentsManagementDocument,
  getDocumentsManagementDocumentLatestVersion,
  getDocumentsManagementDocumentSummary,
  getDocumentsManagementDocumentVersion,
  listDocumentsManagement,
  listDocumentsManagementDocumentAuditTrail,
  listDocumentsManagementDocumentReadinessSummaries,
  listDocumentsManagementDocumentSummaries,
  listDocumentsManagementDocumentVersions,
  listDocumentsManagementExpiringDocuments,
  registerDocumentsManagementDocument,
  rejectDocumentsManagementDocument,
  updateDocumentsManagement,
  updateDocumentsManagementDocument,
  updateDocumentsManagementDocumentRetention,
  verifyDocumentsManagementDocument,
} from "./server.ts";
export { documentsManagementFeatureScope } from "./shared/index.ts";
