import { getLamLeaveEncashmentPolicyById } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext } from "../../_lib/context.ts";

export async function GET(
  request: Request,
  context: { params: Promise<{ policyId: string }> }
) {
  const { policyId } = await context.params;
  const data = await getLamLeaveEncashmentPolicyById(
    policyId,
    await createLamReadContext(request)
  );

  if (!data) {
    return NextResponse.json(
      { error: "Leave encashment policy not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
