import { applyLamLeaveEntitlementCalculation } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { mapLamMutationHttpStatus } from "../../_lib/mutation-response.ts";
import { createLamWriteContext } from "../../_lib/context.ts";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await applyLamLeaveEntitlementCalculation(
    body,
    createLamWriteContext(request)
  );

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus(result),
  });
}
