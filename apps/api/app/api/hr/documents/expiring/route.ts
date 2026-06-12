import { listDocumentsManagementExpiringDocuments } from "@repo/features-employee-management-documents-management/server";
import { NextResponse } from "next/server";

import {
  createDocumentsManagementReadContext,
  getDocumentsManagementQuery,
} from "../_lib/context.ts";
import { ensureDocumentsManagementReadAccess } from "../_lib/http.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const query = getDocumentsManagementQuery(request);
    const context = await createDocumentsManagementReadContext(request);
    const denied = ensureDocumentsManagementReadAccess(context);

    if (denied) {
      return denied;
    }

    return NextResponse.json(
      listDocumentsManagementExpiringDocuments(query, context)
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid query parameters" },
      { status: 400 }
    );
  }
}
