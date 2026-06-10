import { z } from "zod";

import {
  documentsManagementAcknowledgmentMethodSchema,
  documentsManagementDocumentCategorySchema,
  documentsManagementDocumentReferenceSchema,
  documentsManagementDocumentStatusSchema,
  documentsManagementDocumentTypeSchema,
  documentsManagementDocumentVisibilitySchema,
  documentsManagementObligationStatusSchema,
  documentsManagementObligationTypeSchema,
  documentsManagementRetentionActionSchema,
  documentsManagementRetentionSchema,
  optionalIsoDateSchema,
  optionalTrimmedStringSchema,
  trimmedStringSchema,
} from "./schema.ts";
import type { DocumentsManagementStatus } from "./projection.contract.ts";
import { documentsManagementStatusSchema } from "./projection.contract.ts";

export type CreateDocumentsManagementInput = {
  name: string;
};

export type UpdateDocumentsManagementInput = {
  id: string;
  name?: string | null;
  status?: DocumentsManagementStatus;
};

export type RegisterDocumentsManagementDocumentInput = {
  description?: string | null;
  documentCategory: z.infer<typeof documentsManagementDocumentCategorySchema>;
  documentType: z.infer<typeof documentsManagementDocumentTypeSchema>;
  employeeId: string;
  expiresAt?: Date | null;
  issuedAt?: Date | null;
  jurisdictionCode?: string | null;
  legalEntityCode?: string | null;
  mandatory?: boolean;
  reference?: z.infer<typeof documentsManagementDocumentReferenceSchema>;
  retention?: z.infer<typeof documentsManagementRetentionSchema>;
  renewalDueAt?: Date | null;
  status?: z.infer<typeof documentsManagementDocumentStatusSchema>;
  title: string;
  visibility?: z.infer<typeof documentsManagementDocumentVisibilitySchema>;
};

export type UpdateDocumentsManagementDocumentInput = {
  description?: string | null;
  documentCategory?: z.infer<typeof documentsManagementDocumentCategorySchema>;
  documentType?: z.infer<typeof documentsManagementDocumentTypeSchema>;
  employeeId?: string;
  expiresAt?: Date | null;
  id: string;
  issuedAt?: Date | null;
  jurisdictionCode?: string | null;
  legalEntityCode?: string | null;
  mandatory?: boolean;
  reference?: z.infer<typeof documentsManagementDocumentReferenceSchema>;
  retention?: z.infer<typeof documentsManagementRetentionSchema>;
  rejectionReason?: string | null;
  renewalDueAt?: Date | null;
  status?: z.infer<typeof documentsManagementDocumentStatusSchema>;
  title?: string | null;
  verifiedAt?: Date | null;
  visibility?: z.infer<typeof documentsManagementDocumentVisibilitySchema>;
};

export type VerifyDocumentsManagementDocumentInput = {
  id: string;
  renewalDueAt?: Date | null;
  verifiedAt?: Date | null;
};

export type RejectDocumentsManagementDocumentInput = {
  id: string;
  rejectionReason: string;
  rejectedAt?: Date | null;
  renewalDueAt?: Date | null;
};

export type ExpireDocumentsManagementDocumentInput = {
  expiredAt?: Date | null;
  id: string;
  renewalDueAt?: Date | null;
};

export type ArchiveDocumentsManagementDocumentInput = {
  archivedAt?: Date | null;
  id: string;
};

export type UpdateDocumentsManagementRetentionInput = {
  id: string;
  retention: z.infer<typeof documentsManagementRetentionSchema>;
};

export type CreateDocumentsManagementDocumentObligationInput = {
  description?: string | null;
  documentCategory: z.infer<typeof documentsManagementDocumentCategorySchema>;
  documentType: z.infer<typeof documentsManagementDocumentTypeSchema>;
  dueAt?: Date | null;
  employeeId: string;
  expiresAt?: Date | null;
  jurisdictionCode?: string | null;
  legalEntityCode?: string | null;
  mandatory?: boolean;
  obligationType?: z.infer<typeof documentsManagementObligationTypeSchema>;
  policyId?: string | null;
  policyVersion?: string | null;
  retention?: z.infer<typeof documentsManagementRetentionSchema>;
  source?: string | null;
  status?: z.infer<typeof documentsManagementObligationStatusSchema>;
  title: string;
};

