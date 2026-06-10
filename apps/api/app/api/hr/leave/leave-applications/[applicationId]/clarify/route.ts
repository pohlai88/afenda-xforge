import type { RequestLamLeaveApplicationClarificationInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { requestLamLeaveApplicationClarification } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamLeaveApplicationApprovalContextById } from "../../../_lib/context.ts";
import { mapLamMutationHttpStatus } from "../../../_lib/mutation-response.ts";
import { parseLamJsonBody } from "../../../_lib/parse-json-body.ts";
import { notifyLamLeaveApplicationEvent } from "../../../_lib/notify-lam-events.ts";

type RouteContext = {
  params: Promise<{ applicationId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { applicationId } = await context.params;
  const parsedBody = await parseLamJsonBody(request);
  if (!parsedBody.ok) {
    return NextResponse.json(
      { ok: false, error: parsedBody.error },
      { status: 400 }
    );
  }

  const body = parsedBody.body;
  const result = await requestLamLeaveApplicationClarification(
    {
      ...(body as RequestLamLeaveApplicationClarificationInput),
      applicationId,
    },
    await createLamLeaveApplicationApprovalContextById(request, applicationId)
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
