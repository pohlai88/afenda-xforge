import "server-only";

import type {
  DocumentsManagementAlertReadyProjection,
  DocumentsManagementDocument,
  DocumentsManagementDocumentExpiringProjection,
  DocumentsManagementDocumentObligation,
  DocumentsManagementDocumentObligationProjection,
  DocumentsManagementDocumentReadinessProjection,
  DocumentsManagementDocumentSummaryProjection,
  DocumentsManagementDownstreamReadinessProjection,
  DocumentsManagementMissingRequirementProjection,
  DocumentsManagementPolicyAcknowledgmentSummaryProjection,
  DocumentsManagementRetentionCandidateProjection,
} from "./contracts/index.ts";
import {
  documentsManagementAlertReadyProjectionSchema,
  documentsManagementDocumentExpiringProjectionSchema,
  documentsManagementDocumentObligationProjectionSchema,
  documentsManagementDocumentReadinessProjectionSchema,
  documentsManagementDocumentSummaryProjectionSchema,
  documentsManagementDownstreamReadinessProjectionSchema,
  documentsManagementMissingRequirementProjectionSchema,
  documentsManagementPolicyAcknowledgmentSummaryProjectionSchema,
  documentsManagementRetentionCandidateProjectionSchema,
} from "./contracts/index.ts";

const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;

const normalizeDate = (value?: Date | null): Date | null => value ?? null;

const toDaysUntilExpiry = (expiresAt: Date, now: Date): number =>
  Math.ceil((expiresAt.getTime() - now.getTime()) / MILLIS_PER_DAY);

const toAcknowledgmentStatus = (
  document: DocumentsManagementDocument
): DocumentsManagementDocumentSummaryProjection["acknowledgmentStatus"] =>
  document.acknowledgment ? "acknowledged" : null;

export function projectDocumentsManagementDocumentSummary(
  document: DocumentsManagementDocument
): DocumentsManagementDocumentSummaryProjection {
  return documentsManagementDocumentSummaryProjectionSchema.parse({
    acknowledgmentStatus: toAcknowledgmentStatus(document),
    companyId: document.companyId,
    currentVersionNumber: document.currentVersionNumber,
    documentCategory: document.documentCategory,
    documentType: document.documentType,
    employeeId: document.employeeId,
    expiresAt: document.expiresAt,
    id: document.id,
    issuedAt: document.issuedAt,
    jurisdictionCode: document.jurisdictionCode,
    mandatory: document.mandatory,
    renewalDueAt: document.renewalDueAt,
    status: document.status,
    title: document.title,
    updatedAt: document.updatedAt,
    uploadedAt: document.uploadedAt,
    visibility: document.visibility,
  });
}

export function projectDocumentsManagementDocumentObligation(
  obligation: DocumentsManagementDocumentObligation
): DocumentsManagementDocumentObligationProjection {
  return documentsManagementDocumentObligationProjectionSchema.parse(
    obligation
  );
}

export function projectDocumentsManagementDocumentReadiness(
  employeeId: string,
  documents: readonly DocumentsManagementDocument[],
  obligations: readonly DocumentsManagementDocumentObligation[]
): DocumentsManagementDocumentReadinessProjection {
  const sortedDocuments = [...documents].sort(
    (leftDocument, rightDocument) =>
      rightDocument.updatedAt.getTime() - leftDocument.updatedAt.getTime() ||
      leftDocument.id.localeCompare(rightDocument.id)
  );
  const sortedObligations = [...obligations].sort(
    (leftObligation, rightObligation) =>
      rightObligation.updatedAt.getTime() -
        leftObligation.updatedAt.getTime() ||
      leftObligation.id.localeCompare(rightObligation.id)
  );
  const mandatoryObligations = sortedObligations.filter(
    (obligation) => obligation.mandatory
  );
  const mandatoryDocuments = sortedDocuments.filter(
    (document) => document.mandatory
  );
  const missingMandatoryDocumentCount =
    mandatoryObligations.length > 0
      ? mandatoryObligations.filter(
          (obligation) => obligation.status !== "satisfied"
        ).length
      : mandatoryDocuments.filter((document) => document.status !== "verified")
          .length;
  const updatedAt =
    sortedDocuments[0]?.updatedAt ??
    sortedObligations[0]?.updatedAt ??
    new Date(0);

  return documentsManagementDocumentReadinessProjectionSchema.parse({
    archivedDocumentCount: sortedDocuments.filter(
      (document) => document.status === "archived"
    ).length,
    companyId:
      sortedDocuments[0]?.companyId ?? sortedObligations[0]?.companyId ?? null,
    documentCount: sortedDocuments.length,
    employeeId,
    expiredDocumentCount: sortedDocuments.filter(
      (document) => document.status === "expired"
    ).length,
    mandatoryDocumentCount:
      mandatoryObligations.length > 0
        ? mandatoryObligations.length
        : mandatoryDocuments.length,
    missingMandatoryDocumentCount,
    obligationCount: sortedObligations.length,
    pendingAcknowledgmentCount: sortedObligations.filter(
      (obligation) =>
        obligation.obligationType === "policy_acknowledgment" &&
        obligation.status === "pending"
    ).length,
    pendingVerificationDocumentCount: sortedDocuments.filter(
      (document) => document.status === "pending_verification"
    ).length,
    ready: missingMandatoryDocumentCount === 0,
    rejectedDocumentCount: sortedDocuments.filter(
      (document) => document.status === "rejected"
    ).length,
    satisfiedObligationCount: sortedObligations.filter(
      (obligation) => obligation.status === "satisfied"
    ).length,
    updatedAt,
    verifiedDocumentCount: sortedDocuments.filter(
      (document) => document.status === "verified"
    ).length,
  });
}

