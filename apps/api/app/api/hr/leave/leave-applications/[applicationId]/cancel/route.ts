import type { CancelLamLeaveApplicationInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { cancelLamLeaveApplication } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamWriteContext } from "../../../_lib/context.ts";
import { mapLamMutationHttpStatus } from "../../../_lib/mutation-response.ts";
import { notifyLamLeaveApplicationEvent } from "../../../_lib/notify-lam-events.ts";

type RouteContext = {
  params: Promise<{ applicationId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { applicationId } = await context.params;
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

  const result = await cancelLamLeaveApplication(
    {
      ...body,
      applicationId,
    } as CancelLamLeaveApplicationInput,
    await createLamWriteContext(request)
  );

  if (result.ok) {
    await notifyLamLeaveApplicationEvent({
      request,
      applicationId,
      kind: "cancelled",
      body,
    });
  }

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus(result),
  });
}
