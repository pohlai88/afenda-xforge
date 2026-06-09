import { listComplianceCalendarItemsRecords } from "@repo/features-employee-management-compliance-regulatory-tracking/server";
import { NextResponse } from "next/server";
import { createComplianceReadContext, getQuery } from "../_lib/context.ts";

export async function GET(request: Request) {
  const data = await listComplianceCalendarItemsRecords(
    getQuery(request),
    createComplianceReadContext(request)
  );

  return NextResponse.json(data);
}
