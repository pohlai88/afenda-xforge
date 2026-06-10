import type { ApproveLamAttendanceCorrectionInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { approveLamAttendanceCorrection } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamCorrectionApprovalContextById } from "../../../_lib/context.ts";
import { mapLamMutationHttpStatus } from "../../../_lib/mutation-response.ts";
import { notifyLamAttendanceCorrectionEvent } from "../../../_lib/notify-lam-events.ts";

type RouteContext = {
  params: Promise<{ correctionId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { correctionId } = await context.params;
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

  const result = await approveLamAttendanceCorrection(
    {
      ...(body as ApproveLamAttendanceCorrectionInput),
      correctionId,
    },
    await createLamCorrectionApprovalContextById(request, correctionId)
  );

  if (result.ok) {
    await notifyLamAttendanceCorrectionEvent({
      request,
      correctionId,
      kind: "approved",
      body,
    });
  }

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus(result),
  });
}
