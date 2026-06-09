import { getDocumentsManagementDocumentSummary } from "@repo/features-employee-management-documents-management/server";
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

  return NextResponse.json(document);
}
