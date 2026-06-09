/**
 * Server-only public door for the feature package.
 *
 * This package exposes the governed documents-management contracts and feature
 * surfaces extracted from the legacy HR suite module.
 */
import "server-only";

export type {
  CreateDocumentsManagementInput,
  DocumentsManagementRecord,
  DocumentsManagementRoutePath,
  DocumentsManagementStatus,
  ListDocumentsManagementQuery,
  UpdateDocumentsManagementInput,
} from "./contract.ts";
export { documentsManagementExecutionSurface } from "./execution/index.ts";
export { documentsManagementManifest } from "./manifest.ts";
export { documentsManagementMetadata } from "./metadata.ts";
export {
  createDocumentsManagement,
  documentsManagementFeatureId,
  documentsManagementRouteContracts,
  documentsManagementRoutePaths,
  getDocumentsManagement,
  hrEmployeeDetailRoutePath,
  hrTenantDocumentDownloadPath,
  hrWorkforceDocumentsReadPermission,
  hrWorkforceDocumentsSensitiveReadPermission,
  hrWorkforceDocumentsWritePermission,
  listDocumentsManagement,
  updateDocumentsManagement,
} from "./server.ts";
export { documentsManagementFeatureScope } from "./shared/index.ts";
