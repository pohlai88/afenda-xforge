import { getLamAttendanceCorrectionById } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamCorrectionsReadContext } from "../../_lib/context.ts";

type RouteContext = {
  params: Promise<{ correctionId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { correctionId } = await context.params;

  const data = await getLamAttendanceCorrectionById(
    correctionId,
    await createLamCorrectionsReadContext(request)
  );

  if (!data) {
    return NextResponse.json(
      { error: "Attendance correction not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
