import { getDocumentsManagementDocument } from "@repo/features-employee-management-documents-management/server";
import type { GetBlobResult } from "@repo/storage/blob";

import { createDocumentsManagementReadContext } from "../../_lib/context.ts";
import {
  DocumentsManagementBlobStorageError,
  downloadDocumentsManagementBlob,
} from "../../_lib/storage.ts";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

const buildDownloadFileName = (
  fileName: string | null | undefined,
  fallbackTitle: string
): string => {
  const normalizedFileName = fileName?.trim();

  if (normalizedFileName) {
    return normalizedFileName.replace(/["\r\n]/g, "-");
  }

  return `${fallbackTitle.replace(/[^A-Za-z0-9._-]+/g, "-") || "document"}.bin`;
};

export async function GET(
  request: Request,
  context: RouteContext
): Promise<Response> {
  const { documentId } = await context.params;
  const document = getDocumentsManagementDocument(
    documentId,
    createDocumentsManagementReadContext(request)
  );

  if (!document?.reference.storagePath) {
    return Response.json(
      { ok: false, error: "Document not found" },
      { status: 404 }
    );
  }

  let blob: GetBlobResult | null;

  try {
    blob = await downloadDocumentsManagementBlob({
      key: document.reference.storagePath,
    });
  } catch (error) {
    if (error instanceof DocumentsManagementBlobStorageError) {
      return Response.json(
        { ok: false, error: "Document storage is unavailable" },
        { status: 503 }
      );
    }

    throw error;
  }

  if (!(blob && blob.statusCode === 200 && blob.stream)) {
    return Response.json(
      { ok: false, error: "Document binary not found" },
      { status: 404 }
    );
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    document.reference.contentType ??
      blob.blob.contentType ??
      "application/octet-stream"
  );
  headers.set(
    "Content-Disposition",
    `attachment; filename="${buildDownloadFileName(
      document.reference.fileName,
      document.title
    )}"`
  );

  if (blob.blob.size !== null) {
    headers.set("Content-Length", String(blob.blob.size));
  }

  return new Response(blob.stream, {
    headers,
    status: 200,
  });
}
