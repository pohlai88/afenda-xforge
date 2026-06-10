import { getLamLeaveTypeById } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext } from "../../_lib/context.ts";

type RouteContext = {
  params: Promise<{ leaveTypeId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { leaveTypeId } = await context.params;
  const record = await getLamLeaveTypeById(
    leaveTypeId,
    await createLamReadContext(_request)
  );

  if (!record) {
    return NextResponse.json(
      { error: "Leave type not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(record);
}
