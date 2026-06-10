import { z } from "zod";

import {
  documentsManagementAuditActionSchema,
  documentsManagementDocumentQuerySchema,
  documentsManagementRetentionActionSchema,
  trimmedStringSchema,
} from "./schema.ts";

export type ListDocumentsManagementQuery = z.infer<
  typeof documentsManagementDocumentQuerySchema
>;

export const listDocumentsManagementQuerySchema: typeof documentsManagementDocumentQuerySchema =
  documentsManagementDocumentQuerySchema;

export type ListDocumentsManagementAuditEventsQuery = {
  action?: z.infer<typeof documentsManagementAuditActionSchema>;
  documentId?: string;
  employeeId?: string;
  page?: number;
  pageSize?: number;
};

export const listDocumentsManagementAuditEventsQuerySchema: z.ZodType<ListDocumentsManagementAuditEventsQuery> =
  z.object({
    action: documentsManagementAuditActionSchema.optional(),
    documentId: trimmedStringSchema.optional(),
    employeeId: trimmedStringSchema.optional(),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(500).optional(),
  });

export type ListDocumentsManagementDocumentVersionsQuery = {
  documentId: string;
  page?: number;
  pageSize?: number;
};

export const listDocumentsManagementDocumentVersionsQuerySchema: z.ZodType<ListDocumentsManagementDocumentVersionsQuery> =
  z.object({
    documentId: trimmedStringSchema,
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(500).optional(),
  });

export type ListDocumentsManagementRetentionCandidatesQuery = {
  action?: z.infer<typeof documentsManagementRetentionActionSchema>;
  page?: number;
  pageSize?: number;
};

export const listDocumentsManagementRetentionCandidatesQuerySchema: z.ZodType<ListDocumentsManagementRetentionCandidatesQuery> =
  z.object({
    action: documentsManagementRetentionActionSchema.optional(),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(500).optional(),
  });
