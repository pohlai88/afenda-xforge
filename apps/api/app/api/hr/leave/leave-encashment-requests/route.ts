import type { ProcessLamLeaveEncashmentInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { processLamLeaveEncashment } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamOperationalWriteContext } from "../../_lib/lam-governed-context.ts";
import { mapLamMutationHttpStatus } from "../../leave/_lib/mutation-response.ts";

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

  const result = await processLamLeaveEncashment(
    body as ProcessLamLeaveEncashmentInput,
    await createLamOperationalWriteContext(request)
  );

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus({
      ...result,
      successStatus: 201,
    }),
  });
}
