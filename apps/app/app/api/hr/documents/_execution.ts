import "server-only";

import type { ListDocumentsManagementQuery } from "@repo/features-employee-management-documents-management";
import { listDocumentsManagementDocumentSummaries } from "@repo/features-employee-management-documents-management";
import {
  deleteDocumentsManagementDocument,
  getDocumentsManagementDocument,
  getDocumentsManagementDocumentSummary,
  recordDocumentsManagementDocumentAccess,
  registerDocumentsManagementDocument,
  updateDocumentsManagementDocument,
} from "@repo/features-employee-management-documents-management/server";
import {
  requireDocumentsManagementReadContext,
  requireDocumentsManagementWriteContext,
} from "./_context.ts";

export const listDocumentsForTenant = async (
  query: ListDocumentsManagementQuery
) => {
  const { context } = await requireDocumentsManagementReadContext();

  return listDocumentsManagementDocumentSummaries(query, context);
};

export const registerDocumentForTenant = async (
  input: Parameters<typeof registerDocumentsManagementDocument>[0]
) => {
  const { context } = await requireDocumentsManagementWriteContext();

  return registerDocumentsManagementDocument(input, context);
};

export const getDocumentSummaryForTenant = async (documentId: string) => {
  const { context } = await requireDocumentsManagementReadContext();

  return getDocumentsManagementDocumentSummary(documentId, context);
};

export const getDocumentForTenant = async (documentId: string) => {
  const { context } = await requireDocumentsManagementReadContext();

  return getDocumentsManagementDocument(documentId, context);
};

export const recordDocumentSensitiveReadForTenant = async (
  documentId: string
) => {
  const { context } = await requireDocumentsManagementReadContext();

  if (!context.canViewSensitive) {
    return;
  }

  await recordDocumentsManagementDocumentAccess(
    {
      action: "read_sensitive",
      documentId,
    },
    context
  );
};

export const updateDocumentForTenant = async (
  documentId: string,
  input: Parameters<typeof updateDocumentsManagementDocument>[0]
) => {
  const { context } = await requireDocumentsManagementWriteContext();

  return updateDocumentsManagementDocument(
    { ...input, id: documentId },
    context
  );
};

export const deleteDocumentForTenant = async (
  documentId: string,
  reason?: string | null
) => {
  const { context } = await requireDocumentsManagementWriteContext();

  return deleteDocumentsManagementDocument(
    { id: documentId, reason },
    context
  );
};

export const recordDocumentDownloadForTenant = async (documentId: string) => {
  const { context } = await requireDocumentsManagementReadContext();

  await recordDocumentsManagementDocumentAccess(
    {
      action: "download",
      documentId,
    },
    context
  );
};
