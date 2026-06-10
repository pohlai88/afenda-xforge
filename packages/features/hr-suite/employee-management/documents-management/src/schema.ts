import { z } from "zod";

const normalizeSnakeCaseEnumValue = (value: unknown): unknown =>
  typeof value === "string" ? value.replaceAll("-", "_") : value;

const isoDateSchema = z.preprocess((value: unknown) => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  }

  return value;
}, z.date());

export const optionalIsoDateSchema = isoDateSchema.nullish();
export const trimmedStringSchema = z.string().trim().min(1);
export const optionalTrimmedStringSchema = z.string().trim().min(1).nullish();
export const trimmedNullableStringSchema = z.string().trim().min(1).nullable();

export const documentsManagementDocumentCategoryValues = [
  "employment",
  "identity",
  "qualification",
  "payroll",
  "policy",
  "hr_letter",
  "medical_leave",
  "compliance",
  "training",
  "other",
] as const;

export const documentsManagementDocumentTypeValues = [
  "offer_letter",
  "appointment_letter",
  "employment_contract",
  "contract_renewal_letter",
  "nric",
  "passport",
  "work_permit",
  "visa",
  "national_id",
  "degree_certificate",
  "professional_certificate",
  "license",
  "training_certificate",
  "bank_form",
  "tax_form",
  "statutory_registration_form",
  "payroll_declaration_reference",
  "employee_handbook_acknowledgment",
  "code_of_conduct_acknowledgment",
  "it_policy_acknowledgment",
  "safety_policy_acknowledgment",
  "confirmation_letter",
  "promotion_letter",
  "transfer_letter",
  "warning_letter",
  "disciplinary_letter",
  "medical_certificate",
  "fitness_certificate",
  "hospitalization_document",
  "maternity_document",
  "consent_form",
  "statutory_declaration",
  "right_to_work_document",
  "regulatory_form",
  "other",
] as const;

export const documentsManagementDocumentStatusValues = [
  "draft",
  "pending_verification",
  "verified",
  "rejected",
  "expired",
  "archived",
] as const;

export const documentsManagementDocumentVisibilityValues = [
  "internal",
  "restricted",
  "confidential",
] as const;

export const documentsManagementDocumentVersionStateValues = [
  "current",
  "superseded",
  "replaced",
  "archived",
] as const;

export const documentsManagementRetentionActionValues = [
  "retain",
  "archive",
  "delete",
  "anonymize",
] as const;

export const documentsManagementAcknowledgmentMethodValues = [
  "portal",
  "email",
  "manual",
  "digital_signature",
  "wet_signature",
] as const;

export const documentsManagementObligationTypeValues = [
  "document",
  "policy_acknowledgment",
] as const;

export const documentsManagementObligationStatusValues = [
  "pending",
  "satisfied",
  "expired",
  "waived",
] as const;

export const documentsManagementAcknowledgmentStatusValues = [
  "pending",
  "acknowledged",
] as const;

export const documentsManagementDocumentCategorySchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(documentsManagementDocumentCategoryValues)
);

export const documentsManagementDocumentTypeSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(documentsManagementDocumentTypeValues)
);

export const documentsManagementDocumentStatusSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(documentsManagementDocumentStatusValues)
);

export const documentsManagementDocumentVisibilitySchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(documentsManagementDocumentVisibilityValues)
);

export const documentsManagementDocumentVersionStateSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(documentsManagementDocumentVersionStateValues)
);

export const documentsManagementRetentionActionSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(documentsManagementRetentionActionValues)
);

export const documentsManagementAcknowledgmentMethodSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(documentsManagementAcknowledgmentMethodValues)
);

export const documentsManagementObligationTypeSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(documentsManagementObligationTypeValues)
);

export const documentsManagementObligationStatusSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(documentsManagementObligationStatusValues)
);

export const documentsManagementAcknowledgmentStatusSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(documentsManagementAcknowledgmentStatusValues)
);

