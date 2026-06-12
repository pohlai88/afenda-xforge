import { exportComplianceReport } from "@repo/features-employee-management-compliance-regulatory-tracking/server";
import { NextResponse } from "next/server";
import { createComplianceWriteContext } from "../../_lib/context.ts";
import {
  ensureComplianceWriteAccess,
  mutationStatusFromComplianceResult,
  respondWithComplianceError,
} from "../../_lib/http.ts";

export async function POST(request: Request): Promise<Response> {
  try {
    const context = await createComplianceWriteContext(request);
    const denied = ensureComplianceWriteAccess(context);

    if (denied) {
      return denied;
    }

    const result = await exportComplianceReport(await request.json(), context);

    if ("ok" in result) {
      return NextResponse.json(result, {
        status: mutationStatusFromComplianceResult(result),
      });
    }

    return new Response(result.content, {
      headers: {
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
        "Content-Type": result.contentType,
      },
    });
  } catch (error) {
    return respondWithComplianceError(error);
  }
}
