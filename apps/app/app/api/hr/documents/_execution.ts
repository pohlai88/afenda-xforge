import "server-only";

import type { ListDocumentsManagementQuery } from "@repo/features-employee-management-documents-management";
import {
  canExecuteDocumentsManagementRetention,
  listDocumentsManagementDocumentSummaries,
  listDocumentsManagementRetentionCandidatesQuerySchema,
} from "@repo/features-employee-management-documents-management";
import {
  acknowledgeDocumentsManagementPolicyInputSchema,
  createDocumentsManagementDocumentObligationInputSchema,
  executeDocumentsManagementRetentionInputSchema,
} from "@repo/features-employee-management-documents-management/contracts";
import {
  acknowledgeDocumentsManagementPolicy,
  createDocumentsManagementDocumentObligation,
  deleteDocumentsManagementDocument,
  executeDocumentsManagementRetention,
  getDocumentsManagementDocument,
  getDocumentsManagementDocumentSummary,
  listDocumentsManagementDocumentObligations,
  listDocumentsManagementDocumentReadinessSummaries,
  listDocumentsManagementExpiringDocuments,
  listDocumentsManagementPolicyAcknowledgmentSummaries,
  listDocumentsManagementRetentionCandidates,
  recordDocumentsManagementDocumentAccess,
  registerDocumentsManagementDocument,
  updateDocumentsManagementDocument,
} from "@repo/features-employee-management-documents-management/server";
import type { HandleUploadBody } from "@repo/storage/blob/client";
import { ForbiddenError } from "@repo/errors";
import {
  requireDocumentsManagementReadContext,
  requireDocumentsManagementWriteContext,
} from "./_context.ts";
import {
  createDocumentsManagementStorageUploadSession,
  uploadDocumentsManagementBlobToken,
} from "./_lib/storage.ts";

type BlobGenerateClientTokenBody = Extract<
  HandleUploadBody,
  { type: "blob.generate-client-token" }
>;

type BlobUploadCompletedBody = Extract<
  HandleUploadBody,
  { type: "blob.upload-completed" }
>;

type StorageGenerateClientUploadSessionBody = {
  payload: {
    pathname: string;
  };
  type: "storage.generate-client-upload-session";
};

export type DocumentsManagementClientUploadBody =
  | BlobGenerateClientTokenBody
  | BlobUploadCompletedBody
  | StorageGenerateClientUploadSessionBody;

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

export const listObligationsForTenant = async (
  query: Parameters<typeof listDocumentsManagementDocumentObligations>[0]
) => {
  const { context } = await requireDocumentsManagementReadContext();

  return listDocumentsManagementDocumentObligations(query, context);
};

export const createObligationForTenant = async (
  input: Parameters<typeof createDocumentsManagementDocumentObligation>[0]
) => {
  const { context } = await requireDocumentsManagementWriteContext();

  return createDocumentsManagementDocumentObligation(input, context);
};

export const listAcknowledgmentsForTenant = async (
  query: Parameters<
    typeof listDocumentsManagementPolicyAcknowledgmentSummaries
  >[0]
) => {
  const { context } = await requireDocumentsManagementReadContext();

  return listDocumentsManagementPolicyAcknowledgmentSummaries(query, context);
};

export const acknowledgePolicyForTenant = async (
  input: Parameters<typeof acknowledgeDocumentsManagementPolicy>[0]
) => {
  const { context } = await requireDocumentsManagementWriteContext();

  return acknowledgeDocumentsManagementPolicy(input, context);
};

export const listReadinessForTenant = async (
  query: Parameters<
    typeof listDocumentsManagementDocumentReadinessSummaries
  >[0]
) => {
  const { context } = await requireDocumentsManagementReadContext();

  return listDocumentsManagementDocumentReadinessSummaries(query, context);
};

export const listExpiringDocumentsForTenant = async (
  query: Parameters<typeof listDocumentsManagementExpiringDocuments>[0]
) => {
  const { context } = await requireDocumentsManagementReadContext();

  return listDocumentsManagementExpiringDocuments(query, context);
};

const isRetentionAction = (
  value: string | undefined
): value is "delete" | "retain" | "archive" | "anonymize" =>
  value === "delete" ||
  value === "retain" ||
  value === "archive" ||
  value === "anonymize";

export const listRetentionCandidatesForTenant = async (request: Request) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? undefined;
  const query = listDocumentsManagementRetentionCandidatesQuerySchema.parse({
    action: isRetentionAction(action) ? action : undefined,
    page: url.searchParams.get("page")
      ? Number(url.searchParams.get("page"))
      : undefined,
    pageSize: url.searchParams.get("pageSize")
      ? Number(url.searchParams.get("pageSize"))
      : undefined,
  });
  const { context } = await requireDocumentsManagementReadContext();

  return listDocumentsManagementRetentionCandidates(query, context);
};

export const executeRetentionForTenant = async (body: unknown) => {
  const { context } = await requireDocumentsManagementWriteContext();

  if (!canExecuteDocumentsManagementRetention(context)) {
    throw new ForbiddenError("Retention execution access denied");
  }

  return executeDocumentsManagementRetention(
    executeDocumentsManagementRetentionInputSchema.parse(body),
    context
  );
};

export const resolveDocumentClientUploadForTenant = async (input: {
  body: DocumentsManagementClientUploadBody;
  request: Request;
}) => {
  await requireDocumentsManagementWriteContext();

  if (input.body.type === "blob.generate-client-token") {
    return uploadDocumentsManagementBlobToken({
      body: input.body,
      onBeforeGenerateToken: async () => ({
        addRandomSuffix: true,
        maximumSizeInBytes: 5 * 1024 * 1024 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {
        // Registration happens after the browser upload completes.
      },
      request: input.request,
    });
  }

  if (input.body.type === "blob.upload-completed") {
    return uploadDocumentsManagementBlobToken({
      body: input.body,
      onBeforeGenerateToken: async () => ({
        addRandomSuffix: true,
        maximumSizeInBytes: 5 * 1024 * 1024 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {
        // Registration happens in the document-create route after upload.
      },
      request: input.request,
    });
  }

  return createDocumentsManagementStorageUploadSession({
    key: input.body.payload.pathname,
  });
};