export const documentsManagementDocumentReferenceSchema = z.object({
  contentType: optionalTrimmedStringSchema,
  fileName: optionalTrimmedStringSchema,
  sizeBytes: z.number().int().nonnegative().nullish(),
  storagePath: optionalTrimmedStringSchema,
  sourceDocumentId: optionalTrimmedStringSchema,
  sourceDocumentNumber: optionalTrimmedStringSchema,
  sourceNotes: z.string().trim().nullable().optional(),
});

export const documentsManagementRetentionSchema = z.object({
  retentionPeriodDays: z.number().int().positive().nullable().optional(),
  action: documentsManagementRetentionActionSchema,
  archiveAfterEmployeeSeparation: z.boolean(),
  anonymizeBeforeDeletion: z.boolean(),
});

export const documentsManagementDocumentVersionSchema = z.object({
  contentType: optionalTrimmedStringSchema,
  createdAt: isoDateSchema,
  documentId: trimmedStringSchema,
  fileName: optionalTrimmedStringSchema,
  id: trimmedStringSchema,
  isLatest: z.boolean(),
  previousVersionId: optionalTrimmedStringSchema,
  replacedByVersionId: optionalTrimmedStringSchema,
  sizeBytes: z.number().int().nonnegative().nullish(),
  sourceDocumentId: optionalTrimmedStringSchema,
  sourceDocumentNumber: optionalTrimmedStringSchema,
  sourceNotes: z.string().trim().nullable().optional(),
  state: documentsManagementDocumentVersionStateSchema,
  storagePath: optionalTrimmedStringSchema,
  updatedAt: isoDateSchema,
  versionNumber: z.number().int().positive(),
});

export const documentsManagementAcknowledgmentSchema = z.object({
  acknowledgmentMethod: documentsManagementAcknowledgmentMethodSchema,
  acknowledgedAt: isoDateSchema,
  acknowledgedBy: trimmedStringSchema,
  documentId: optionalTrimmedStringSchema,
  id: trimmedStringSchema,
  note: z.string().trim().nullable().optional(),
  obligationId: optionalTrimmedStringSchema,
  policyId: trimmedStringSchema,
  policyVersion: trimmedStringSchema,
});

export const documentsManagementDocumentObligationSchema = z.object({
  acknowledgmentId: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  createdAt: isoDateSchema,
  description: z.string().trim().nullable().optional(),
  documentCategory: documentsManagementDocumentCategorySchema,
  documentType: documentsManagementDocumentTypeSchema,
  dueAt: optionalIsoDateSchema,
  employeeId: trimmedStringSchema,
  evidenceDocumentId: optionalTrimmedStringSchema,
  expiresAt: optionalIsoDateSchema,
  fulfilledAt: optionalIsoDateSchema,
  id: trimmedStringSchema,
  jurisdictionCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  mandatory: z.boolean(),
  obligationType: documentsManagementObligationTypeSchema,
  policyId: optionalTrimmedStringSchema,
  policyVersion: optionalTrimmedStringSchema,
  retention: documentsManagementRetentionSchema.optional(),
  source: optionalTrimmedStringSchema,
  status: documentsManagementObligationStatusSchema,
  title: trimmedStringSchema,
  updatedAt: isoDateSchema,
  waivedAt: optionalIsoDateSchema,
});

export const documentsManagementAuditActionValues = [
  "register",
  "update",
  "verify",
  "reject",
  "expire",
  "archive",
  "acknowledge",
  "anonymize",
  "delete",
  "retain",
] as const;

export const documentsManagementAuditActionSchema = z.enum(
  documentsManagementAuditActionValues
);

export const documentsManagementAuditEventSchema = z.object({
  action: documentsManagementAuditActionSchema,
  actorId: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  createdAt: isoDateSchema,
  documentCategory: documentsManagementDocumentCategorySchema,
  documentId: trimmedStringSchema,
  documentType: documentsManagementDocumentTypeSchema,
  employeeId: trimmedStringSchema,
  id: trimmedStringSchema,
  metadata: z.record(z.string(), z.unknown()).default({}),
  status: documentsManagementDocumentStatusSchema,
  summary: trimmedStringSchema,
  tenantId: optionalTrimmedStringSchema,
  title: trimmedStringSchema,
});

