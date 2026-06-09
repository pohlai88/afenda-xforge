import type {
  DocumentsManagementDocument,
  DocumentsManagementDocumentSummary,
  DocumentsManagementDocumentVersion,
  DocumentsManagementRecord,
} from "./contracts/index.ts";

export type DocumentsManagementPolicyContext = {
  actorId?: string;
  canRead?: boolean;
  canViewSensitive?: boolean;
  canWrite?: boolean;
  companyId?: string;
  requestId?: string;
  tenantId?: string;
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

export function normalizeDocumentsManagementActorId(
  context?: DocumentsManagementPolicyContext
): string {
  return context?.actorId?.trim() || "system";
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

export function redactDocumentsManagementDocument(
  document: DocumentsManagementDocument,
  canViewSensitive: boolean
): DocumentsManagementDocument {
  if (canViewSensitive) {
    return document;
  }

  return {
    ...document,
    acknowledgment: document.acknowledgment
      ? {
          ...document.acknowledgment,
          note: null,
        }
      : document.acknowledgment,
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

export function redactDocumentsManagementRecord(
  record: DocumentsManagementRecord,
  _canViewSensitive: boolean
): DocumentsManagementRecord {
  return record;
}
