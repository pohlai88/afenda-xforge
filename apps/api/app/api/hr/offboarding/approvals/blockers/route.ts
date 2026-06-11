import { listOffboardingApprovalBlockers } from "@repo/features-employee-management-offboarding-exit-management/server";
import { NextResponse } from "next/server";
import { createOffboardingReadContext, getQuery } from "../../_lib/context.ts";

export async function GET(request: Request) {
  const data = await listOffboardingApprovalBlockers(
    getQuery(request),
    await createOffboardingReadContext(request)
  );

  return NextResponse.json(data);
}
