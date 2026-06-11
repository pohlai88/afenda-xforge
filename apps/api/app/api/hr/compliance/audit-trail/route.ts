import { listComplianceAuditTrailRecords } from "@repo/features-employee-management-compliance-regulatory-tracking/server";
import { NextResponse } from "next/server";
import { createComplianceReadContext, getQuery } from "../_lib/context.ts";

export async function GET(request: Request) {
  const data = await listComplianceAuditTrailRecords(
    getQuery(request),
    await createComplianceReadContext(request)
  );

  return NextResponse.json(data);
}
