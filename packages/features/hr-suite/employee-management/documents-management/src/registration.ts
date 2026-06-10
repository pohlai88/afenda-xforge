import "server-only";

import { randomUUID } from "node:crypto";

import type {
  AcknowledgeDocumentsManagementPolicyInput,
  AnonymizeDocumentsManagementDocumentInput,
  ArchiveDocumentsManagementDocumentInput,
  AssignDocumentsManagementPolicyAcknowledgmentInput,
  CreateDocumentsManagementDocumentObligationInput,
  DeleteDocumentsManagementDocumentInput,
  DocumentsManagementAuditEvent,
  DocumentsManagementDocument,
  DocumentsManagementDocumentObligation,
  DocumentsManagementDocumentVersion,
  ExecuteDocumentsManagementRetentionInput,
  ExpireDocumentsManagementDocumentInput,
  ListDocumentsManagementAuditEventsQuery,
  ListDocumentsManagementDocumentVersionsQuery,
  RegisterDocumentsManagementDocumentInput,
  RejectDocumentsManagementDocumentInput,
  UpdateDocumentsManagementDocumentInput,
  UpdateDocumentsManagementDocumentObligationInput,
  UpdateDocumentsManagementRetentionInput,
  VerifyDocumentsManagementDocumentInput,
} from "./contracts/index.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { DocumentsManagementPolicyContext } from "./policy.ts";
import {
  buildDocumentsManagementAuditMetadata,
  canExecuteDocumentsManagementRetention,
  canReadDocumentsManagement,
  canReadDocumentsManagementAudit,
  canSelfAcknowledgeDocumentsManagement,
  normalizeDocumentsManagementActorId,
  redactDocumentsManagementDocument,
  redactDocumentsManagementDocumentObligation,
  redactDocumentsManagementDocumentVersion,
  requireDocumentsManagementRetentionAccess,
} from "./policy.ts";
import {
  appendDocumentsManagementRepositoryAuditEvent,
  createDocumentsManagementDocumentObligationId,
  getDocumentsManagementRepositoryDocument,
  getDocumentsManagementRepositoryDocumentObligation,
  getDocumentsManagementRepositoryDocumentVersion,
  getDocumentsManagementRepositoryLatestDocumentVersion,
  listDocumentsManagementRepositoryAuditEvents,
  listDocumentsManagementRepositoryDocumentObligations,
  listDocumentsManagementRepositoryDocumentVersions,
  listDocumentsManagementRepositoryDocuments,
  upsertDocumentsManagementRepositoryDocument,
  upsertDocumentsManagementRepositoryDocumentObligation,
  upsertDocumentsManagementRepositoryDocumentVersion,
} from "./repository.ts";
import {
  documentsManagementAcknowledgmentSchema,
  documentsManagementAuditEventSchema,
  documentsManagementDocumentObligationSchema,
  documentsManagementDocumentSchema,
  documentsManagementDocumentVersionSchema,
} from "./schema.ts";
import { writeDocumentsManagementAuditEvent } from "./audit.ts";
import { resolveDocumentsManagementJurisdictionDefaults } from "./jurisdiction.ts";

const DEFAULT_RETENTION = {
  action: "retain" as const,
  anonymizeBeforeDeletion: false,
  archiveAfterEmployeeSeparation: false,
  retentionPeriodDays: null,
};

