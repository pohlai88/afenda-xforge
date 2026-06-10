import type { CalculateLamLeaveEntitlementInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { applyLamLeaveEntitlementCalculation } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { mapLamMutationHttpStatus } from "../../_lib/mutation-response.ts";
import { parseLamJsonBody } from "../../_lib/parse-json-body.ts";
import { createLamWriteContext } from "../../_lib/context.ts";

export async function POST(request: Request) {
  const parsedBody = await parseLamJsonBody(request);
  if (!parsedBody.ok) {
    return NextResponse.json(
      { ok: false, error: parsedBody.error },
      { status: 400 }
    );
  }

  const result = await applyLamLeaveEntitlementCalculation(
    parsedBody.body as CalculateLamLeaveEntitlementInput,
    createLamWriteContext(request)
  );

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus(result),
  });
}
