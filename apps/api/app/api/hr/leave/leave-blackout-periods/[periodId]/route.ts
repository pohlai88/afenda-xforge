import { getLamLeaveBlackoutPeriodById } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext } from "../../_lib/context.ts";

type RouteContext = {
  params: Promise<{ periodId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { periodId } = await context.params;
  const period = await getLamLeaveBlackoutPeriodById(
    periodId,
    createLamReadContext(request)
  );

  if (!period) {
    return NextResponse.json(
      { error: "Leave blackout period not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(period);
}
