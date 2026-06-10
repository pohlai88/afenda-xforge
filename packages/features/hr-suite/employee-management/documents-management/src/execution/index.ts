import {
  acknowledgeDocumentsManagementPolicy,
  createDocumentsManagement,
  createDocumentsManagementDocumentObligation,
  getDocumentsManagement,
  listDocumentsManagement,
  updateDocumentsManagement,
} from "../server.ts";

export type { DocumentsManagementPolicyContext } from "../policy.ts";
export {
  buildDocumentsManagementAuditMetadata,
  canDownloadDocumentsManagement,
  canExecuteDocumentsManagementRetention,
  canReadDocumentsManagement,
  canReadDocumentsManagementAudit,
  canSelfAcknowledgeDocumentsManagement,
  canViewDocumentsManagementSensitiveData,
  canWriteDocumentsManagement,
  normalizeDocumentsManagementActorId,
  redactDocumentsManagementDocument,
  redactDocumentsManagementDocumentObligation,
  redactDocumentsManagementDocumentSummary,
  redactDocumentsManagementDocumentVersion,
  redactDocumentsManagementRecord,
  requireDocumentsManagementRetentionAccess,
  requireDocumentsManagementWriteAccess,
} from "../policy.ts";

export type DocumentsManagementExecutionSurface = {
  acknowledgePolicy: typeof acknowledgeDocumentsManagementPolicy;
  create: typeof createDocumentsManagement;
  createObligation: typeof createDocumentsManagementDocumentObligation;
  getById: typeof getDocumentsManagement;
  list: typeof listDocumentsManagement;
  update: typeof updateDocumentsManagement;
};

export const documentsManagementExecutionSurface: DocumentsManagementExecutionSurface =
  {
    acknowledgePolicy: acknowledgeDocumentsManagementPolicy,
    create: createDocumentsManagement,
    createObligation: createDocumentsManagementDocumentObligation,
    getById: getDocumentsManagement,
    list: listDocumentsManagement,
    update: updateDocumentsManagement,
  };
