import type { SubmitLamAttendanceCorrectionInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import {
  listLamAttendanceCorrectionsRecords,
  submitLamAttendanceCorrection,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import {
  bindLamEmployeeSubmitBody,
  createLamCorrectionsReadContext,
  createLamCorrectionWriteContext,
  getQuery,
} from "../_lib/context.ts";
import { mapLamMutationHttpStatus } from "../_lib/mutation-response.ts";
import { notifyLamAttendanceCorrectionEvent } from "../_lib/notify-lam-events.ts";

export async function GET(request: Request) {
  const data = await listLamAttendanceCorrectionsRecords(
    getQuery(request),
    createLamCorrectionsReadContext(request)
  );

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const parsedBody = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!parsedBody) {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  const body = bindLamEmployeeSubmitBody(
    request,
    parsedBody as SubmitLamAttendanceCorrectionInput
  );
  const result = await submitLamAttendanceCorrection(
    body,
    createLamCorrectionWriteContext(request)
  );

  if (result.ok) {
    await notifyLamAttendanceCorrectionEvent({
      request,
      correctionId: result.targetId,
      kind: "submitted",
      body,
    });
  }

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus({ ...result, successStatus: 201 }),
  });
}