export const documentsManagementDocumentSchema = z.object({
  acknowledgment: documentsManagementAcknowledgmentSchema.nullish(),
  anonymizedAt: optionalIsoDateSchema,
  archivedAt: optionalIsoDateSchema,
  companyId: optionalTrimmedStringSchema,
  createdAt: isoDateSchema,
  currentVersionId: optionalTrimmedStringSchema,
  currentVersionNumber: z.number().int().positive().nullable().optional(),
  deletedAt: optionalIsoDateSchema,
  deletedReason: z.string().trim().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  documentCategory: documentsManagementDocumentCategorySchema,
  documentType: documentsManagementDocumentTypeSchema,
  employeeId: trimmedStringSchema,
  expiresAt: optionalIsoDateSchema,
  id: trimmedStringSchema,
  issuedAt: optionalIsoDateSchema,
  jurisdictionCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  mandatory: z.boolean(),
  reference: documentsManagementDocumentReferenceSchema,
  rejectedAt: optionalIsoDateSchema,
  rejectionReason: z.string().trim().nullable().optional(),
  retention: documentsManagementRetentionSchema,
  renewalDueAt: optionalIsoDateSchema,
  status: documentsManagementDocumentStatusSchema,
  title: trimmedStringSchema,
  updatedAt: isoDateSchema,
  uploadedAt: optionalIsoDateSchema,
  verifiedAt: optionalIsoDateSchema,
  versionCount: z.number().int().nonnegative(),
  visibility: documentsManagementDocumentVisibilitySchema,
});

export const documentsManagementDocumentSummarySchema = z.object({
  acknowledgmentStatus: documentsManagementAcknowledgmentStatusSchema
    .nullish()
    .default(null),
  companyId: optionalTrimmedStringSchema,
  currentVersionNumber: z.number().int().positive().nullable().optional(),
  documentCategory: documentsManagementDocumentCategorySchema,
  documentType: documentsManagementDocumentTypeSchema,
  employeeId: trimmedStringSchema,
  expiresAt: optionalIsoDateSchema,
  id: trimmedStringSchema,
  issuedAt: optionalIsoDateSchema,
  jurisdictionCode: optionalTrimmedStringSchema,
  mandatory: z.boolean(),
  renewalDueAt: optionalIsoDateSchema,
  status: documentsManagementDocumentStatusSchema,
  title: trimmedStringSchema,
  updatedAt: isoDateSchema,
  uploadedAt: optionalIsoDateSchema,
  visibility: documentsManagementDocumentVisibilitySchema,
});

const listQueryBaseSchema = z.object({
  companyId: z.string().trim().min(1).optional(),
  employeeId: z.string().trim().min(1).optional(),
  legalEntityCode: z.string().trim().min(1).optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  search: z.string().trim().optional(),
});

export const documentsManagementDocumentQuerySchema =
  listQueryBaseSchema.extend({
    acknowledgmentStatus:
      documentsManagementAcknowledgmentStatusSchema.optional(),
    documentCategory: documentsManagementDocumentCategorySchema.optional(),
    documentType: documentsManagementDocumentTypeSchema.optional(),
    expiresAfter: optionalIsoDateSchema,
    expiresBefore: optionalIsoDateSchema,
    issuedAfter: optionalIsoDateSchema,
    issuedBefore: optionalIsoDateSchema,
    jurisdictionCode: z.string().trim().min(1).optional(),
    mandatory: z.boolean().optional(),
    obligationStatus: documentsManagementObligationStatusSchema.optional(),
    requiresAttention: z.boolean().optional(),
    status: documentsManagementDocumentStatusSchema.optional(),
    uploadedAtAfter: optionalIsoDateSchema,
    uploadedAtBefore: optionalIsoDateSchema,
    verified: z.boolean().optional(),
    visibility: documentsManagementDocumentVisibilitySchema.optional(),
  });