export type UpdateDocumentsManagementDocumentObligationInput = {
  description?: string | null;
  dueAt?: Date | null;
  expiresAt?: Date | null;
  id: string;
  jurisdictionCode?: string | null;
  legalEntityCode?: string | null;
  mandatory?: boolean;
  policyId?: string | null;
  policyVersion?: string | null;
  retention?: z.infer<typeof documentsManagementRetentionSchema>;
  source?: string | null;
  status?: z.infer<typeof documentsManagementObligationStatusSchema>;
  title?: string | null;
};

export type AssignDocumentsManagementPolicyAcknowledgmentInput = {
  description?: string | null;
  dueAt?: Date | null;
  employeeId: string;
  jurisdictionCode?: string | null;
  legalEntityCode?: string | null;
  mandatory?: boolean;
  policyId: string;
  policyVersion: string;
  retention?: z.infer<typeof documentsManagementRetentionSchema>;
  title: string;
};

export type AcknowledgeDocumentsManagementPolicyInput = {
  acknowledgmentMethod: z.infer<
    typeof documentsManagementAcknowledgmentMethodSchema
  >;
  id: string;
  acknowledgedAt?: Date | null;
  note?: string | null;
};

export type DeleteDocumentsManagementDocumentInput = {
  id: string;
  reason?: string | null;
};

export type AnonymizeDocumentsManagementDocumentInput = {
  id: string;
  reason?: string | null;
};

export type ExecuteDocumentsManagementRetentionInput = {
  action?: z.infer<typeof documentsManagementRetentionActionSchema>;
  documentIds?: readonly string[];
};

export const createDocumentsManagementInputSchema: z.ZodType<CreateDocumentsManagementInput> =
  z.object({
    name: trimmedStringSchema,
  });

export const updateDocumentsManagementInputSchema: z.ZodType<UpdateDocumentsManagementInput> =
  z.object({
    id: trimmedStringSchema,
    name: optionalTrimmedStringSchema,
    status: documentsManagementStatusSchema.optional(),
  });

export const registerDocumentsManagementDocumentInputSchema: z.ZodType<RegisterDocumentsManagementDocumentInput> =
  z.object({
    description: z.string().trim().nullable().optional(),
    documentCategory: documentsManagementDocumentCategorySchema,
    documentType: documentsManagementDocumentTypeSchema,
    employeeId: trimmedStringSchema,
    expiresAt: optionalIsoDateSchema,
    issuedAt: optionalIsoDateSchema,
    jurisdictionCode: optionalTrimmedStringSchema,
    legalEntityCode: optionalTrimmedStringSchema,
    mandatory: z.boolean().optional(),
    reference: documentsManagementDocumentReferenceSchema.optional(),
    retention: documentsManagementRetentionSchema.optional(),
    renewalDueAt: optionalIsoDateSchema,
    status: documentsManagementDocumentStatusSchema.optional(),
    title: trimmedStringSchema,
    visibility: documentsManagementDocumentVisibilitySchema.optional(),
  });

export const updateDocumentsManagementDocumentInputSchema: z.ZodType<UpdateDocumentsManagementDocumentInput> =
  z.object({
    description: z.string().trim().nullable().optional(),
    documentCategory: documentsManagementDocumentCategorySchema.optional(),
    documentType: documentsManagementDocumentTypeSchema.optional(),
    employeeId: trimmedStringSchema.optional(),
    expiresAt: optionalIsoDateSchema,
    id: trimmedStringSchema,
    issuedAt: optionalIsoDateSchema,
    jurisdictionCode: optionalTrimmedStringSchema,
    legalEntityCode: optionalTrimmedStringSchema,
    mandatory: z.boolean().optional(),
    reference: documentsManagementDocumentReferenceSchema.optional(),
    retention: documentsManagementRetentionSchema.optional(),
    rejectionReason: z.string().trim().nullable().optional(),
    renewalDueAt: optionalIsoDateSchema,
    status: documentsManagementDocumentStatusSchema.optional(),
    title: optionalTrimmedStringSchema,
    verifiedAt: optionalIsoDateSchema,
    visibility: documentsManagementDocumentVisibilitySchema.optional(),
  });

export const verifyDocumentsManagementDocumentInputSchema: z.ZodType<VerifyDocumentsManagementDocumentInput> =
  z.object({
    id: trimmedStringSchema,
    renewalDueAt: optionalIsoDateSchema,
    verifiedAt: optionalIsoDateSchema,
  });

export const rejectDocumentsManagementDocumentInputSchema: z.ZodType<RejectDocumentsManagementDocumentInput> =
  z.object({
    id: trimmedStringSchema,
    rejectedAt: optionalIsoDateSchema,
    rejectionReason: trimmedStringSchema,
    renewalDueAt: optionalIsoDateSchema,
  });

