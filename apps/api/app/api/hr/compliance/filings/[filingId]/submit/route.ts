import { submitComplianceFiling } from "@repo/features-employee-management-compliance-regulatory-tracking/server";
import { NextResponse } from "next/server";
import { createComplianceWriteContext } from "../../../_lib/context.ts";
import {
  ensureComplianceWriteAccess,
  mutationStatusFromComplianceResult,
  respondWithComplianceError,
} from "../../../_lib/http.ts";

type RouteContext = {
  params: Promise<{
    filingId: string;
  }>;
};

export async function POST(
  request: Request,
  routeContext: RouteContext
): Promise<Response> {
  try {
    const context = await createComplianceWriteContext(request);
    const denied = ensureComplianceWriteAccess(context);

    if (denied) {
      return denied;
    }

    const { filingId } = await routeContext.params;
    const body = await request.json();
    const result = await submitComplianceFiling(
      {
        ...body,
        filingId,
      },
      context
    );

    return NextResponse.json(result, {
      status: mutationStatusFromComplianceResult(result),
    });
  } catch (error) {
    return respondWithComplianceError(error);
  }
}
