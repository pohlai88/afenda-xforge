import { createDocumentsManagementDocumentObligationInputSchema } from "@repo/features-employee-management-documents-management/contracts";
import {
  createDocumentsManagementDocumentObligation,
  listDocumentsManagementDocumentObligations,
} from "@repo/features-employee-management-documents-management/server";
import { NextResponse } from "next/server";

import {
  createDocumentsManagementReadContext,
  createDocumentsManagementWriteContext,
  getDocumentsManagementQuery,
} from "../_lib/context.ts";
import {
  ensureDocumentsManagementReadAccess,
  ensureDocumentsManagementWriteAccess,
} from "../_lib/http.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const context = await createDocumentsManagementReadContext(request);
    const denied = ensureDocumentsManagementReadAccess(context);

    if (denied) {
      return denied;
    }

    return NextResponse.json(
      listDocumentsManagementDocumentObligations(
        getDocumentsManagementQuery(request),
        context
      )
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid query parameters" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const writeContext = await createDocumentsManagementWriteContext(request);
    const denied = ensureDocumentsManagementWriteAccess(writeContext);

    if (denied) {
      return denied;
    }

    const body = await request.json();
    const createdObligation = await createDocumentsManagementDocumentObligation(
      createDocumentsManagementDocumentObligationInputSchema.parse(body),
      writeContext
    );

    return NextResponse.json(createdObligation, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid obligation payload" },
      { status: 400 }
    );
  }
}
