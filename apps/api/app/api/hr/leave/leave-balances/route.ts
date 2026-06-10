import { listLamLeaveBalancesRecords } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext, getQuery } from "../_lib/context.ts";

export async function GET(request: Request) {
  const data = await listLamLeaveBalancesRecords(
    getQuery(request),
    await createLamReadContext(request)
  );

  return NextResponse.json(data);
}
