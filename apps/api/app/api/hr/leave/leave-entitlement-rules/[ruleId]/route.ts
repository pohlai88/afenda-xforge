import { getLamLeaveEntitlementRuleById } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext } from "../../_lib/context.ts";

type RouteContext = {
  params: Promise<{ ruleId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { ruleId } = await context.params;
  const record = await getLamLeaveEntitlementRuleById(
    ruleId,
    await createLamReadContext(_request)
  );

  if (!record) {
    return NextResponse.json(
      { error: "Leave entitlement rule not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(record);
}
