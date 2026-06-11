import {
  deleteDocumentsManagementDocumentInputSchema,
  updateDocumentsManagementDocumentInputSchema,
} from "@repo/features-employee-management-documents-management/contracts";
import {
  canWriteDocumentsManagement,
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
  const document = getDocumentsManagementDocumentSummary(
    documentId,
    createDocumentsManagementReadContext(request)
  );

  if (!document) {
    return NextResponse.json(
      { ok: false, error: "Document not found" },
      { status: 404 }
    );
  }

  const readContext = createDocumentsManagementReadContext(request);
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
    const writeContext = createDocumentsManagementWriteContext(request);

    if (!canWriteDocumentsManagement(writeContext)) {
      return NextResponse.json(
        { ok: false, error: "Write access denied" },
        { status: 403 }
      );
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
    const writeContext = createDocumentsManagementWriteContext(request);

    if (!canWriteDocumentsManagement(writeContext)) {
      return NextResponse.json(
        { ok: false, error: "Write access denied" },
        { status: 403 }
      );
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
