import { getLamAttendanceExceptionsForRecord } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import {
  createLamAttendanceExceptionsReadContext,
  getQuery,
} from "../../_lib/context.ts";

type RouteContext = {
  params: Promise<{ recordId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { recordId } = await context.params;
  const data = await getLamAttendanceExceptionsForRecord(
    recordId,
    await createLamAttendanceExceptionsReadContext(request),
    getQuery(request)
  );

  return NextResponse.json(data);
}
