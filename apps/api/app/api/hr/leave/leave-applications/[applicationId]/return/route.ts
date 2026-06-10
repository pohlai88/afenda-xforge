import type { ReturnLamLeaveApplicationInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { returnLamLeaveApplication } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamApprovalContext } from "../../../_lib/context.ts";
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
  const result = await returnLamLeaveApplication(
    {
      ...(body as ReturnLamLeaveApplicationInput),
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
        typeof body.returnedReason === "string" ? body.returnedReason : null,
    });
  }

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus(result),
  });
}
