import {
  getDocumentsManagementDocumentSummary,
  recordDocumentsManagementDocumentAccess,
} from "@repo/features-employee-management-documents-management/server";
import { NextResponse } from "next/server";

import { createDocumentsManagementReadContext } from "../_lib/context.ts";

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
