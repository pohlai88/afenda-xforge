import type { RejectLamLeaveApplicationInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { rejectLamLeaveApplication } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamLeaveApplicationApprovalContextById } from "../../../_lib/context.ts";
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

  const result = await rejectLamLeaveApplication(
    {
      ...body,
      applicationId,
    } as RejectLamLeaveApplicationInput,
    await createLamLeaveApplicationApprovalContextById(request, applicationId)
  );

  if (result.ok) {
    await notifyLamLeaveApplicationEvent({
      request,
      applicationId,
      kind: "rejected",
      body,
    });
  }

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus(result),
  });
}
