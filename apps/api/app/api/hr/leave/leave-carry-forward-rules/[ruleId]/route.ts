import { getLamLeaveCarryForwardRuleById } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext } from "../../_lib/context.ts";

export async function GET(
  request: Request,
  context: { params: Promise<{ ruleId: string }> }
) {
  const { ruleId } = await context.params;
  const data = await getLamLeaveCarryForwardRuleById(
    ruleId,
    createLamReadContext(request)
  );

  if (!data) {
    return NextResponse.json(
      { error: "Leave carry-forward rule not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
