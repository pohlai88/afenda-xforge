import type { ProcessLamLeaveBalanceCarryForwardInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { processLamLeaveBalanceCarryForward } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamBalanceWriteContext } from "../../_lib/context.ts";
import { mapLamMutationHttpStatus } from "../../_lib/mutation-response.ts";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  const result = await processLamLeaveBalanceCarryForward(
    body as ProcessLamLeaveBalanceCarryForwardInput,
    createLamBalanceWriteContext(request)
  );

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus(result),
  });
}
