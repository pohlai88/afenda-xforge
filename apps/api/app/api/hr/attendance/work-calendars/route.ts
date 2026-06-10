import type { UpsertLamWorkCalendarInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import {
  listLamWorkCalendarsRecords,
  upsertLamWorkCalendar,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamConfigWriteContext } from "../../_lib/lam-governed-context.ts";
import {
  createLamReadContext,
  getQuery,
} from "../_lib/context.ts";
import { mapLamMutationHttpStatus } from "../../leave/_lib/mutation-response.ts";

export async function GET(request: Request) {
  const data = await listLamWorkCalendarsRecords(
    getQuery(request),
    await createLamReadContext(request)
  );

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  const isUpdate = typeof body.id === "string" && body.id.trim().length > 0;
  const result = await upsertLamWorkCalendar(
    body as UpsertLamWorkCalendarInput,
    await createLamConfigWriteContext(request)
  );

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus({
      ...result,
      successStatus: isUpdate ? 200 : 201,
    }),
  });
}
