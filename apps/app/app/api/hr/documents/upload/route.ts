import { canWriteDocumentsManagement } from "@repo/features-employee-management-documents-management";
import type { HandleUploadBody } from "@repo/storage/blob/client";
import { NextResponse } from "next/server";
import { mapApiRouteError } from "../../../../../lib/api/route-errors.ts";
import { requireDocumentsManagementWriteContext } from "../_context.ts";
import {
  createDocumentsManagementStorageUploadSession,
  DocumentsManagementBlobStorageError,
  uploadDocumentsManagementBlobToken,
} from "../_lib/storage.ts";

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

type BlobUploadRequestBody =
  | BlobGenerateClientTokenBody
  | BlobUploadCompletedBody
  | StorageGenerateClientUploadSessionBody;

const buildUploadRequestBody = (value: unknown): BlobUploadRequestBody => {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid client upload payload");
  }

  const body = value as Record<string, unknown>;

  if (body.type === "blob.generate-client-token") {
    return body as unknown as BlobGenerateClientTokenBody;
  }

  if (body.type === "blob.upload-completed") {
    return body as unknown as BlobUploadCompletedBody;
  }

  if (body.type === "storage.generate-client-upload-session") {
    return body as unknown as StorageGenerateClientUploadSessionBody;
  }

  throw new Error("Invalid client upload payload");
};

export async function POST(request: Request): Promise<Response> {
  try {
    const body = buildUploadRequestBody(await request.json());

    if (body.type === "blob.generate-client-token") {
      const { context: writeContext } =
        await requireDocumentsManagementWriteContext();

      if (!canWriteDocumentsManagement(writeContext)) {
        return NextResponse.json(
          { ok: false, error: "Write access denied" },
          { status: 403 }
        );
      }

      const response = await uploadDocumentsManagementBlobToken({
        body,
        onBeforeGenerateToken: async () => ({
          addRandomSuffix: true,
          maximumSizeInBytes: 5 * 1024 * 1024 * 1024 * 1024,
        }),
        onUploadCompleted: async () => {
          // Blob direct uploads are registered after the browser upload returns.
        },
        request,
      });

      if (!response) {
        return NextResponse.json(
          { ok: false, error: "Document storage is not configured" },
          { status: 503 }
        );
      }

      return NextResponse.json(response);
    }

    if (body.type === "blob.upload-completed") {
      const response = await uploadDocumentsManagementBlobToken({
        body,
        onBeforeGenerateToken: async () => ({
          addRandomSuffix: true,
          maximumSizeInBytes: 5 * 1024 * 1024 * 1024 * 1024,
        }),
        onUploadCompleted: async () => {
          // Registration happens in the document-create route after upload.
        },
        request,
      });

      if (!response) {
        return NextResponse.json(
          { ok: false, error: "Document storage is not configured" },
          { status: 503 }
        );
      }

      return NextResponse.json(response);
    }

    const { context: writeContext } =
      await requireDocumentsManagementWriteContext();

    if (!canWriteDocumentsManagement(writeContext)) {
      return NextResponse.json(
        { ok: false, error: "Write access denied" },
        { status: 403 }
      );
    }

    const response = await createDocumentsManagementStorageUploadSession({
      key: body.payload.pathname,
    });

    if (!response) {
      return NextResponse.json(
        { ok: false, error: "Document storage is not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof DocumentsManagementBlobStorageError) {
      return NextResponse.json(
        { ok: false, error: "Document storage is unavailable" },
        { status: 503 }
      );
    }

    return mapApiRouteError(error, "Invalid client upload payload");
  }
}
