import {
  canExecuteDocumentsManagementRetention,
  listDocumentsManagementRetentionCandidatesQuerySchema,
} from "@repo/features-employee-management-documents-management";
import { executeDocumentsManagementRetentionInputSchema } from "@repo/features-employee-management-documents-management/contracts";
import {
  executeDocumentsManagementRetention,
  listDocumentsManagementRetentionCandidates,
} from "@repo/features-employee-management-documents-management/server";
import { NextResponse } from "next/server";

import {
  createDocumentsManagementReadContext,
  createDocumentsManagementWriteContext,
} from "../_lib/context.ts";

const isRetentionAction = (
  value: string | undefined
): value is "delete" | "retain" | "archive" | "anonymize" =>
  value === "delete" ||
  value === "retain" ||
  value === "archive" ||
  value === "anonymize";

export function GET(request: Request): Response {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") ?? undefined;
    const query = listDocumentsManagementRetentionCandidatesQuerySchema.parse({
      action: isRetentionAction(action) ? action : undefined,
      page: url.searchParams.get("page")
        ? Number(url.searchParams.get("page"))
        : undefined,
      pageSize: url.searchParams.get("pageSize")
        ? Number(url.searchParams.get("pageSize"))
        : undefined,
    });

    return NextResponse.json(
      listDocumentsManagementRetentionCandidates(
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

export async function POST(request: Request): Promise<Response> {
  try {
    const writeContext = createDocumentsManagementWriteContext(request);

    if (!canExecuteDocumentsManagementRetention(writeContext)) {
      return NextResponse.json(
        { ok: false, error: "Retention execution access denied" },
        { status: 403 }
      );
    }

    const executed = await executeDocumentsManagementRetention(
      executeDocumentsManagementRetentionInputSchema.parse(
        await request.json()
      ),
      writeContext
    );

    return NextResponse.json(executed);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Invalid retention payload",
      },
      { status: 400 }
    );
  }
}
