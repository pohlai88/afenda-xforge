import { getLamAttendanceRecordById } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext } from "../../_lib/context.ts";

type RouteContext = {
  params: Promise<{ recordId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { recordId } = await context.params;
  const data = await getLamAttendanceRecordById(
    recordId,
    await createLamReadContext(_request)
  );

  if (!data) {
    return NextResponse.json(
      { error: "Attendance record not found" },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(data);
}
