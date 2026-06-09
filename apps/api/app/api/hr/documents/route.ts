import { listDocumentsManagementDocumentSummaries } from "@repo/features-employee-management-documents-management";
import { NextResponse } from "next/server";

import {
  createDocumentsManagementReadContext,
  getDocumentsManagementQuery,
} from "./_lib/context.ts";

export function GET(request: Request): Response {
  try {
    const query = getDocumentsManagementQuery(request);

    return NextResponse.json(
      listDocumentsManagementDocumentSummaries(
        query,
        createDocumentsManagementReadContext(request)
      )
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid query parameters" },
      { status: 400 }
    );
  }
}
