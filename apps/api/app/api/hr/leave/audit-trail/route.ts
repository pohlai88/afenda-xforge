import type { ListLamAuditTrailQuery } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { listLamAuditTrailRecords } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext, getQuery } from "../_lib/context.ts";

export async function GET(request: Request) {
  const data = await listLamAuditTrailRecords(
    getQuery(request) as unknown as ListLamAuditTrailQuery,
    createLamReadContext(request)
  );

  return NextResponse.json(data);
}
