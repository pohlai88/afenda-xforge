import { listLamPayrollReferencesRecords } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamPayrollReadContext, getQuery } from "../_lib/context.ts";

export async function GET(request: Request) {
  const data = await listLamPayrollReferencesRecords(
    getQuery(request),
    createLamPayrollReadContext(request)
  );

  return NextResponse.json(data);
}
