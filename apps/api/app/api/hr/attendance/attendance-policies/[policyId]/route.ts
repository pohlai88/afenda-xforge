import { getLamAttendancePolicyById } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext } from "../../_lib/context.ts";

export async function GET(
  request: Request,
  context: { params: Promise<{ policyId: string }> }
) {
  const { policyId } = await context.params;
  const data = await getLamAttendancePolicyById(
    policyId,
    await createLamReadContext(request)
  );

  if (!data) {
    return NextResponse.json(
      { error: "Attendance policy not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
