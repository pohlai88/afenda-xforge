import { updateDocumentsManagementDocumentInputSchema } from "@repo/features-employee-management-documents-management/contracts";
import { NextResponse } from "next/server";
import { mapApiRouteError } from "../../../../../lib/api/route-errors.ts";
import {
  deleteDocumentForTenant,
  getDocumentSummaryForTenant,
  recordDocumentSensitiveReadForTenant,
  updateDocumentForTenant,
} from "../_execution.ts";

type RouteParams = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { documentId } = await params;
    const document = await getDocumentSummaryForTenant(documentId);

    if (!document) {
      return NextResponse.json(
        { ok: false, error: "Document not found" },
        { status: 404 }
      );
    }

    await recordDocumentSensitiveReadForTenant(documentId);

    return NextResponse.json(document);
  } catch (error) {
    return mapApiRouteError(error, "Unable to load document");
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { documentId } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const updatedDocument = await updateDocumentForTenant(
      documentId,
      updateDocumentsManagementDocumentInputSchema.parse({
        ...body,
        id: documentId,
      })
    );

    return NextResponse.json(updatedDocument);
  } catch (error) {
    if (error instanceof Error && error.message === "Document not found") {
      return NextResponse.json(
        { ok: false, error: "Document not found" },
        { status: 404 }
      );
    }

    return mapApiRouteError(error, "Unable to update document");
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { documentId } = await params;
    let reason: string | null | undefined;

    try {
      const body = (await request.json()) as { reason?: string | null };
      reason = body.reason;
    } catch {
      reason = undefined;
    }

    const deletedDocument = await deleteDocumentForTenant(
      documentId,
      reason
    );

    return NextResponse.json(deletedDocument);
  } catch (error) {
    if (error instanceof Error && error.message === "Document not found") {
      return NextResponse.json(
        { ok: false, error: "Document not found" },
        { status: 404 }
      );
    }

    return mapApiRouteError(error, "Unable to delete document");
  }
}
