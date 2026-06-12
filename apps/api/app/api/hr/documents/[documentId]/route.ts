import {
  deleteDocumentsManagementDocumentInputSchema,
  updateDocumentsManagementDocumentInputSchema,
} from "@repo/features-employee-management-documents-management/contracts";
import {
  deleteDocumentsManagementDocument,
  getDocumentsManagementDocumentSummary,
  recordDocumentsManagementDocumentAccess,
  updateDocumentsManagementDocument,
} from "@repo/features-employee-management-documents-management/server";
import { NextResponse } from "next/server";

import {
  createDocumentsManagementReadContext,
  createDocumentsManagementWriteContext,
} from "../_lib/context.ts";
import {
  ensureDocumentsManagementReadAccess,
  ensureDocumentsManagementWriteAccess,
} from "../_lib/http.ts";

type RouteParams = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  const { documentId } = await params;
  const readContext = await createDocumentsManagementReadContext(request);
  const denied = ensureDocumentsManagementReadAccess(readContext);

  if (denied) {
    return denied;
  }

  const document = getDocumentsManagementDocumentSummary(
    documentId,
    readContext
  );

  if (!document) {
    return NextResponse.json(
      { ok: false, error: "Document not found" },
      { status: 404 }
    );
  }

  if (readContext.canViewSensitive) {
    await recordDocumentsManagementDocumentAccess(
      {
        action: "read_sensitive",
        documentId,
      },
      readContext
    );
  }

  return NextResponse.json(document);
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const writeContext = await createDocumentsManagementWriteContext(request);
    const denied = ensureDocumentsManagementWriteAccess(writeContext);

    if (denied) {
      return denied;
    }

    const { documentId } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const updatedDocument = await updateDocumentsManagementDocument(
      updateDocumentsManagementDocumentInputSchema.parse({
        ...body,
        id: documentId,
      }),
      writeContext
    );

    return NextResponse.json(updatedDocument);
  } catch (error) {
    if (error instanceof Error && error.message === "Document not found") {
      return NextResponse.json(
        { ok: false, error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to update document",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const writeContext = await createDocumentsManagementWriteContext(request);
    const denied = ensureDocumentsManagementWriteAccess(writeContext);

    if (denied) {
      return denied;
    }

    const { documentId } = await params;
    let reason: string | null | undefined;

    try {
      const body = (await request.json()) as { reason?: string | null };
      reason = body.reason;
    } catch {
      reason = undefined;
    }

    const deletedDocument = await deleteDocumentsManagementDocument(
      deleteDocumentsManagementDocumentInputSchema.parse({
        id: documentId,
        reason,
      }),
      writeContext
    );

    return NextResponse.json(deletedDocument);
  } catch (error) {
    if (error instanceof Error && error.message === "Document not found") {
      return NextResponse.json(
        { ok: false, error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to delete document",
      },
      { status: 400 }
    );
  }
}