export const expireDocumentsManagementDocumentInputSchema: z.ZodType<ExpireDocumentsManagementDocumentInput> =
  z.object({
    expiredAt: optionalIsoDateSchema,
    id: trimmedStringSchema,
    renewalDueAt: optionalIsoDateSchema,
  });

export const archiveDocumentsManagementDocumentInputSchema: z.ZodType<ArchiveDocumentsManagementDocumentInput> =
  z.object({
    archivedAt: optionalIsoDateSchema,
    id: trimmedStringSchema,
  });

export const updateDocumentsManagementRetentionInputSchema: z.ZodType<UpdateDocumentsManagementRetentionInput> =
  z.object({
    id: trimmedStringSchema,
    retention: documentsManagementRetentionSchema,
  });

export const createDocumentsManagementDocumentObligationInputSchema: z.ZodType<CreateDocumentsManagementDocumentObligationInput> =
  z.object({
    description: z.string().trim().nullable().optional(),
    documentCategory: documentsManagementDocumentCategorySchema,
    documentType: documentsManagementDocumentTypeSchema,
    dueAt: optionalIsoDateSchema,
    employeeId: trimmedStringSchema,
    expiresAt: optionalIsoDateSchema,
    jurisdictionCode: optionalTrimmedStringSchema,
    legalEntityCode: optionalTrimmedStringSchema,
    mandatory: z.boolean().optional(),
    obligationType: documentsManagementObligationTypeSchema.optional(),
    policyId: optionalTrimmedStringSchema,
    policyVersion: optionalTrimmedStringSchema,
    retention: documentsManagementRetentionSchema.optional(),
    source: optionalTrimmedStringSchema,
    status: documentsManagementObligationStatusSchema.optional(),
    title: trimmedStringSchema,
  });

export const updateDocumentsManagementDocumentObligationInputSchema: z.ZodType<UpdateDocumentsManagementDocumentObligationInput> =
  z.object({
    description: z.string().trim().nullable().optional(),
    dueAt: optionalIsoDateSchema,
    expiresAt: optionalIsoDateSchema,
    id: trimmedStringSchema,
    jurisdictionCode: optionalTrimmedStringSchema,
    legalEntityCode: optionalTrimmedStringSchema,
    mandatory: z.boolean().optional(),
    policyId: optionalTrimmedStringSchema,
    policyVersion: optionalTrimmedStringSchema,
    retention: documentsManagementRetentionSchema.optional(),
    source: optionalTrimmedStringSchema,
    status: documentsManagementObligationStatusSchema.optional(),
    title: optionalTrimmedStringSchema,
  });

export const assignDocumentsManagementPolicyAcknowledgmentInputSchema: z.ZodType<AssignDocumentsManagementPolicyAcknowledgmentInput> =
  z.object({
    description: z.string().trim().nullable().optional(),
    dueAt: optionalIsoDateSchema,
    employeeId: trimmedStringSchema,
    jurisdictionCode: optionalTrimmedStringSchema,
    legalEntityCode: optionalTrimmedStringSchema,
    mandatory: z.boolean().optional(),
    policyId: trimmedStringSchema,
    policyVersion: trimmedStringSchema,
    retention: documentsManagementRetentionSchema.optional(),
    title: trimmedStringSchema,
  });

export const acknowledgeDocumentsManagementPolicyInputSchema: z.ZodType<AcknowledgeDocumentsManagementPolicyInput> =
  z.object({
    acknowledgmentMethod: documentsManagementAcknowledgmentMethodSchema,
    acknowledgedAt: optionalIsoDateSchema,
    id: trimmedStringSchema,
    note: z.string().trim().nullable().optional(),
  });

export const deleteDocumentsManagementDocumentInputSchema: z.ZodType<DeleteDocumentsManagementDocumentInput> =
  z.object({
    id: trimmedStringSchema,
    reason: z.string().trim().nullable().optional(),
  });

export const anonymizeDocumentsManagementDocumentInputSchema: z.ZodType<AnonymizeDocumentsManagementDocumentInput> =
  z.object({
    id: trimmedStringSchema,
    reason: z.string().trim().nullable().optional(),
  });

export const executeDocumentsManagementRetentionInputSchema: z.ZodType<ExecuteDocumentsManagementRetentionInput> =
  z.object({
    action: documentsManagementRetentionActionSchema.optional(),
    documentIds: z.array(trimmedStringSchema).readonly().optional(),
  });

export type DocumentsManagementUpdateStatus = DocumentsManagementStatus;
