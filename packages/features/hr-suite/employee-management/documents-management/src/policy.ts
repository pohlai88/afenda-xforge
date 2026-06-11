import type {
  DocumentsManagementAcknowledgment,
  DocumentsManagementDocument,
  DocumentsManagementDocumentObligation,
  DocumentsManagementDocumentSummary,
  DocumentsManagementDocumentVersion,
  DocumentsManagementRecord,
} from "./contracts/index.ts";

export type DocumentsManagementPolicyContext = {
  actorEmployeeId?: string;
  actorId?: string;
  canAdminRetention?: boolean;
  canDownload?: boolean;
  canRead?: boolean;
  canReadAudit?: boolean;
  canSelfAcknowledge?: boolean;
  canViewSensitive?: boolean;
  canWrite?: boolean;
  companyId?: string;
  organizationId?: string;
  requestId?: string;
  tenantId?: string;
  userId?: string;
};

const hasTenantScope = (context?: DocumentsManagementPolicyContext): boolean =>
  Boolean(context?.tenantId?.trim());

export function canReadDocumentsManagement(
  context?: DocumentsManagementPolicyContext
): boolean {
  return hasTenantScope(context) && Boolean(context?.canRead);
}

export function canWriteDocumentsManagement(
  context?: DocumentsManagementPolicyContext
): boolean {
  return hasTenantScope(context) && Boolean(context?.canWrite);
}

export function canViewDocumentsManagementSensitiveData(
  context?: DocumentsManagementPolicyContext
): boolean {
  return hasTenantScope(context) && Boolean(context?.canViewSensitive);
}

export function canDownloadDocumentsManagement(
  context?: DocumentsManagementPolicyContext
): boolean {
  return canReadDocumentsManagement(context) && Boolean(context?.canDownload);
}

export function canReadDocumentsManagementAudit(
  context?: DocumentsManagementPolicyContext
): boolean {
  return canReadDocumentsManagement(context) && Boolean(context?.canReadAudit);
}

export function canExecuteDocumentsManagementRetention(
  context?: DocumentsManagementPolicyContext
): boolean {
  return (
    canWriteDocumentsManagement(context) && Boolean(context?.canAdminRetention)
  );
}

export function canSelfAcknowledgeDocumentsManagement(
  context: DocumentsManagementPolicyContext | undefined,
  obligation: DocumentsManagementDocumentObligation
): boolean {
  return Boolean(
    canReadDocumentsManagement(context) &&
      context?.canSelfAcknowledge &&
      context.actorEmployeeId &&
      context.actorEmployeeId === obligation.employeeId
  );
}

export function normalizeDocumentsManagementActorId(
  context?: DocumentsManagementPolicyContext
): string {
  return context?.actorId?.trim() || context?.userId?.trim() || "system";
}

export function buildDocumentsManagementAuditMetadata(
  input: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}

export function requireDocumentsManagementWriteAccess(
  context?: DocumentsManagementPolicyContext
): void {
  if (!canWriteDocumentsManagement(context)) {
    throw new Error("Write access denied for documents management");
  }
}

export function requireDocumentsManagementRetentionAccess(
  context?: DocumentsManagementPolicyContext
): void {
  if (!canExecuteDocumentsManagementRetention(context)) {
    throw new Error(
      "Retention execution access denied for documents management"
    );
  }
}

export function redactDocumentsManagementAcknowledgment(
  acknowledgment: DocumentsManagementAcknowledgment | null | undefined,
  canViewSensitive: boolean
): DocumentsManagementAcknowledgment | null | undefined {
  if (!acknowledgment || canViewSensitive) {
    return acknowledgment;
  }

  return {
    ...acknowledgment,
    note: null,
  };
}

export function redactDocumentsManagementDocument(
  document: DocumentsManagementDocument,
  canViewSensitive: boolean
): DocumentsManagementDocument {
  if (canViewSensitive) {
    return document;
  }

  return {
    ...document,
    acknowledgment: redactDocumentsManagementAcknowledgment(
      document.acknowledgment,
      false
    ),
    rejectionReason: null,
    reference: {
      ...document.reference,
      sourceNotes: null,
    },
  };
}

export function redactDocumentsManagementDocumentSummary(
  document: DocumentsManagementDocumentSummary,
  _canViewSensitive: boolean
): DocumentsManagementDocumentSummary {
  return document;
}

export function redactDocumentsManagementDocumentVersion(
  version: DocumentsManagementDocumentVersion,
  canViewSensitive: boolean
): DocumentsManagementDocumentVersion {
  if (canViewSensitive) {
    return version;
  }

  return {
    ...version,
    sourceNotes: null,
  };
}

export function redactDocumentsManagementDocumentObligation(
  obligation: DocumentsManagementDocumentObligation,
  canViewSensitive: boolean
): DocumentsManagementDocumentObligation {
  if (canViewSensitive) {
    return obligation;
  }

  return {
    ...obligation,
    description: null,
  };
}

export function redactDocumentsManagementRecord(
  record: DocumentsManagementRecord,
  _canViewSensitive: boolean
): DocumentsManagementRecord {
  return record;
}
