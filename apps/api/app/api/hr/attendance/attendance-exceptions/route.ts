import { listLamAttendanceExceptionsRecords } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import {
  createLamAttendanceExceptionsReadContext,
  getQuery,
} from "../_lib/context.ts";

export async function GET(request: Request) {
  const data = await listLamAttendanceExceptionsRecords(
    getQuery(request),
    await createLamAttendanceExceptionsReadContext(request)
  );

  return NextResponse.json(data);
}
