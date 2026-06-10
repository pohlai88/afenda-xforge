import {
  listLamLeaveBlackoutPeriodsRecords,
  upsertLamLeaveBlackoutPeriod,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { mapLamMutationHttpStatus } from "../_lib/mutation-response.ts";
import {
  createLamReadContext,
  createLamWriteContext,
  getQuery,
} from "../_lib/context.ts";

export async function GET(request: Request) {
  const data = await listLamLeaveBlackoutPeriodsRecords(
    getQuery(request),
    createLamReadContext(request)
  );

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const isUpdate =
    typeof body === "object" &&
    body !== null &&
    "id" in body &&
    typeof body.id === "string" &&
    body.id.length > 0;
  const result = await upsertLamLeaveBlackoutPeriod(
    body,
    createLamWriteContext(request)
  );

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus({ ...result, successStatus: isUpdate ? 200 : 201 }),
  });
}
