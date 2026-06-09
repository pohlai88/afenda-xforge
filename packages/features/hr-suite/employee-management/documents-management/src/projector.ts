import "server-only";

import type {
  DocumentsManagementDocument,
  DocumentsManagementDocumentExpiringProjection,
  DocumentsManagementDocumentReadinessProjection,
  DocumentsManagementDocumentSummaryProjection,
} from "./contracts/index.ts";
import {
  documentsManagementDocumentExpiringProjectionSchema,
  documentsManagementDocumentReadinessProjectionSchema,
  documentsManagementDocumentSummaryProjectionSchema,
} from "./contracts/index.ts";

const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;

const normalizeDate = (value?: Date | null): Date | null => value ?? null;

const toDaysUntilExpiry = (expiresAt: Date, now: Date): number =>
  Math.ceil((expiresAt.getTime() - now.getTime()) / MILLIS_PER_DAY);

export function projectDocumentsManagementDocumentSummary(
  document: DocumentsManagementDocument
): DocumentsManagementDocumentSummaryProjection {
  return documentsManagementDocumentSummaryProjectionSchema.parse({
    companyId: document.companyId,
    currentVersionNumber: document.currentVersionNumber,
    documentCategory: document.documentCategory,
    documentType: document.documentType,
    employeeId: document.employeeId,
    expiresAt: document.expiresAt,
    id: document.id,
    issuedAt: document.issuedAt,
    mandatory: document.mandatory,
    renewalDueAt: document.renewalDueAt,
    status: document.status,
    title: document.title,
    updatedAt: document.updatedAt,
    visibility: document.visibility,
  });
}

export function projectDocumentsManagementDocumentReadiness(
  employeeId: string,
  documents: readonly DocumentsManagementDocument[]
): DocumentsManagementDocumentReadinessProjection {
  const sortedDocuments = [...documents].sort(
    (leftDocument, rightDocument) =>
      rightDocument.updatedAt.getTime() - leftDocument.updatedAt.getTime() ||
      leftDocument.id.localeCompare(rightDocument.id)
  );
  const mandatoryDocuments = sortedDocuments.filter(
    (document) => document.mandatory
  );
  const verifiedDocumentCount = sortedDocuments.filter(
    (document) => document.status === "verified"
  ).length;
  const pendingVerificationDocumentCount = sortedDocuments.filter(
    (document) => document.status === "pending_verification"
  ).length;
  const rejectedDocumentCount = sortedDocuments.filter(
    (document) => document.status === "rejected"
  ).length;
  const expiredDocumentCount = sortedDocuments.filter(
    (document) => document.status === "expired"
  ).length;
  const archivedDocumentCount = sortedDocuments.filter(
    (document) => document.status === "archived"
  ).length;
  const missingMandatoryDocumentCount = mandatoryDocuments.filter(
    (document) => document.status !== "verified"
  ).length;
  const updatedAt = sortedDocuments[0]?.updatedAt ?? new Date(0);

  return documentsManagementDocumentReadinessProjectionSchema.parse({
    archivedDocumentCount,
    companyId: sortedDocuments[0]?.companyId ?? null,
    documentCount: sortedDocuments.length,
    employeeId,
    expiredDocumentCount,
    mandatoryDocumentCount: mandatoryDocuments.length,
    missingMandatoryDocumentCount,
    pendingVerificationDocumentCount,
    rejectedDocumentCount,
    ready: missingMandatoryDocumentCount === 0,
    updatedAt,
    verifiedDocumentCount,
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
