import { z } from "zod";

import {
  documentsManagementDocumentCategorySchema,
  documentsManagementDocumentReferenceSchema,
  documentsManagementDocumentStatusSchema,
  documentsManagementDocumentTypeSchema,
  documentsManagementDocumentVisibilitySchema,
  documentsManagementRetentionSchema,
  optionalIsoDateSchema,
  optionalTrimmedStringSchema,
  trimmedStringSchema,
} from "../schema.ts";
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
  renewalDueAt?: Date | null;
  rejectedAt?: Date | null;
};

export type ExpireDocumentsManagementDocumentInput = {
  id: string;
  renewalDueAt?: Date | null;
  expiredAt?: Date | null;
};

export type ArchiveDocumentsManagementDocumentInput = {
  id: string;
  archivedAt?: Date | null;
};

export type UpdateDocumentsManagementRetentionInput = {
  id: string;
  retention: z.infer<typeof documentsManagementRetentionSchema>;
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
    rejectionReason: trimmedStringSchema,
    renewalDueAt: optionalIsoDateSchema,
    rejectedAt: optionalIsoDateSchema,
  });

export const expireDocumentsManagementDocumentInputSchema: z.ZodType<ExpireDocumentsManagementDocumentInput> =
  z.object({
    id: trimmedStringSchema,
    renewalDueAt: optionalIsoDateSchema,
    expiredAt: optionalIsoDateSchema,
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

export type DocumentsManagementUpdateStatus = DocumentsManagementStatus;