export function projectDocumentsManagementDocumentExpiring(
  document: DocumentsManagementDocument,
  now: Date = new Date()
): DocumentsManagementDocumentExpiringProjection {
  const expiresAt = document.expiresAt;
  if (!expiresAt) {
    throw new Error("Document does not have an expiry date");
  }

  const daysUntilExpiry = toDaysUntilExpiry(expiresAt, now);
  const isExpired = daysUntilExpiry < 0;

  return documentsManagementDocumentExpiringProjectionSchema.parse({
    companyId: document.companyId,
    daysUntilExpiry,
    documentCategory: document.documentCategory,
    documentType: document.documentType,
    employeeId: document.employeeId,
    expiresAt,
    id: document.id,
    isExpired,
    isExpiringSoon: !isExpired && daysUntilExpiry <= 30,
    mandatory: document.mandatory,
    renewalDueAt: normalizeDate(document.renewalDueAt),
    status: document.status,
    title: document.title,
    updatedAt: document.updatedAt,
    visibility: document.visibility,
  });
}

export function projectDocumentsManagementPolicyAcknowledgmentSummary(
  obligation: DocumentsManagementDocumentObligation
): DocumentsManagementPolicyAcknowledgmentSummaryProjection {
  return documentsManagementPolicyAcknowledgmentSummaryProjectionSchema.parse({
    acknowledgmentStatus:
      obligation.status === "satisfied" ? "acknowledged" : "pending",
    companyId: obligation.companyId,
    employeeId: obligation.employeeId,
    id: obligation.acknowledgmentId ?? obligation.id,
    obligationId: obligation.id,
    policyId: obligation.policyId ?? obligation.id,
    policyVersion: obligation.policyVersion ?? "v1",
    title: obligation.title,
    updatedAt: obligation.updatedAt,
  });
}

export function projectDocumentsManagementMissingRequirement(
  obligation: DocumentsManagementDocumentObligation
): DocumentsManagementMissingRequirementProjection {
  return documentsManagementMissingRequirementProjectionSchema.parse({
    companyId: obligation.companyId,
    dueAt: obligation.dueAt,
    employeeId: obligation.employeeId,
    id: obligation.id,
    jurisdictionCode: obligation.jurisdictionCode,
    legalEntityCode: obligation.legalEntityCode,
    mandatory: obligation.mandatory,
    obligationStatus: obligation.status,
    obligationType: obligation.obligationType,
    title: obligation.title,
    updatedAt: obligation.updatedAt,
  });
}

export function projectDocumentsManagementRetentionCandidate(
  document: DocumentsManagementDocument,
  retentionDueAt: Date
): DocumentsManagementRetentionCandidateProjection {
  return documentsManagementRetentionCandidateProjectionSchema.parse({
    anonymizeBeforeDeletion: document.retention.anonymizeBeforeDeletion,
    companyId: document.companyId,
    documentId: document.id,
    employeeId: document.employeeId,
    retentionAction: document.retention.action,
    retentionDueAt,
    title: document.title,
  });
}

export function projectDocumentsManagementDownstreamReadiness(
  readiness: DocumentsManagementDocumentReadinessProjection
): DocumentsManagementDownstreamReadinessProjection {
  return documentsManagementDownstreamReadinessProjectionSchema.parse({
    companyId: readiness.companyId,
    employeeId: readiness.employeeId,
    expiredEvidenceCount: readiness.expiredDocumentCount,
    missingObligationCount: readiness.missingMandatoryDocumentCount,
    pendingAcknowledgmentCount: readiness.pendingAcknowledgmentCount,
    ready: readiness.ready,
    updatedAt: readiness.updatedAt,
  });
}

export function projectDocumentsManagementAlertReady(
  obligation: DocumentsManagementDocumentObligation
): DocumentsManagementAlertReadyProjection {
  const isPolicy = obligation.obligationType === "policy_acknowledgment";
  let kind: DocumentsManagementAlertReadyProjection["kind"];

  if (isPolicy && obligation.status === "pending") {
    kind = "policy_pending";
  } else if (obligation.status === "expired") {
    kind = "document_expiring";
  } else {
    kind = "document_missing";
  }

  let message: string;
  if (kind === "policy_pending") {
    message = `${obligation.title} requires acknowledgment.`;
  } else if (kind === "document_expiring") {
    message = `${obligation.title} is expired or due for renewal.`;
  } else {
    message = `${obligation.title} is missing.`;
  }

  return documentsManagementAlertReadyProjectionSchema.parse({
    employeeId: obligation.employeeId,
    id: `${kind}:${obligation.id}`,
    kind,
    message,
    obligationId: obligation.id,
    severity: obligation.mandatory ? "high" : "medium",
    status: obligation.status === "satisfied" ? "resolved" : "open",
  });
}
