import "server-only";

import { randomUUID } from "node:crypto";

import type {
  ArchiveDocumentsManagementDocumentInput,
  DocumentsManagementAuditEvent,
  DocumentsManagementDocument,
  DocumentsManagementDocumentVersion,
  ExpireDocumentsManagementDocumentInput,
  ListDocumentsManagementAuditEventsQuery,
  ListDocumentsManagementDocumentVersionsQuery,
  RegisterDocumentsManagementDocumentInput,
  RejectDocumentsManagementDocumentInput,
  UpdateDocumentsManagementDocumentInput,
  UpdateDocumentsManagementRetentionInput,
  VerifyDocumentsManagementDocumentInput,
} from "./contracts/index.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { DocumentsManagementPolicyContext } from "./policy.ts";
import {
  buildDocumentsManagementAuditMetadata,
  canReadDocumentsManagement,
  normalizeDocumentsManagementActorId,
  redactDocumentsManagementDocument,
  redactDocumentsManagementDocumentVersion,
} from "./policy.ts";
import {
  appendDocumentsManagementRepositoryAuditEvent,
  getDocumentsManagementRepositoryDocument,
  getDocumentsManagementRepositoryDocumentVersion,
  getDocumentsManagementRepositoryLatestDocumentVersion,
  listDocumentsManagementRepositoryAuditEvents,
  listDocumentsManagementRepositoryDocumentVersions,
  upsertDocumentsManagementRepositoryDocument,
  upsertDocumentsManagementRepositoryDocumentVersion,
} from "./repository.ts";
import {
  documentsManagementAuditEventSchema,
  documentsManagementDocumentSchema,
  documentsManagementDocumentVersionSchema,
} from "./schema.ts";

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
    storagePath: input.document.reference.storagePath,
    sourceDocumentId: input.document.reference.sourceDocumentId,
    sourceDocumentNumber: input.document.reference.sourceDocumentNumber,
    sourceNotes: input.document.reference.sourceNotes,
    state: input.state,
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
  storagePath: version.storagePath,
  sourceDocumentId: version.sourceDocumentId,
  sourceDocumentNumber: version.sourceDocumentNumber,
});

const buildDocumentLifecycleMetadata = (
  document: DocumentsManagementDocument
): Record<string, unknown> => ({
  archivedAt: document.archivedAt ?? null,
  archiveAfterEmployeeSeparation:
    document.retention.archiveAfterEmployeeSeparation,
  anonymizeBeforeDeletion: document.retention.anonymizeBeforeDeletion,
  expiresAt: document.expiresAt ?? null,
  rejectionReason: document.rejectionReason ?? null,
  rejectedAt: document.rejectedAt ?? null,
  renewalDueAt: document.renewalDueAt ?? null,
  retentionAction: document.retention.action,
  retentionPeriodDays: document.retention.retentionPeriodDays,
  status: document.status,
  verifiedAt: document.verifiedAt ?? null,
});

const buildAuditSummary = (
  action: DocumentsManagementAuditEvent["action"],
  title: string,
  versionNumber?: number
): string => {
  const actionLabels: Record<DocumentsManagementAuditEvent["action"], string> =
    {
      archive: "Archived",
      expire: "Expired",
      reject: "Rejected",
      register: "Registered",
      update: "Updated",
      verify: "Verified",
    };

  return `${actionLabels[action]} ${title}${versionNumber ? ` v${versionNumber}` : ""}`;
};

const persistVersionedDocumentRevision = (input: {
  action: DocumentsManagementAuditEvent["action"];
  context?: DocumentsManagementPolicyContext;
  metadata: Record<string, unknown>;
  nextDocumentBase: DocumentsManagementDocument;
}): DocumentsManagementDocument => {
  const currentVersion =
    resolveCurrentDocumentsManagementDocumentVersion(
      input.nextDocumentBase,
      input.context
    ) ??
    seedDocumentsManagementDocumentVersion(
      input.nextDocumentBase,
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
  upsertDocumentsManagementRepositoryDocumentVersion(
    nextVersion,
    input.context
  );
  upsertDocumentsManagementRepositoryDocument(nextDocument, input.context);
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

  return nextDocument;
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
    storagePath: normalizeNullableString(input.storagePath),
    sourceDocumentId: normalizeNullableString(input.sourceDocumentId),
    sourceDocumentNumber: normalizeNullableString(input.sourceDocumentNumber),
    sourceNotes: normalizeNullableString(input.sourceNotes),
  };
};

