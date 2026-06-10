import { z } from "zod";

import {
  documentsManagementAcknowledgmentStatusSchema,
  documentsManagementDocumentObligationSchema,
  documentsManagementDocumentSchema,
  documentsManagementDocumentSummarySchema,
  documentsManagementObligationStatusSchema,
  trimmedStringSchema,
} from "./schema.ts";

export const documentsManagementStatusValues: readonly [
  DocumentsManagementStatus,
  DocumentsManagementStatus,
  DocumentsManagementStatus,
] = ["draft", "active", "archived"];

export type DocumentsManagementStatus = "draft" | "active" | "archived";

export const documentsManagementStatusSchema: z.ZodType<DocumentsManagementStatus> =
  z.enum(
    documentsManagementStatusValues as [
      DocumentsManagementStatus,
      DocumentsManagementStatus,
      DocumentsManagementStatus,
    ]
  );

export type DocumentsManagementRecordProjection = {
  id: string;
  name: string;
  status: DocumentsManagementStatus;
};

export const documentsManagementRecordProjectionSchema: z.ZodType<DocumentsManagementRecordProjection> =
  z.object({
    id: trimmedStringSchema,
    name: trimmedStringSchema,
    status: documentsManagementStatusSchema,
  });

export type DocumentsManagementRecord = DocumentsManagementRecordProjection;

export const documentsManagementDocumentProjectionSchema: typeof documentsManagementDocumentSchema =
  documentsManagementDocumentSchema;

export type DocumentsManagementDocumentProjection = z.infer<
  typeof documentsManagementDocumentProjectionSchema
>;

export const documentsManagementDocumentSummaryProjectionSchema: typeof documentsManagementDocumentSummarySchema =
  documentsManagementDocumentSummarySchema;

export type DocumentsManagementDocumentSummaryProjection = z.infer<
  typeof documentsManagementDocumentSummaryProjectionSchema
>;

export const documentsManagementDocumentObligationProjectionSchema: typeof documentsManagementDocumentObligationSchema =
  documentsManagementDocumentObligationSchema;

export type DocumentsManagementDocumentObligationProjection = z.infer<
  typeof documentsManagementDocumentObligationProjectionSchema
>;

export const documentsManagementDocumentReadinessProjectionSchema = z.object({
  archivedDocumentCount: z.number().int().nonnegative(),
  companyId: trimmedStringSchema.nullish(),
  documentCount: z.number().int().nonnegative(),
  employeeId: trimmedStringSchema,
  expiredDocumentCount: z.number().int().nonnegative(),
  mandatoryDocumentCount: z.number().int().nonnegative(),
  missingMandatoryDocumentCount: z.number().int().nonnegative(),
  obligationCount: z.number().int().nonnegative(),
  pendingAcknowledgmentCount: z.number().int().nonnegative(),
  pendingVerificationDocumentCount: z.number().int().nonnegative(),
  ready: z.boolean(),
  rejectedDocumentCount: z.number().int().nonnegative(),
  satisfiedObligationCount: z.number().int().nonnegative(),
  updatedAt: z.date(),
  verifiedDocumentCount: z.number().int().nonnegative(),
});

export type DocumentsManagementDocumentReadinessProjection = z.infer<
  typeof documentsManagementDocumentReadinessProjectionSchema
>;

export const documentsManagementDocumentExpiringProjectionSchema = z.object({
  companyId: trimmedStringSchema.nullish(),
  daysUntilExpiry: z.number().int(),
  documentCategory:
    documentsManagementDocumentSummarySchema.shape.documentCategory,
  documentType: documentsManagementDocumentSummarySchema.shape.documentType,
  employeeId: trimmedStringSchema,
  expiresAt: documentsManagementDocumentSummarySchema.shape.expiresAt,
  id: trimmedStringSchema,
  isExpired: z.boolean(),
  isExpiringSoon: z.boolean(),
  mandatory: z.boolean(),
  renewalDueAt: documentsManagementDocumentSummarySchema.shape.renewalDueAt,
  status: documentsManagementDocumentSummarySchema.shape.status,
  title: documentsManagementDocumentSummarySchema.shape.title,
  updatedAt: documentsManagementDocumentSummarySchema.shape.updatedAt,
  visibility: documentsManagementDocumentSummarySchema.shape.visibility,
});

export type DocumentsManagementDocumentExpiringProjection = z.infer<
  typeof documentsManagementDocumentExpiringProjectionSchema
>;

export const documentsManagementPolicyAcknowledgmentSummaryProjectionSchema =
  z.object({
    acknowledgmentStatus: documentsManagementAcknowledgmentStatusSchema,
    companyId: trimmedStringSchema.nullish(),
    employeeId: trimmedStringSchema,
    id: trimmedStringSchema,
    obligationId: trimmedStringSchema,
    policyId: trimmedStringSchema,
    policyVersion: trimmedStringSchema,
    title: trimmedStringSchema,
    updatedAt: z.date(),
  });

export type DocumentsManagementPolicyAcknowledgmentSummaryProjection = z.infer<
  typeof documentsManagementPolicyAcknowledgmentSummaryProjectionSchema
>;

export const documentsManagementMissingRequirementProjectionSchema = z.object({
  companyId: trimmedStringSchema.nullish(),
  dueAt: z.date().nullish(),
  employeeId: trimmedStringSchema,
  id: trimmedStringSchema,
  jurisdictionCode: trimmedStringSchema.nullish(),
  legalEntityCode: trimmedStringSchema.nullish(),
  mandatory: z.boolean(),
  obligationStatus: documentsManagementObligationStatusSchema,
  obligationType:
    documentsManagementDocumentObligationSchema.shape.obligationType,
  title: trimmedStringSchema,
  updatedAt: z.date(),
});

export type DocumentsManagementMissingRequirementProjection = z.infer<
  typeof documentsManagementMissingRequirementProjectionSchema
>;

export const documentsManagementRetentionCandidateProjectionSchema = z.object({
  anonymizeBeforeDeletion: z.boolean(),
  companyId: trimmedStringSchema.nullish(),
  documentId: trimmedStringSchema,
  employeeId: trimmedStringSchema,
  retentionAction:
    documentsManagementDocumentSchema.shape.retention.shape.action,
  retentionDueAt: z.date(),
  title: trimmedStringSchema,
});

export type DocumentsManagementRetentionCandidateProjection = z.infer<
  typeof documentsManagementRetentionCandidateProjectionSchema
>;

export const documentsManagementDownstreamReadinessProjectionSchema = z.object({
  companyId: trimmedStringSchema.nullish(),
  employeeId: trimmedStringSchema,
  expiredEvidenceCount: z.number().int().nonnegative(),
  missingObligationCount: z.number().int().nonnegative(),
  pendingAcknowledgmentCount: z.number().int().nonnegative(),
  ready: z.boolean(),
  updatedAt: z.date(),
});

export type DocumentsManagementDownstreamReadinessProjection = z.infer<
  typeof documentsManagementDownstreamReadinessProjectionSchema
>;

export const documentsManagementAlertReadyProjectionSchema = z.object({
  employeeId: trimmedStringSchema,
  id: trimmedStringSchema,
  kind: z.enum(["document_expiring", "document_missing", "policy_pending"]),
  message: trimmedStringSchema,
  obligationId: trimmedStringSchema.nullish(),
  severity: z.enum(["low", "medium", "high"]),
  status: z.enum(["open", "resolved"]),
});

export type DocumentsManagementAlertReadyProjection = z.infer<
  typeof documentsManagementAlertReadyProjectionSchema
>;
