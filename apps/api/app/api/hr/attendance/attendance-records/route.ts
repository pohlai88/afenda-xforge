import type { UpsertLamAttendanceRecordInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import {
  listLamAttendanceRecordsRecords,
  upsertLamAttendanceRecord,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import {
  createLamReadContext,
  createLamWriteContext,
  getQuery,
} from "../_lib/context.ts";
import { mapLamMutationHttpStatus } from "../_lib/mutation-response.ts";
import { parseLamJsonBody } from "../../leave/_lib/parse-json-body.ts";

// Context headers are populated by upstream auth middleware after actor authentication.
export async function GET(request: Request) {
  const data = await listLamAttendanceRecordsRecords(
    getQuery(request),
    createLamReadContext(request)
  );

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const parsedBody = await parseLamJsonBody(request);
  if (!parsedBody.ok) {
    return NextResponse.json(
      { ok: false, error: parsedBody.error },
      { status: 400 }
    );
  }

  const body = parsedBody.body;
  const isUpdate =
    typeof body === "object" &&
    body !== null &&
    "id" in body &&
    typeof body.id === "string" &&
    body.id.length > 0;
  const result = await upsertLamAttendanceRecord(
    body as UpsertLamAttendanceRecordInput,
    createLamWriteContext(request)
  );

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus({
      ...result,
      successStatus: isUpdate ? 200 : 201,
    }),
  });
}
