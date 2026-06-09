import { listComplianceRequirementsRecords } from "@repo/features-employee-management-compliance-regulatory-tracking/server";
import { NextResponse } from "next/server";
import { createComplianceReadContext, getQuery } from "../_lib/context.ts";

export async function GET(request: Request) {
  const data = await listComplianceRequirementsRecords(
    getQuery(request),
    createComplianceReadContext(request)
  );

  return NextResponse.json(data);
}
