import { listDocumentsManagementExpiringDocuments } from "@repo/features-employee-management-documents-management/server";
import { NextResponse } from "next/server";

import {
  createDocumentsManagementReadContext,
  getDocumentsManagementQuery,
} from "../_lib/context.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const query = getDocumentsManagementQuery(request);

    return NextResponse.json(
      listDocumentsManagementExpiringDocuments(
        query,
        await createDocumentsManagementReadContext(request)
      )
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid query parameters" },
      { status: 400 }
    );
  }
}
