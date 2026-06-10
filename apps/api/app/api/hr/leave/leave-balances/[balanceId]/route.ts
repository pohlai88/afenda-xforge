import { getLamLeaveBalanceById } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext } from "../../_lib/context.ts";

export async function GET(
  request: Request,
  context: { params: Promise<{ balanceId: string }> }
) {
  const { balanceId } = await context.params;
  const data = await getLamLeaveBalanceById(
    balanceId,
    createLamReadContext(request)
  );

  if (!data) {
    return NextResponse.json(
      { error: "Leave balance not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
