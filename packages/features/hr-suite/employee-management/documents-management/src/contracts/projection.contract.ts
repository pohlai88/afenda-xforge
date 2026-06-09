import { z } from "zod";

import {
  documentsManagementDocumentSchema,
  documentsManagementDocumentSummarySchema,
  trimmedStringSchema,
} from "../schema.ts";

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

export const documentsManagementDocumentReadinessProjectionSchema = z.object({
  archivedDocumentCount: z.number().int().nonnegative(),
  companyId: trimmedStringSchema.nullish(),
  documentCount: z.number().int().nonnegative(),
  employeeId: trimmedStringSchema,
  expiredDocumentCount: z.number().int().nonnegative(),
  missingMandatoryDocumentCount: z.number().int().nonnegative(),
  mandatoryDocumentCount: z.number().int().nonnegative(),
  pendingVerificationDocumentCount: z.number().int().nonnegative(),
  rejectedDocumentCount: z.number().int().nonnegative(),
  ready: z.boolean(),
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