const buildAuditEvent = (input: {
  action: DocumentsManagementAuditEvent["action"];
  context?: DocumentsManagementPolicyContext;
  document: DocumentsManagementDocument;
  metadata: Record<string, unknown>;
  version?: DocumentsManagementDocumentVersion;
}): DocumentsManagementAuditEvent =>
  documentsManagementAuditEventSchema.parse({
    id: randomUUID(),
    companyId: normalizeScopeValue(input.context?.companyId),
    tenantId: normalizeScopeValue(input.context?.tenantId),
    actorId: normalizeDocumentsManagementActorId(input.context),
    action: input.action,
    documentId: input.document.id,
    employeeId: input.document.employeeId,
    documentCategory: input.document.documentCategory,
    documentType: input.document.documentType,
    status: input.document.status,
    title: input.document.title,
    summary: buildAuditSummary(
      input.action,
      input.document.title,
      input.version?.versionNumber
    ),
    metadata: buildDocumentsManagementAuditMetadata(input.metadata),
    createdAt: new Date(),
  });

const buildRegisteredDocument = (
  input: RegisterDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementDocument =>
  documentsManagementDocumentSchema.parse({
    acknowledgment: null,
    archivedAt: undefined,
    companyId: normalizeScopeValue(context?.companyId),
    createdAt: new Date(),
    currentVersionId: undefined,
    currentVersionNumber: undefined,
    description: normalizeNullableString(input.description),
    documentCategory: input.documentCategory,
    documentType: input.documentType,
    employeeId: input.employeeId.trim(),
    expiresAt: normalizeOptionalDate(input.expiresAt),
    id: randomUUID(),
    issuedAt: normalizeOptionalDate(input.issuedAt),
    legalEntityCode: normalizeNullableString(input.legalEntityCode),
    mandatory: input.mandatory ?? false,
    reference: createDocumentReference(input.reference),
    rejectedAt: undefined,
    rejectionReason: undefined,
    retention: input.retention ?? DEFAULT_RETENTION,
    renewalDueAt: normalizeOptionalDate(input.renewalDueAt),
    status: input.status ?? "draft",
    title: input.title.trim(),
    updatedAt: new Date(),
    versionCount: 0,
    visibility: input.visibility ?? "internal",
    verifiedAt: undefined,
  });

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

export function registerDocumentsManagementDocument(
  input: RegisterDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementDocument {
  return runHrSuiteFeatureAction(() => {
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
          status: nextDocument.status,
          visibility: nextDocument.visibility,
          ...buildDocumentVersionMetadata(version),
        },
        version,
      })
    );

    return redactDocumentsManagementDocument(
      nextDocument,
      Boolean(context?.canViewSensitive)
    );
  }, context);
}

export function updateDocumentsManagementDocument(
  input: UpdateDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementDocument {
  return runHrSuiteFeatureAction(() => {
    const currentDocument = getDocumentsManagementRepositoryDocument(
      input.id,
      context
    );

    if (!currentDocument) {
      throw new Error("Document not found");
    }

    const nextDocumentBase = buildUpdatedDocument(currentDocument, input);
    const nextDocument = persistVersionedDocumentRevision({
      action: "update",
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

export function verifyDocumentsManagementDocument(
  input: VerifyDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementDocument {
  return runHrSuiteFeatureAction(() => {
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
    const nextDocument = persistVersionedDocumentRevision({
      action: "verify",
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

export function rejectDocumentsManagementDocument(
  input: RejectDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementDocument {
  return runHrSuiteFeatureAction(() => {
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
    const nextDocument = persistVersionedDocumentRevision({
      action: "reject",
      context,
      metadata: {
        ...buildDocumentLifecycleMetadata(nextDocumentBase),
        rejectedAt:
          nextDocumentBase.rejectedAt ?? input.rejectedAt ?? new Date(),
      },
      nextDocumentBase,
    });

    return redactDocumentsManagementDocument(
      nextDocument,
      Boolean(context?.canViewSensitive)
    );
  }, context);
}

export function expireDocumentsManagementDocument(
  input: ExpireDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementDocument {
  return runHrSuiteFeatureAction(() => {
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
    const nextDocument = persistVersionedDocumentRevision({
      action: "expire",
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

export function archiveDocumentsManagementDocument(
  input: ArchiveDocumentsManagementDocumentInput,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementDocument {
  return runHrSuiteFeatureAction(() => {
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
    const nextDocument = persistVersionedDocumentRevision({
      action: "archive",
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

export function updateDocumentsManagementDocumentRetention(
  input: UpdateDocumentsManagementRetentionInput,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementDocument {
  return runHrSuiteFeatureAction(() => {
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
    const nextDocument = persistVersionedDocumentRevision({
      action: "update",
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
  if (!canReadDocumentsManagement(context)) {
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
