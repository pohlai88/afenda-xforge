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
  id: trimmedStringSchema,
  documentId: trimmedStringSchema,
  fileName: optionalTrimmedStringSchema,
  sizeBytes: z.number().int().nonnegative().nullish(),
  versionNumber: z.number().int().positive(),
  state: documentsManagementDocumentVersionStateSchema,
  storagePath: optionalTrimmedStringSchema,
  sourceDocumentId: optionalTrimmedStringSchema,
  sourceDocumentNumber: optionalTrimmedStringSchema,
  sourceNotes: z.string().trim().nullable().optional(),
  previousVersionId: optionalTrimmedStringSchema,
  replacedByVersionId: optionalTrimmedStringSchema,
  isLatest: z.boolean(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const documentsManagementAcknowledgmentSchema = z.object({
  id: trimmedStringSchema,
  documentId: trimmedStringSchema,
  policyId: trimmedStringSchema,
  policyVersion: trimmedStringSchema,
  acknowledgedBy: trimmedStringSchema,
  acknowledgmentMethod: documentsManagementAcknowledgmentMethodSchema,
  acknowledgedAt: isoDateSchema,
  note: z.string().trim().nullable().optional(),
});

export const documentsManagementAuditActionValues = [
  "register",
  "update",
  "verify",
  "reject",
  "expire",
  "archive",
] as const;

export const documentsManagementAuditActionSchema = z.enum(
  documentsManagementAuditActionValues
);

export const documentsManagementAuditEventSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  tenantId: optionalTrimmedStringSchema,
  actorId: trimmedStringSchema,
  action: documentsManagementAuditActionSchema,
  documentId: trimmedStringSchema,
  employeeId: trimmedStringSchema,
  documentCategory: documentsManagementDocumentCategorySchema,
  documentType: documentsManagementDocumentTypeSchema,
  status: documentsManagementDocumentStatusSchema,
  title: trimmedStringSchema,
  summary: trimmedStringSchema,
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: isoDateSchema,
});

export const documentsManagementDocumentSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  documentCategory: documentsManagementDocumentCategorySchema,
  documentType: documentsManagementDocumentTypeSchema,
  title: trimmedStringSchema,
  description: z.string().trim().nullable().optional(),
  status: documentsManagementDocumentStatusSchema,
  visibility: documentsManagementDocumentVisibilitySchema,
  mandatory: z.boolean(),
  currentVersionId: optionalTrimmedStringSchema,
  currentVersionNumber: z.number().int().positive().nullable().optional(),
  versionCount: z.number().int().nonnegative(),
  reference: documentsManagementDocumentReferenceSchema,
  issuedAt: optionalIsoDateSchema,
  expiresAt: optionalIsoDateSchema,
  renewalDueAt: optionalIsoDateSchema,
  verifiedAt: optionalIsoDateSchema,
  rejectedAt: optionalIsoDateSchema,
  rejectionReason: z.string().trim().nullable().optional(),
  archivedAt: optionalIsoDateSchema,
  retention: documentsManagementRetentionSchema,
  acknowledgment: documentsManagementAcknowledgmentSchema.nullish(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const documentsManagementDocumentSummarySchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  documentCategory: documentsManagementDocumentCategorySchema,
  documentType: documentsManagementDocumentTypeSchema,
  title: trimmedStringSchema,
  status: documentsManagementDocumentStatusSchema,
  visibility: documentsManagementDocumentVisibilitySchema,
  mandatory: z.boolean(),
  currentVersionNumber: z.number().int().positive().nullable().optional(),
  expiresAt: optionalIsoDateSchema,
  renewalDueAt: optionalIsoDateSchema,
  issuedAt: optionalIsoDateSchema,
  updatedAt: isoDateSchema,
});

const listQueryBaseSchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  search: z.string().trim().optional(),
  companyId: z.string().trim().min(1).optional(),
  employeeId: z.string().trim().min(1).optional(),
  legalEntityCode: z.string().trim().min(1).optional(),
});

export const documentsManagementDocumentQuerySchema =
  listQueryBaseSchema.extend({
    documentCategory: documentsManagementDocumentCategorySchema.optional(),
    documentType: documentsManagementDocumentTypeSchema.optional(),
    status: documentsManagementDocumentStatusSchema.optional(),
    visibility: documentsManagementDocumentVisibilitySchema.optional(),
    mandatory: z.boolean().optional(),
    verified: z.boolean().optional(),
    expiresBefore: optionalIsoDateSchema,
    expiresAfter: optionalIsoDateSchema,
    issuedBefore: optionalIsoDateSchema,
    issuedAfter: optionalIsoDateSchema,
  });

export const documentsManagementReadContextSchema = z.object({
  canRead: z.boolean().optional(),
  companyId: z.string().trim().min(1).optional(),
  canViewSensitive: z.boolean().optional(),
  grantedCapabilities: z.array(trimmedStringSchema).optional(),
});

export const documentsManagementWriteContextSchema = z.object({
  actorId: z.string().trim().min(1).optional(),
  canRead: z.boolean().optional(),
  companyId: z.string().trim().min(1).optional(),
  organizationId: z.string().trim().min(1).optional(),
  requestId: z.string().trim().min(1).optional(),
  tenantId: z.string().trim().min(1).optional(),
  canWrite: z.boolean().optional(),
  canViewSensitive: z.boolean().optional(),
});

export type DocumentsManagementDocumentCategory = z.infer<
  typeof documentsManagementDocumentCategorySchema
>;
export type DocumentsManagementDocumentType = z.infer<
  typeof documentsManagementDocumentTypeSchema
>;
export type DocumentsManagementDocumentStatus = z.infer<
  typeof documentsManagementDocumentStatusSchema
>;
export type DocumentsManagementDocumentVisibility = z.infer<
  typeof documentsManagementDocumentVisibilitySchema
>;
export type DocumentsManagementDocumentVersionState = z.infer<
  typeof documentsManagementDocumentVersionStateSchema
>;
export type DocumentsManagementRetentionAction = z.infer<
  typeof documentsManagementRetentionActionSchema
>;
export type DocumentsManagementAcknowledgmentMethod = z.infer<
  typeof documentsManagementAcknowledgmentMethodSchema
>;
export type DocumentsManagementDocumentReference = z.infer<
  typeof documentsManagementDocumentReferenceSchema
>;
export type DocumentsManagementRetention = z.infer<
  typeof documentsManagementRetentionSchema
>;
export type DocumentsManagementDocumentVersion = z.infer<
  typeof documentsManagementDocumentVersionSchema
>;
export type DocumentsManagementAcknowledgment = z.infer<
  typeof documentsManagementAcknowledgmentSchema
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
export type DocumentsManagementDocumentSummary = z.infer<
  typeof documentsManagementDocumentSummarySchema
>;
export type DocumentsManagementDocumentQuery = z.infer<
  typeof documentsManagementDocumentQuerySchema
>;
export type DocumentsManagementReadContext = z.infer<
  typeof documentsManagementReadContextSchema
>;
export type DocumentsManagementWriteContext = z.infer<
  typeof documentsManagementWriteContextSchema
>;
