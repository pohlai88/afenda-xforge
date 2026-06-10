import type { AmendLamLeaveApplicationInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { amendLamLeaveApplication } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamApprovalContext } from "../../../_lib/context.ts";
import { mapLamMutationHttpStatus } from "../../../_lib/mutation-response.ts";

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

  const result = await amendLamLeaveApplication(
    {
      ...body,
      applicationId,
    } as AmendLamLeaveApplicationInput,
    createLamApprovalContext(request)
  );

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus(result),
  });
}
