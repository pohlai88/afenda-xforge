import type { CalculateLamLeaveEntitlementInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { applyLamLeaveEntitlementCalculation } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamConfigWriteContext } from "../../../_lib/lam-governed-context.ts";
import { mapLamMutationHttpStatus } from "../../_lib/mutation-response.ts";
import { parseLamJsonBody } from "../../_lib/parse-json-body.ts";

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
    await createLamConfigWriteContext(request)
  );

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus(result),
  });
}
