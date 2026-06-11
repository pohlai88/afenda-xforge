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

export function GET(request: Request): Response {
  try {
    return NextResponse.json(
      listDocumentsManagementPolicyAcknowledgmentSummaries(
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