const normalizeNullableString = (
  value: string | null | undefined
): string | null | undefined => {
  if (value === undefined) {
    return;
  }

  if (value === null) {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const normalizeOptionalDate = (
  value: Date | null | undefined
): Date | null | undefined => {
  if (value === undefined) {
    return;
  }

  if (value === null) {
    return null;
  }

  return value;
};

const normalizeScopeValue = (
  value: string | null | undefined
): string | null | undefined => {
  if (value === undefined) {
    return;
  }

  if (value === null) {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const createDocumentReference = (
  input?: RegisterDocumentsManagementDocumentInput["reference"]
): DocumentsManagementDocument["reference"] => {
  if (!input) {
    return {};
  }

  return {
    contentType: normalizeNullableString(input.contentType),
    fileName: normalizeNullableString(input.fileName),
    sizeBytes: input.sizeBytes ?? null,
    sourceDocumentId: normalizeNullableString(input.sourceDocumentId),
    sourceDocumentNumber: normalizeNullableString(input.sourceDocumentNumber),
    sourceNotes: normalizeNullableString(input.sourceNotes),
    storagePath: normalizeNullableString(input.storagePath),
  };
};

const buildDocumentVersion = (input: {
  document: DocumentsManagementDocument;
  isLatest: boolean;
  previousVersionId?: string;
  replacedByVersionId?: string;
  state: DocumentsManagementDocumentVersion["state"];
  versionNumber: number;
}): DocumentsManagementDocumentVersion =>
  documentsManagementDocumentVersionSchema.parse({
    contentType: input.document.reference.contentType,
    createdAt: new Date(),
    documentId: input.document.id,
    fileName: input.document.reference.fileName,
    id: randomUUID(),
    isLatest: input.isLatest,
    previousVersionId: input.previousVersionId,
    replacedByVersionId: input.replacedByVersionId,
    sizeBytes: input.document.reference.sizeBytes ?? null,
    sourceDocumentId: input.document.reference.sourceDocumentId,
    sourceDocumentNumber: input.document.reference.sourceDocumentNumber,
    sourceNotes: input.document.reference.sourceNotes,
    state: input.state,
    storagePath: input.document.reference.storagePath,
    updatedAt: new Date(),
    versionNumber: input.versionNumber,
  });

const seedDocumentsManagementDocumentVersion = (
  document: DocumentsManagementDocument,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementDocumentVersion => {
  const existingVersions = listDocumentsManagementRepositoryDocumentVersions(
    document.id,
    context
  );

  if (existingVersions.length > 0) {
    const latestVersion = getDocumentsManagementRepositoryLatestDocumentVersion(
      document.id,
      context
    );

    if (!latestVersion) {
      throw new Error("Document version history is inconsistent");
    }

    return latestVersion;
  }

  const seededVersion = buildDocumentVersion({
    document,
    isLatest: true,
    state: "current",
    versionNumber: 1,
  });

  upsertDocumentsManagementRepositoryDocumentVersion(seededVersion, context);

  return seededVersion;
};

const resolveCurrentDocumentsManagementDocumentVersion = (
  document: DocumentsManagementDocument,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementDocumentVersion | null => {
  if (document.currentVersionId) {
    const currentVersion = getDocumentsManagementRepositoryDocumentVersion(
      document.currentVersionId,
      context
    );

    if (currentVersion) {
      return currentVersion;
    }
  }

  return getDocumentsManagementRepositoryLatestDocumentVersion(
    document.id,
    context
  );
};

const buildDocumentVersionMetadata = (
  version: DocumentsManagementDocumentVersion
): Record<string, unknown> => ({
  contentType: version.contentType,
  documentVersionId: version.id,
  documentVersionNumber: version.versionNumber,
  documentVersionState: version.state,
  fileName: version.fileName,
  previousVersionId: version.previousVersionId ?? null,
  replacedByVersionId: version.replacedByVersionId ?? null,
  sizeBytes: version.sizeBytes ?? null,
  sourceDocumentId: version.sourceDocumentId,
  sourceDocumentNumber: version.sourceDocumentNumber,
  storagePath: version.storagePath,
});

const buildDocumentLifecycleMetadata = (
  document: DocumentsManagementDocument
): Record<string, unknown> => ({
  anonymizedAt: document.anonymizedAt ?? null,
  archivedAt: document.archivedAt ?? null,
  archiveAfterEmployeeSeparation:
    document.retention.archiveAfterEmployeeSeparation,
  deletedAt: document.deletedAt ?? null,
  deletedReason: document.deletedReason ?? null,
  expiresAt: document.expiresAt ?? null,
  rejectionReason: document.rejectionReason ?? null,
  rejectedAt: document.rejectedAt ?? null,
  renewalDueAt: document.renewalDueAt ?? null,
  retentionAction: document.retention.action,
  retentionPeriodDays: document.retention.retentionPeriodDays,
  status: document.status,
  uploadedAt: document.uploadedAt ?? null,
  verifiedAt: document.verifiedAt ?? null,
});

const buildAuditSummary = (
  action: DocumentsManagementAuditEvent["action"],
  title: string,
  versionNumber?: number
): string => {
  const actionLabels: Record<DocumentsManagementAuditEvent["action"], string> =
    {
      acknowledge: "Acknowledged",
      anonymize: "Anonymized",
      archive: "Archived",
      delete: "Deleted",
      expire: "Expired",
      register: "Registered",
      reject: "Rejected",
      retain: "Retention executed for",
      update: "Updated",
      verify: "Verified",
    };

  return `${actionLabels[action]} ${title}${versionNumber ? ` v${versionNumber}` : ""}`;
};

const buildAuditEvent = (input: {
  action: DocumentsManagementAuditEvent["action"];
  context?: DocumentsManagementPolicyContext;
  document: DocumentsManagementDocument;
  metadata: Record<string, unknown>;
  version?: DocumentsManagementDocumentVersion;
}): DocumentsManagementAuditEvent =>
  documentsManagementAuditEventSchema.parse({
    action: input.action,
    actorId: normalizeDocumentsManagementActorId(input.context),
    companyId: normalizeScopeValue(input.context?.companyId),
    createdAt: new Date(),
    documentCategory: input.document.documentCategory,
    documentId: input.document.id,
    documentType: input.document.documentType,
    employeeId: input.document.employeeId,
    id: randomUUID(),
    metadata: buildDocumentsManagementAuditMetadata(input.metadata),
    status: input.document.status,
    summary: buildAuditSummary(
      input.action,
      input.document.title,
      input.version?.versionNumber
    ),
    tenantId: normalizeScopeValue(input.context?.tenantId),
    title: input.document.title,
  });

const buildSharedAuditEventInput = (input: {
  action: string;
  context?: DocumentsManagementPolicyContext;
  document?: DocumentsManagementDocument;
  metadata?: Record<string, unknown>;
  reason?: string | null;
  summary: string;
  targetId: string;
  targetType: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}): Parameters<typeof writeDocumentsManagementAuditEvent>[0] => ({
  action: input.action,
  actorId: normalizeDocumentsManagementActorId(input.context),
  channel: input.context?.requestId ? "api" : "server_action",
  companyId: normalizeScopeValue(input.context?.companyId) ?? null,
  module: "hr.documents",
  metadata: input.metadata ?? {},
  reason: input.reason ?? input.summary,
  requestId: input.context?.requestId,
  subjectId: input.document?.employeeId,
  subjectType: input.document ? "employee" : "document",
  summary: input.summary,
  surface: "documents-management",
  targetDisplayName: input.document?.title,
  targetId: input.targetId,
  targetType: input.targetType,
  tenantId: input.context?.tenantId?.trim() ?? "unscoped",
  before: input.before,
  after: input.after,
});

const writeGovernedAudit = async (input: {
  action: string;
  context?: DocumentsManagementPolicyContext;
  document?: DocumentsManagementDocument;
  metadata?: Record<string, unknown>;
  reason?: string | null;
  summary: string;
  targetId: string;
  targetType: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}): Promise<void> => {
  await writeDocumentsManagementAuditEvent(buildSharedAuditEventInput(input));
};

const buildRegisteredDocument = (
  input: RegisterDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementDocument => {
  const jurisdictionDefaults = resolveDocumentsManagementJurisdictionDefaults(
    input.jurisdictionCode ?? null
  );

  return documentsManagementDocumentSchema.parse({
    acknowledgment: null,
    anonymizedAt: undefined,
    archivedAt: undefined,
    companyId: normalizeScopeValue(context?.companyId),
    createdAt: new Date(),
    currentVersionId: undefined,
    currentVersionNumber: undefined,
    deletedAt: undefined,
    deletedReason: undefined,
    description: normalizeNullableString(input.description),
    documentCategory: input.documentCategory,
    documentType: input.documentType,
    employeeId: input.employeeId.trim(),
    expiresAt: normalizeOptionalDate(input.expiresAt),
    id: randomUUID(),
    issuedAt: normalizeOptionalDate(input.issuedAt),
    jurisdictionCode: normalizeNullableString(input.jurisdictionCode),
    legalEntityCode: normalizeNullableString(input.legalEntityCode),
    mandatory: input.mandatory ?? false,
    reference: createDocumentReference(input.reference),
    rejectedAt: undefined,
    rejectionReason: undefined,
    retention: input.retention ?? jurisdictionDefaults?.retention ?? DEFAULT_RETENTION,
    renewalDueAt: normalizeOptionalDate(input.renewalDueAt),
    status: input.status ?? "draft",
    title: input.title.trim(),
    updatedAt: new Date(),
    uploadedAt: new Date(),
    verifiedAt: undefined,
    versionCount: 0,
    visibility: input.visibility ?? "internal",
  });
};

const buildUpdatedDocument = (
  currentDocument: DocumentsManagementDocument,
  input: UpdateDocumentsManagementDocumentInput
): DocumentsManagementDocument => {
  const nextStatus = input.status ?? currentDocument.status;
  const nextRejectionReason =
    input.rejectionReason === undefined
      ? currentDocument.rejectionReason
      : normalizeNullableString(input.rejectionReason);
  let nextRejectedAt = currentDocument.rejectedAt;

  if (nextStatus === "rejected" && currentDocument.status !== "rejected") {
    nextRejectedAt = new Date();
  }

  return documentsManagementDocumentSchema.parse({
    ...currentDocument,
    description:
      input.description === undefined
        ? currentDocument.description
        : normalizeNullableString(input.description),
    documentCategory:
      input.documentCategory ?? currentDocument.documentCategory,
    documentType: input.documentType ?? currentDocument.documentType,
    employeeId: input.employeeId?.trim() ?? currentDocument.employeeId,
    expiresAt:
      input.expiresAt === undefined
        ? currentDocument.expiresAt
        : normalizeOptionalDate(input.expiresAt),
    issuedAt:
      input.issuedAt === undefined
        ? currentDocument.issuedAt
        : normalizeOptionalDate(input.issuedAt),
    jurisdictionCode:
      input.jurisdictionCode === undefined
        ? currentDocument.jurisdictionCode
        : normalizeNullableString(input.jurisdictionCode),
    legalEntityCode:
      input.legalEntityCode === undefined
        ? currentDocument.legalEntityCode
        : normalizeNullableString(input.legalEntityCode),
    mandatory: input.mandatory ?? currentDocument.mandatory,
    reference: input.reference
      ? createDocumentReference(input.reference)
      : currentDocument.reference,
    rejectedAt: nextRejectedAt,
    rejectionReason: nextRejectionReason,
    retention: input.retention ?? currentDocument.retention,
    renewalDueAt:
      input.renewalDueAt === undefined
        ? currentDocument.renewalDueAt
        : normalizeOptionalDate(input.renewalDueAt),
    status: nextStatus,
    title: input.title?.trim() ?? currentDocument.title,
    updatedAt: new Date(),
    verifiedAt:
      input.verifiedAt === undefined
        ? currentDocument.verifiedAt
        : normalizeOptionalDate(input.verifiedAt),
    visibility: input.visibility ?? currentDocument.visibility,
  });
};

const buildLifecycleUpdatedDocument = (
  currentDocument: DocumentsManagementDocument,
  input: {
    archivedAt?: Date | null;
    retention?: DocumentsManagementDocument["retention"];
    rejectedAt?: Date | null;
    rejectionReason?: string | null;
    renewalDueAt?: Date | null;
    status: DocumentsManagementDocument["status"];
    verifiedAt?: Date | null;
  }
): DocumentsManagementDocument => {
  const nextStatus = input.status;
  let nextVerifiedAt: Date | null = null;
  if (nextStatus === "verified") {
    nextVerifiedAt = normalizeOptionalDate(input.verifiedAt) ?? new Date();
  } else if (nextStatus === "expired" || nextStatus === "archived") {
    nextVerifiedAt = currentDocument.verifiedAt ?? null;
  }

  let nextRejectedAt: Date | null = null;
  if (nextStatus === "rejected") {
    nextRejectedAt = normalizeOptionalDate(input.rejectedAt) ?? new Date();
  }

  let nextArchivedAt: Date | null = null;
  if (nextStatus === "archived") {
    nextArchivedAt = normalizeOptionalDate(input.archivedAt) ?? new Date();
  }
  const nextRejectionReason =
    nextStatus === "rejected"
      ? normalizeNullableString(input.rejectionReason)
      : null;

  if (nextStatus === "rejected" && !nextRejectionReason) {
    throw new Error("Rejection reason is required when rejecting a document");
  }

  return documentsManagementDocumentSchema.parse({
    ...currentDocument,
    archivedAt: nextArchivedAt,
    rejectedAt: nextRejectedAt,
    rejectionReason: nextRejectionReason,
    renewalDueAt:
      input.renewalDueAt === undefined
        ? currentDocument.renewalDueAt
        : normalizeOptionalDate(input.renewalDueAt),
    retention: input.retention ?? currentDocument.retention,
    status: nextStatus,
    updatedAt: new Date(),
    verifiedAt: nextVerifiedAt,
  });
};

const obligationMatchesDocument = (
  obligation: DocumentsManagementDocumentObligation,
  document: DocumentsManagementDocument
): boolean => {
  if (obligation.employeeId !== document.employeeId) {
    return false;
  }

  if (obligation.obligationType !== "document") {
    return false;
  }

  if (obligation.documentCategory !== document.documentCategory) {
    return false;
  }

  if (obligation.documentType !== document.documentType) {
    return false;
  }

  if (
    obligation.legalEntityCode &&
    obligation.legalEntityCode !== document.legalEntityCode
  ) {
    return false;
  }

  if (
    obligation.jurisdictionCode &&
    obligation.jurisdictionCode !== document.jurisdictionCode
  ) {
    return false;
  }

  return true;
};

const syncObligationsForDocument = async (
  document: DocumentsManagementDocument,
  context?: DocumentsManagementPolicyContext
): Promise<void> => {
  const obligations = listDocumentsManagementRepositoryDocumentObligations(context);

  for (const obligation of obligations) {
    if (!obligationMatchesDocument(obligation, document)) {
      continue;
    }

    let nextStatus = obligation.status;
    let evidenceDocumentId = obligation.evidenceDocumentId;
    let fulfilledAt = obligation.fulfilledAt;

    if (document.deletedAt || document.status === "rejected") {
      nextStatus = "pending";
      evidenceDocumentId = null;
      fulfilledAt = null;
    } else if (document.status === "expired") {
      nextStatus = "expired";
      evidenceDocumentId = document.id;
    } else {
      nextStatus = "satisfied";
      evidenceDocumentId = document.id;
      fulfilledAt = new Date();
    }

    upsertDocumentsManagementRepositoryDocumentObligation(
      documentsManagementDocumentObligationSchema.parse({
        ...obligation,
        evidenceDocumentId,
        expiresAt: obligation.expiresAt ?? document.expiresAt ?? null,
        fulfilledAt,
        status: nextStatus,
        updatedAt: new Date(),
      }),
      context
    );
  }
};

const persistVersionedDocumentRevision = async (input: {
  action: DocumentsManagementAuditEvent["action"];
  auditAction: string;
  context?: DocumentsManagementPolicyContext;
  metadata: Record<string, unknown>;
  nextDocumentBase: DocumentsManagementDocument;
  reason?: string | null;
}): Promise<DocumentsManagementDocument> => {
  const currentVersion =
    resolveCurrentDocumentsManagementDocumentVersion(
      input.nextDocumentBase,
      input.context
    ) ??
    seedDocumentsManagementDocumentVersion(
      input.nextDocumentBase,
      input.context
    );

  const beforeDocument = getDocumentsManagementRepositoryDocument(
    input.nextDocumentBase.id,
    input.context
  );

  const nextVersion = buildDocumentVersion({
    document: input.nextDocumentBase,
    isLatest: true,
    previousVersionId: currentVersion.id,
    state: "current",
    versionNumber: currentVersion.versionNumber + 1,
  });
  const retiredVersion = documentsManagementDocumentVersionSchema.parse({
    ...currentVersion,
    isLatest: false,
    replacedByVersionId: nextVersion.id,
    state: "superseded",
    updatedAt: new Date(),
  });
  const nextDocument = documentsManagementDocumentSchema.parse({
    ...input.nextDocumentBase,
    currentVersionId: nextVersion.id,
    currentVersionNumber: nextVersion.versionNumber,
    versionCount: nextVersion.versionNumber,
  });

  upsertDocumentsManagementRepositoryDocumentVersion(
    retiredVersion,
    input.context
  );
  upsertDocumentsManagementRepositoryDocumentVersion(nextVersion, input.context);
  upsertDocumentsManagementRepositoryDocument(nextDocument, input.context);
  await syncObligationsForDocument(nextDocument, input.context);
  appendDocumentsManagementRepositoryAuditEvent(
    buildAuditEvent({
      action: input.action,
      context: input.context,
      document: nextDocument,
      metadata: {
        ...input.metadata,
        ...buildDocumentVersionMetadata(nextVersion),
      },
      version: nextVersion,
    })
  );
  await writeGovernedAudit({
    action: input.auditAction,
    after: nextDocument as Record<string, unknown>,
    before: (beforeDocument ?? {}) as Record<string, unknown>,
    context: input.context,
    document: nextDocument,
    metadata: {
      ...input.metadata,
      ...buildDocumentVersionMetadata(nextVersion),
    },
    reason: input.reason,
    summary: buildAuditSummary(
      input.action,
      nextDocument.title,
      nextVersion.versionNumber
    ),
    targetId: nextDocument.id,
    targetType: "document",
  });

  return nextDocument;
};

export async function registerDocumentsManagementDocument(
  input: RegisterDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): Promise<DocumentsManagementDocument> {
  return runHrSuiteFeatureAction(async () => {
    const baseDocument = buildRegisteredDocument(input, context);
    const version = buildDocumentVersion({
      document: baseDocument,
      isLatest: true,
      state: "current",
      versionNumber: 1,
    });
    const nextDocument = documentsManagementDocumentSchema.parse({
      ...baseDocument,
      currentVersionId: version.id,
      currentVersionNumber: version.versionNumber,
      versionCount: version.versionNumber,
    });

    upsertDocumentsManagementRepositoryDocumentVersion(version, context);
    upsertDocumentsManagementRepositoryDocument(nextDocument, context);
    await syncObligationsForDocument(nextDocument, context);
    appendDocumentsManagementRepositoryAuditEvent(
      buildAuditEvent({
        action: "register",
        context,
        document: nextDocument,
        metadata: {
          ...buildDocumentLifecycleMetadata(nextDocument),
          documentCategory: nextDocument.documentCategory,
          documentType: nextDocument.documentType,
          employeeId: nextDocument.employeeId,
          jurisdictionCode: nextDocument.jurisdictionCode,
          legalEntityCode: nextDocument.legalEntityCode,
          status: nextDocument.status,
          visibility: nextDocument.visibility,
          ...buildDocumentVersionMetadata(version),
        },
        version,
      })
    );
    await writeGovernedAudit({
      action: "hr.documents.register",
      after: nextDocument as Record<string, unknown>,
      before: {},
      context,
      document: nextDocument,
      metadata: {
        ...buildDocumentLifecycleMetadata(nextDocument),
        ...buildDocumentVersionMetadata(version),
      },
      summary: buildAuditSummary(
        "register",
        nextDocument.title,
        version.versionNumber
      ),
      targetId: nextDocument.id,
      targetType: "document",
    });

    return redactDocumentsManagementDocument(
      nextDocument,
      Boolean(context?.canViewSensitive)
    );
  }, context);
}

export async function updateDocumentsManagementDocument(
  input: UpdateDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): Promise<DocumentsManagementDocument> {
  return runHrSuiteFeatureAction(async () => {
    const currentDocument = getDocumentsManagementRepositoryDocument(
      input.id,
      context
    );

    if (!currentDocument) {
      throw new Error("Document not found");
    }

    const nextDocumentBase = buildUpdatedDocument(currentDocument, input);
    const nextDocument = await persistVersionedDocumentRevision({
      action: "update",
      auditAction: "hr.documents.update",
      context,
      metadata: {
        ...buildDocumentLifecycleMetadata(nextDocumentBase),
        changedFields: Object.entries(input)
          .filter(([key, value]) => key !== "id" && value !== undefined)
          .map(([key]) => key),
        documentCategory: nextDocumentBase.documentCategory,
        documentType: nextDocumentBase.documentType,
        employeeId: nextDocumentBase.employeeId,
        status: nextDocumentBase.status,
        visibility: nextDocumentBase.visibility,
      },
      nextDocumentBase,
    });

    return redactDocumentsManagementDocument(
      nextDocument,
      Boolean(context?.canViewSensitive)
    );
  }, context);
}

export async function verifyDocumentsManagementDocument(
  input: VerifyDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): Promise<DocumentsManagementDocument> {
  return runHrSuiteFeatureAction(async () => {
    const currentDocument = getDocumentsManagementRepositoryDocument(
      input.id,
      context
    );

    if (!currentDocument) {
      throw new Error("Document not found");
    }

    const nextDocumentBase = buildLifecycleUpdatedDocument(currentDocument, {
      renewalDueAt: input.renewalDueAt,
      status: "verified",
      verifiedAt: input.verifiedAt,
    });
    const nextDocument = await persistVersionedDocumentRevision({
      action: "verify",
      auditAction: "hr.documents.verify",
      context,
      metadata: {
        ...buildDocumentLifecycleMetadata(nextDocumentBase),
        verifiedAt:
          nextDocumentBase.verifiedAt ?? input.verifiedAt ?? new Date(),
      },
      nextDocumentBase,
    });

    return redactDocumentsManagementDocument(
      nextDocument,
      Boolean(context?.canViewSensitive)
    );
  }, context);
}

export async function rejectDocumentsManagementDocument(
  input: RejectDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): Promise<DocumentsManagementDocument> {
  return runHrSuiteFeatureAction(async () => {
    const currentDocument = getDocumentsManagementRepositoryDocument(
      input.id,
      context
    );

    if (!currentDocument) {
      throw new Error("Document not found");
    }

    const nextDocumentBase = buildLifecycleUpdatedDocument(currentDocument, {
      rejectedAt: input.rejectedAt,
      rejectionReason: input.rejectionReason,
      renewalDueAt: input.renewalDueAt,
      status: "rejected",
    });
    const nextDocument = await persistVersionedDocumentRevision({
      action: "reject",
      auditAction: "hr.documents.reject",
      context,
      metadata: {
        ...buildDocumentLifecycleMetadata(nextDocumentBase),
        rejectedAt:
          nextDocumentBase.rejectedAt ?? input.rejectedAt ?? new Date(),
      },
      nextDocumentBase,
      reason: input.rejectionReason,
    });

    return redactDocumentsManagementDocument(
      nextDocument,
      Boolean(context?.canViewSensitive)
    );
  }, context);
}

export async function expireDocumentsManagementDocument(
  input: ExpireDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): Promise<DocumentsManagementDocument> {
  return runHrSuiteFeatureAction(async () => {
    const currentDocument = getDocumentsManagementRepositoryDocument(
      input.id,
      context
    );

    if (!currentDocument) {
      throw new Error("Document not found");
    }

    const expiredAt = normalizeOptionalDate(input.expiredAt);
    const effectiveExpiredAt = expiredAt ?? currentDocument.expiresAt;
    if (!effectiveExpiredAt) {
      throw new Error(
        "Document expiry date is required before expiring a document"
      );
    }

    const nextDocumentBase = buildLifecycleUpdatedDocument(currentDocument, {
      renewalDueAt: input.renewalDueAt,
      status: "expired",
    });
    const nextDocument = await persistVersionedDocumentRevision({
      action: "expire",
      auditAction: "hr.documents.expire",
      context,
      metadata: {
        ...buildDocumentLifecycleMetadata(nextDocumentBase),
        expiredAt: expiredAt ?? effectiveExpiredAt,
      },
      nextDocumentBase,
    });

    return redactDocumentsManagementDocument(
      nextDocument,
      Boolean(context?.canViewSensitive)
    );
  }, context);
}

export async function archiveDocumentsManagementDocument(
  input: ArchiveDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): Promise<DocumentsManagementDocument> {
  return runHrSuiteFeatureAction(async () => {
    const currentDocument = getDocumentsManagementRepositoryDocument(
      input.id,
      context
    );

    if (!currentDocument) {
      throw new Error("Document not found");
    }

    const nextDocumentBase = buildLifecycleUpdatedDocument(currentDocument, {
      archivedAt: input.archivedAt,
      status: "archived",
    });
    const nextDocument = await persistVersionedDocumentRevision({
      action: "archive",
      auditAction: "hr.documents.archive",
      context,
      metadata: {
        ...buildDocumentLifecycleMetadata(nextDocumentBase),
        archivedAt:
          nextDocumentBase.archivedAt ??
          normalizeOptionalDate(input.archivedAt) ??
          new Date(),
      },
      nextDocumentBase,
    });

    return redactDocumentsManagementDocument(
      nextDocument,
      Boolean(context?.canViewSensitive)
    );
  }, context);
}

export async function updateDocumentsManagementDocumentRetention(
  input: UpdateDocumentsManagementRetentionInput,
  context?: DocumentsManagementPolicyContext
): Promise<DocumentsManagementDocument> {
  return runHrSuiteFeatureAction(async () => {
    const currentDocument = getDocumentsManagementRepositoryDocument(
      input.id,
      context
    );

    if (!currentDocument) {
      throw new Error("Document not found");
    }

    const nextDocumentBase = documentsManagementDocumentSchema.parse({
      ...currentDocument,
      retention: input.retention,
      updatedAt: new Date(),
    });
    const nextDocument = await persistVersionedDocumentRevision({
      action: "update",
      auditAction: "hr.documents.retention.update",
      context,
      metadata: {
        ...buildDocumentLifecycleMetadata(nextDocumentBase),
        retentionAction: input.retention.action,
        retentionPeriodDays: input.retention.retentionPeriodDays,
      },
      nextDocumentBase,
    });

    return redactDocumentsManagementDocument(
      nextDocument,
      Boolean(context?.canViewSensitive)
    );
  }, context);
}

export async function deleteDocumentsManagementDocument(
  input: DeleteDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): Promise<DocumentsManagementDocument> {
  return runHrSuiteFeatureAction(async () => {
    const currentDocument = getDocumentsManagementRepositoryDocument(
      input.id,
      context
    );

    if (!currentDocument) {
      throw new Error("Document not found");
    }

    const nextDocumentBase = documentsManagementDocumentSchema.parse({
      ...currentDocument,
      deletedAt: new Date(),
      deletedReason: normalizeNullableString(input.reason) ?? null,
      reference: {},
      status: "archived",
      updatedAt: new Date(),
    });
    const nextDocument = await persistVersionedDocumentRevision({
      action: "delete",
      auditAction: "hr.documents.delete",
      context,
      metadata: {
        ...buildDocumentLifecycleMetadata(nextDocumentBase),
      },
      nextDocumentBase,
      reason: input.reason ?? null,
    });

    return redactDocumentsManagementDocument(
      nextDocument,
      Boolean(context?.canViewSensitive)
    );
  }, context);
}

export async function anonymizeDocumentsManagementDocument(
  input: AnonymizeDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): Promise<DocumentsManagementDocument> {
  return runHrSuiteFeatureAction(async () => {
    const currentDocument = getDocumentsManagementRepositoryDocument(
      input.id,
      context
    );

    if (!currentDocument) {
      throw new Error("Document not found");
    }

    const nextDocumentBase = documentsManagementDocumentSchema.parse({
      ...currentDocument,
      acknowledgment: currentDocument.acknowledgment
        ? documentsManagementAcknowledgmentSchema.parse({
            ...currentDocument.acknowledgment,
            note: null,
          })
        : null,
      anonymizedAt: new Date(),
      description: null,
      legalEntityCode: null,
      reference: {
        ...currentDocument.reference,
        sourceNotes: null,
      },
      updatedAt: new Date(),
    });
    const nextDocument = await persistVersionedDocumentRevision({
      action: "anonymize",
      auditAction: "hr.documents.anonymize",
      context,
      metadata: {
        ...buildDocumentLifecycleMetadata(nextDocumentBase),
      },
      nextDocumentBase,
      reason: input.reason ?? null,
    });

    return redactDocumentsManagementDocument(
      nextDocument,
      Boolean(context?.canViewSensitive)
    );
  }, context);
}

export async function executeDocumentsManagementRetention(
  input: ExecuteDocumentsManagementRetentionInput = {},
  context?: DocumentsManagementPolicyContext
): Promise<readonly DocumentsManagementDocument[]> {
  if (!canExecuteDocumentsManagementRetention(context)) {
    requireDocumentsManagementRetentionAccess(context);
  }

  const documents = listDocumentsManagementRepositoryDocuments(context).filter(
    (document) =>
      !document.deletedAt &&
      (input.action ? document.retention.action === input.action : true) &&
      (input.documentIds ? input.documentIds.includes(document.id) : true)
  );
  const retained: DocumentsManagementDocument[] = [];
  const now = new Date();

  for (const document of documents) {
    const anchorDate =
      document.archivedAt ?? document.expiresAt ?? document.uploadedAt ?? document.createdAt;
    const days = document.retention.retentionPeriodDays ?? 0;
    const dueAt = new Date(anchorDate.getTime() + days * 24 * 60 * 60 * 1000);

    if (dueAt.getTime() > now.getTime()) {
      continue;
    }

    let nextDocument: DocumentsManagementDocument;
    if (document.retention.action === "archive") {
      nextDocument = await archiveDocumentsManagementDocument(
        { archivedAt: now, id: document.id },
        context
      );
    } else if (document.retention.action === "delete") {
      nextDocument = await deleteDocumentsManagementDocument(
        { id: document.id, reason: "Retention execution" },
        context
      );
    } else if (document.retention.action === "anonymize") {
      nextDocument = await anonymizeDocumentsManagementDocument(
        { id: document.id, reason: "Retention execution" },
        context
      );
    } else {
      appendDocumentsManagementRepositoryAuditEvent(
        buildAuditEvent({
          action: "retain",
          context,
          document,
          metadata: {
            retentionAction: document.retention.action,
          },
        })
      );
      await writeGovernedAudit({
        action: "hr.documents.retention.execute",
        after: document as Record<string, unknown>,
        before: document as Record<string, unknown>,
        context,
        document,
        metadata: {
          executedAction: document.retention.action,
        },
        summary: `Retention evaluated for ${document.title}`,
        targetId: document.id,
        targetType: "document",
      });
      nextDocument = document;
    }

    retained.push(nextDocument);
  }

  return retained;
}

export async function createDocumentsManagementDocumentObligation(
  input: CreateDocumentsManagementDocumentObligationInput,
  context?: DocumentsManagementPolicyContext
): Promise<DocumentsManagementDocumentObligation> {
  return runHrSuiteFeatureAction(async () => {
    const jurisdictionDefaults = resolveDocumentsManagementJurisdictionDefaults(
      input.jurisdictionCode ?? null
    );
    const obligation = documentsManagementDocumentObligationSchema.parse({
      acknowledgmentId: null,
      companyId: normalizeScopeValue(context?.companyId),
      createdAt: new Date(),
      description: normalizeNullableString(input.description),
      documentCategory: input.documentCategory,
      documentType: input.documentType,
      dueAt: normalizeOptionalDate(input.dueAt),
      employeeId: input.employeeId.trim(),
      evidenceDocumentId: null,
      expiresAt: normalizeOptionalDate(input.expiresAt),
      fulfilledAt: null,
      id: createDocumentsManagementDocumentObligationId(),
      jurisdictionCode: normalizeNullableString(input.jurisdictionCode),
      legalEntityCode: normalizeNullableString(input.legalEntityCode),
      mandatory: input.mandatory ?? true,
      obligationType: input.obligationType ?? "document",
      policyId: normalizeNullableString(input.policyId),
      policyVersion: normalizeNullableString(input.policyVersion),
      retention: input.retention ?? jurisdictionDefaults?.retention ?? DEFAULT_RETENTION,
      source: normalizeNullableString(input.source),
      status: input.status ?? "pending",
      title: input.title.trim(),
      updatedAt: new Date(),
      waivedAt: null,
    });

    upsertDocumentsManagementRepositoryDocumentObligation(obligation, context);
    await writeGovernedAudit({
      action: "hr.documents.obligation.create",
      after: obligation as Record<string, unknown>,
      before: {},
      context,
      metadata: {
        obligationType: obligation.obligationType,
      },
      summary: `Created obligation ${obligation.title}`,
      targetId: obligation.id,
      targetType: "document_obligation",
    });

    return redactDocumentsManagementDocumentObligation(
      obligation,
      Boolean(context?.canViewSensitive)
    );
  }, context);
}

export async function updateDocumentsManagementDocumentObligation(
  input: UpdateDocumentsManagementDocumentObligationInput,
  context?: DocumentsManagementPolicyContext
): Promise<DocumentsManagementDocumentObligation> {
  return runHrSuiteFeatureAction(async () => {
    const currentObligation = getDocumentsManagementRepositoryDocumentObligation(
      input.id,
      context
    );

    if (!currentObligation) {
      throw new Error("Document obligation not found");
    }

    const nextObligation = documentsManagementDocumentObligationSchema.parse({
      ...currentObligation,
      description:
        input.description === undefined
          ? currentObligation.description
          : normalizeNullableString(input.description),
      dueAt:
        input.dueAt === undefined
          ? currentObligation.dueAt
          : normalizeOptionalDate(input.dueAt),
      expiresAt:
        input.expiresAt === undefined
          ? currentObligation.expiresAt
          : normalizeOptionalDate(input.expiresAt),
      jurisdictionCode:
        input.jurisdictionCode === undefined
          ? currentObligation.jurisdictionCode
          : normalizeNullableString(input.jurisdictionCode),
      legalEntityCode:
        input.legalEntityCode === undefined
          ? currentObligation.legalEntityCode
          : normalizeNullableString(input.legalEntityCode),
      mandatory: input.mandatory ?? currentObligation.mandatory,
      policyId:
        input.policyId === undefined
          ? currentObligation.policyId
          : normalizeNullableString(input.policyId),
      policyVersion:
        input.policyVersion === undefined
          ? currentObligation.policyVersion
          : normalizeNullableString(input.policyVersion),
      retention: input.retention ?? currentObligation.retention,
      source:
        input.source === undefined
          ? currentObligation.source
          : normalizeNullableString(input.source),
      status: input.status ?? currentObligation.status,
      title: input.title?.trim() ?? currentObligation.title,
      updatedAt: new Date(),
    });

    upsertDocumentsManagementRepositoryDocumentObligation(nextObligation, context);
    await writeGovernedAudit({
      action: "hr.documents.obligation.update",
      after: nextObligation as Record<string, unknown>,
      before: currentObligation as Record<string, unknown>,
      context,
      metadata: {
        obligationType: nextObligation.obligationType,
      },
      summary: `Updated obligation ${nextObligation.title}`,
      targetId: nextObligation.id,
      targetType: "document_obligation",
    });

    return redactDocumentsManagementDocumentObligation(
      nextObligation,
      Boolean(context?.canViewSensitive)
    );
  }, context);
}

export async function assignDocumentsManagementPolicyAcknowledgment(
  input: AssignDocumentsManagementPolicyAcknowledgmentInput,
  context?: DocumentsManagementPolicyContext
): Promise<DocumentsManagementDocumentObligation> {
  return createDocumentsManagementDocumentObligation(
    {
      description: input.description,
      documentCategory: "policy",
      documentType: "employee_handbook_acknowledgment",
      dueAt: input.dueAt,
      employeeId: input.employeeId,
      jurisdictionCode: input.jurisdictionCode,
      legalEntityCode: input.legalEntityCode,
      mandatory: input.mandatory,
      obligationType: "policy_acknowledgment",
      policyId: input.policyId,
      policyVersion: input.policyVersion,
      retention: input.retention,
      source: "policy-assignment",
      status: "pending",
      title: input.title,
    },
    context
  );
}

export async function acknowledgeDocumentsManagementPolicy(
  input: AcknowledgeDocumentsManagementPolicyInput,
  context?: DocumentsManagementPolicyContext
): Promise<DocumentsManagementDocumentObligation> {
  const obligation = getDocumentsManagementRepositoryDocumentObligation(
    input.id,
    context
  );

  if (!obligation) {
    throw new Error("Document obligation not found");
  }

  if (!canSelfAcknowledgeDocumentsManagement(context, obligation)) {
    throw new Error("Policy acknowledgment access denied");
  }

  const acknowledgment = documentsManagementAcknowledgmentSchema.parse({
    acknowledgmentMethod: input.acknowledgmentMethod,
    acknowledgedAt: input.acknowledgedAt ?? new Date(),
    acknowledgedBy:
      context?.actorEmployeeId ??
      context?.userId ??
      normalizeDocumentsManagementActorId(context),
    documentId: obligation.evidenceDocumentId ?? null,
    id: randomUUID(),
    note: normalizeNullableString(input.note) ?? null,
    obligationId: obligation.id,
    policyId: obligation.policyId ?? obligation.id,
    policyVersion: obligation.policyVersion ?? "v1",
  });

  const nextObligation = documentsManagementDocumentObligationSchema.parse({
    ...obligation,
    acknowledgmentId: acknowledgment.id,
    fulfilledAt: acknowledgment.acknowledgedAt,
    status: "satisfied",
    updatedAt: new Date(),
  });

  upsertDocumentsManagementRepositoryDocumentObligation(nextObligation, context);
  await writeGovernedAudit({
    action: "hr.documents.acknowledge",
    after: nextObligation as Record<string, unknown>,
    before: obligation as Record<string, unknown>,
    context,
    metadata: {
      acknowledgmentId: acknowledgment.id,
      acknowledgmentMethod: acknowledgment.acknowledgmentMethod,
      policyId: acknowledgment.policyId,
      policyVersion: acknowledgment.policyVersion,
    },
    summary: `Acknowledged ${nextObligation.title}`,
    targetId: nextObligation.id,
    targetType: "document_obligation",
  });

  return redactDocumentsManagementDocumentObligation(
    nextObligation,
    Boolean(context?.canViewSensitive)
  );
}

export async function archiveDocumentsManagementDocumentsForSeparatedEmployee(
  input: {
    employeeId: string;
  },
  context?: DocumentsManagementPolicyContext
): Promise<readonly DocumentsManagementDocument[]> {
  return runHrSuiteFeatureAction(async () => {
    const archived: DocumentsManagementDocument[] = [];

    for (const document of listDocumentsManagementRepositoryDocuments(context)) {
      if (
        document.employeeId !== input.employeeId ||
        !document.retention.archiveAfterEmployeeSeparation ||
        document.archivedAt
      ) {
        continue;
      }

      archived.push(
        await archiveDocumentsManagementDocument(
          {
            archivedAt: new Date(),
            id: document.id,
          },
          context
        )
      );
    }

    return archived;
  }, context);
}

export async function recordDocumentsManagementDocumentAccess(
  input: {
    action: "download" | "read_sensitive";
    documentId: string;
  },
  context?: DocumentsManagementPolicyContext
): Promise<void> {
  const document = getDocumentsManagementRepositoryDocument(input.documentId, context);

  if (!document || !canReadDocumentsManagement(context)) {
    return;
  }

  await writeGovernedAudit({
    action:
      input.action === "download"
        ? "hr.documents.download"
        : "hr.documents.read_sensitive",
    after: document as Record<string, unknown>,
    before: document as Record<string, unknown>,
    context,
    document,
    metadata: {
      accessAction: input.action,
    },
    summary:
      input.action === "download"
        ? `Downloaded ${document.title}`
        : `Viewed sensitive document ${document.title}`,
    targetId: document.id,
    targetType: "document",
  });
}

export function getDocumentsManagementDocument(
  id: string,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementDocument | null {
  if (!canReadDocumentsManagement(context)) {
    return null;
  }

  const document = getDocumentsManagementRepositoryDocument(id, context);
  return document
    ? redactDocumentsManagementDocument(
        document,
        Boolean(context?.canViewSensitive)
      )
    : null;
}

export function listDocumentsManagementDocumentAuditTrail(
  query: ListDocumentsManagementAuditEventsQuery = {},
  context?: DocumentsManagementPolicyContext
): readonly DocumentsManagementAuditEvent[] {
  if (!canReadDocumentsManagementAudit(context)) {
    return [];
  }

  const page = query.page && query.page > 0 ? Math.floor(query.page) : 1;
  const pageSize =
    query.pageSize && query.pageSize > 0
      ? Math.min(Math.floor(query.pageSize), 500)
      : 25;

  const filteredEvents = listDocumentsManagementRepositoryAuditEvents(
    query.documentId,
    context
  ).filter((event) => {
    if (query.action && event.action !== query.action) {
      return false;
    }

    if (query.employeeId && event.employeeId !== query.employeeId) {
      return false;
    }

    return true;
  });

  const startIndex = (page - 1) * pageSize;
  return filteredEvents.slice(startIndex, startIndex + pageSize);
}

export function listDocumentsManagementDocumentVersions(
  query: ListDocumentsManagementDocumentVersionsQuery,
  context?: DocumentsManagementPolicyContext
): readonly DocumentsManagementDocumentVersion[] {
  if (!canReadDocumentsManagement(context)) {
    return [];
  }

  const page = query.page && query.page > 0 ? Math.floor(query.page) : 1;
  const pageSize =
    query.pageSize && query.pageSize > 0
      ? Math.min(Math.floor(query.pageSize), 500)
      : 25;

  const versions = listDocumentsManagementRepositoryDocumentVersions(
    query.documentId,
    context
  );
  const startIndex = (page - 1) * pageSize;

  return versions
    .slice(startIndex, startIndex + pageSize)
    .map((version) =>
      redactDocumentsManagementDocumentVersion(
        version,
        Boolean(context?.canViewSensitive)
      )
    );
}

export function getDocumentsManagementDocumentVersion(
  id: string,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementDocumentVersion | null {
  if (!canReadDocumentsManagement(context)) {
    return null;
  }

  const version = getDocumentsManagementRepositoryDocumentVersion(id, context);
  return version
    ? redactDocumentsManagementDocumentVersion(
        version,
        Boolean(context?.canViewSensitive)
      )
    : null;
}

export function getDocumentsManagementDocumentLatestVersion(
  documentId: string,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementDocumentVersion | null {
  if (!canReadDocumentsManagement(context)) {
    return null;
  }

  const version = getDocumentsManagementRepositoryLatestDocumentVersion(
    documentId,
    context
  );
  return version
    ? redactDocumentsManagementDocumentVersion(
        version,
        Boolean(context?.canViewSensitive)
      )
    : null;
}