export const documentsManagementReadContextSchema = z.object({
  actorEmployeeId: z.string().trim().min(1).optional(),
  actorId: z.string().trim().min(1).optional(),
  canAdminRetention: z.boolean().optional(),
  canDownload: z.boolean().optional(),
  canRead: z.boolean().optional(),
  canReadAudit: z.boolean().optional(),
  canSelfAcknowledge: z.boolean().optional(),
  canViewSensitive: z.boolean().optional(),
  companyId: z.string().trim().min(1).optional(),
  grantedCapabilities: z.array(trimmedStringSchema).optional(),
  organizationId: z.string().trim().min(1).optional(),
  requestId: z.string().trim().min(1).optional(),
  tenantId: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
});

export const documentsManagementWriteContextSchema = z.object({
  actorEmployeeId: z.string().trim().min(1).optional(),
  actorId: z.string().trim().min(1).optional(),
  canAdminRetention: z.boolean().optional(),
  canDownload: z.boolean().optional(),
  canRead: z.boolean().optional(),
  canReadAudit: z.boolean().optional(),
  canSelfAcknowledge: z.boolean().optional(),
  canViewSensitive: z.boolean().optional(),
  canWrite: z.boolean().optional(),
  companyId: z.string().trim().min(1).optional(),
  organizationId: z.string().trim().min(1).optional(),
  requestId: z.string().trim().min(1).optional(),
  tenantId: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
});

export type DocumentsManagementAcknowledgment = z.infer<
  typeof documentsManagementAcknowledgmentSchema
>;
export type DocumentsManagementAcknowledgmentMethod = z.infer<
  typeof documentsManagementAcknowledgmentMethodSchema
>;
export type DocumentsManagementAcknowledgmentStatus = z.infer<
  typeof documentsManagementAcknowledgmentStatusSchema
>;
export type DocumentsManagementAuditAction = z.infer<
  typeof documentsManagementAuditActionSchema
>;
export type DocumentsManagementAuditEvent = z.infer<
  typeof documentsManagementAuditEventSchema
>;
export type DocumentsManagementDocument = z.infer<
  typeof documentsManagementDocumentSchema
>;
export type DocumentsManagementDocumentCategory = z.infer<
  typeof documentsManagementDocumentCategorySchema
>;
export type DocumentsManagementDocumentObligation = z.infer<
  typeof documentsManagementDocumentObligationSchema
>;
export type DocumentsManagementDocumentQuery = z.infer<
  typeof documentsManagementDocumentQuerySchema
>;
export type DocumentsManagementDocumentReference = z.infer<
  typeof documentsManagementDocumentReferenceSchema
>;
export type DocumentsManagementDocumentStatus = z.infer<
  typeof documentsManagementDocumentStatusSchema
>;
export type DocumentsManagementDocumentSummary = z.infer<
  typeof documentsManagementDocumentSummarySchema
>;
export type DocumentsManagementDocumentType = z.infer<
  typeof documentsManagementDocumentTypeSchema
>;
export type DocumentsManagementDocumentVersion = z.infer<
  typeof documentsManagementDocumentVersionSchema
>;
export type DocumentsManagementDocumentVersionState = z.infer<
  typeof documentsManagementDocumentVersionStateSchema
>;
export type DocumentsManagementDocumentVisibility = z.infer<
  typeof documentsManagementDocumentVisibilitySchema
>;
export type DocumentsManagementObligationStatus = z.infer<
  typeof documentsManagementObligationStatusSchema
>;
export type DocumentsManagementObligationType = z.infer<
  typeof documentsManagementObligationTypeSchema
>;
export type DocumentsManagementReadContext = z.infer<
  typeof documentsManagementReadContextSchema
>;
export type DocumentsManagementRetention = z.infer<
  typeof documentsManagementRetentionSchema
>;
export type DocumentsManagementRetentionAction = z.infer<
  typeof documentsManagementRetentionActionSchema
>;
export type DocumentsManagementWriteContext = z.infer<
  typeof documentsManagementWriteContextSchema
>;
