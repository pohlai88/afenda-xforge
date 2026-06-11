import {
  listComplianceFilingsRecords,
  recordComplianceFiling,
} from "@repo/features-employee-management-compliance-regulatory-tracking/server";
import { NextResponse } from "next/server";
import {
  createComplianceReadContext,
  createComplianceWriteContext,
  getQuery,
} from "../_lib/context.ts";

export async function GET(request: Request) {
  const data = await listComplianceFilingsRecords(
    getQuery(request),
    await createComplianceReadContext(request)
  );

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const result = await recordComplianceFiling(
    await request.json(),
    await createComplianceWriteContext(request)
  );

  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
