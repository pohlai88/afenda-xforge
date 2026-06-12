import { acknowledgeDocumentsManagementPolicyInputSchema } from "@repo/features-employee-management-documents-management/contracts";
import {
  acknowledgeDocumentsManagementPolicy,
  listDocumentsManagementPolicyAcknowledgmentSummaries,
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
      listDocumentsManagementPolicyAcknowledgmentSummaries(
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
    const acknowledged = await acknowledgeDocumentsManagementPolicy(
      acknowledgeDocumentsManagementPolicyInputSchema.parse(body),
      writeContext
    );

    return NextResponse.json(acknowledged);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Invalid acknowledgment payload",
      },
      { status: 400 }
    );
  }
}
