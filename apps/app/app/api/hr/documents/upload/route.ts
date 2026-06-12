import { NextResponse } from "next/server";
import { mapApiRouteError } from "../../../../../lib/api/route-errors.ts";
import {
  type DocumentsManagementClientUploadBody,
  resolveDocumentClientUploadForTenant,
} from "../_execution.ts";
import { DocumentsManagementBlobStorageError } from "../_lib/storage.ts";

const buildUploadRequestBody = (value: unknown): DocumentsManagementClientUploadBody => {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid client upload payload");
  }

  const body = value as Record<string, unknown>;

  if (body.type === "blob.generate-client-token") {
    return body as unknown as DocumentsManagementClientUploadBody;
  }

  if (body.type === "blob.upload-completed") {
    return body as unknown as DocumentsManagementClientUploadBody;
  }

  if (body.type === "storage.generate-client-upload-session") {
    return body as unknown as DocumentsManagementClientUploadBody;
  }

  throw new Error("Invalid client upload payload");
};

export async function POST(request: Request): Promise<Response> {
  try {
    const body = buildUploadRequestBody(await request.json());
    const response = await resolveDocumentClientUploadForTenant({
      body,
      request,
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
