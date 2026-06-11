import { canWriteDocumentsManagement } from "@repo/features-employee-management-documents-management";
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

export function GET(request: Request): Response {
  try {
    return NextResponse.json(
      listDocumentsManagementDocumentObligations(
        getDocumentsManagementQuery(request),
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

export async function POST(request: Request): Promise<Response> {
  try {
    const writeContext = createDocumentsManagementWriteContext(request);

    if (!canWriteDocumentsManagement(writeContext)) {
      return NextResponse.json(
        { ok: false, error: "Write access denied" },
        { status: 403 }
      );
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
