import { getLamLeaveApplicationById } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext } from "../../_lib/context.ts";

export async function GET(
  request: Request,
  context: { params: Promise<{ applicationId: string }> }
) {
  const { applicationId } = await context.params;
  const data = await getLamLeaveApplicationById(
    applicationId,
    createLamReadContext(request)
  );

  if (!data) {
    return NextResponse.json(
      { error: "Leave application not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
