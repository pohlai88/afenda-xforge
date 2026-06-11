import { canDownloadDocumentsManagement } from "@repo/features-employee-management-documents-management";
import { mapApiRouteError } from "../../../../../../lib/api/route-errors.ts";
import { requireDocumentsManagementReadContext } from "../../_context.ts";
import {
  getDocumentForTenant,
  recordDocumentDownloadForTenant,
} from "../../_execution.ts";
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
  _request: Request,
  context: RouteContext
): Promise<Response> {
  try {
    const { documentId } = await context.params;
    const { context: readContext } =
      await requireDocumentsManagementReadContext();

    if (!canDownloadDocumentsManagement(readContext)) {
      return Response.json(
        { ok: false, error: "Document download access denied" },
        { status: 403 }
      );
    }

    const document = await getDocumentForTenant(documentId);

    if (!document?.reference.storagePath) {
      return Response.json(
        { ok: false, error: "Document not found" },
        { status: 404 }
      );
    }

    let blob: Awaited<ReturnType<typeof downloadDocumentsManagementBlob>> | null;

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

    if (typeof blob.blob.size === "number") {
      headers.set("Content-Length", String(blob.blob.size));
    }

    await recordDocumentDownloadForTenant(documentId);

    return new Response(blob.stream, {
      headers,
      status: 200,
    });
  } catch (error) {
    return mapApiRouteError(error, "Unable to download document");
  }
}
