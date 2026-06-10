import { requestLamLeaveApplicationClarification } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamApprovalContext } from "../../../_lib/context.ts";
import { mapLamMutationHttpStatus } from "../../../_lib/mutation-response.ts";
import { notifyLamLeaveApplicationEvent } from "../../../_lib/notify-lam-events.ts";

type RouteContext = {
  params: Promise<{ applicationId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { applicationId } = await context.params;
  const body = await request.json();
  const result = await requestLamLeaveApplicationClarification(
    {
      ...body,
      applicationId,
    },
    createLamApprovalContext(request)
  );

  if (result.ok) {
    await notifyLamLeaveApplicationEvent({
      request,
      applicationId,
      kind: "returned",
      body,
      returnedReason:
        typeof body.clarificationReason === "string"
          ? body.clarificationReason
          : null,
      requestType: "clarification",
    });
  }

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus(result),
  });
}
