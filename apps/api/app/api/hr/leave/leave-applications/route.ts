import {
  getLamLeaveApplicationById,
  listLamLeaveApplicationsRecords,
  submitLamLeaveApplication,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import type { SubmitLamLeaveApplicationInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { NextResponse } from "next/server";
import {
  bindLamEmployeeSubmitBody,
  createLamEmployeeSubmitReadContext,
  createLamReadContext,
  createLamWriteContext,
  getQuery,
} from "../_lib/context.ts";
import { mapLamMutationHttpStatus } from "../_lib/mutation-response.ts";
import { notifyLamLeaveApplicationEvent } from "../_lib/notify-lam-events.ts";

export async function GET(request: Request) {
  const data = await listLamLeaveApplicationsRecords(
    getQuery(request),
    createLamReadContext(request)
  );

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = bindLamEmployeeSubmitBody(
    request,
    (await request.json()) as SubmitLamLeaveApplicationInput
  );
  const writeContext = createLamWriteContext(request);
  const result = await submitLamLeaveApplication(body, writeContext);

  if (!result.ok) {
    return NextResponse.json(result, {
      status: mapLamMutationHttpStatus(result),
    });
  }

  const application = await getLamLeaveApplicationById(
    result.targetId,
    createLamEmployeeSubmitReadContext(request)
  );

  await notifyLamLeaveApplicationEvent({
    request,
    applicationId: result.targetId,
    kind: "submitted",
    body,
  });

  return NextResponse.json(
    {
      ...result,
      application,
    },
    { status: 201 }
  );
}
