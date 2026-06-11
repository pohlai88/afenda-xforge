import { getComplianceOverviewSnapshot } from "@repo/features-employee-management-compliance-regulatory-tracking/server";
import { NextResponse } from "next/server";
import { createComplianceReadContext } from "../_lib/context.ts";

export async function GET(request: Request) {
  const data = await getComplianceOverviewSnapshot(
    await createComplianceReadContext(request)
  );

  return NextResponse.json(data);
}
