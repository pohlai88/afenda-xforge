import type { ListLamAttendanceSummaryQuery } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { listLamAttendanceSummaryRecords } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext, getQuery } from "../_lib/context.ts";

export async function GET(request: Request) {
  try {
    const data = await listLamAttendanceSummaryRecords(
      getQuery(request) as unknown as ListLamAttendanceSummaryQuery,
      await createLamReadContext(request)
    );

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid query parameters" },
      { status: 400 }
    );
  }
}
