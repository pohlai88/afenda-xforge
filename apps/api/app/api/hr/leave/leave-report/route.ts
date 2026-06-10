import type { ListLamLeaveReportQuery } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { listLamLeaveReportRecords } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext, getQuery } from "../_lib/context.ts";

export async function GET(request: Request) {
  const data = await listLamLeaveReportRecords(
    getQuery(request) as unknown as ListLamLeaveReportQuery,
    createLamReadContext(request)
  );

  return NextResponse.json(data);
}
