import type { UpsertLamCompanyAttendanceSettingsInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import {
  getLamCompanyAttendanceSettings,
  upsertLamCompanyAttendanceSettings,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { mapLamMutationHttpStatus } from "../../leave/_lib/mutation-response.ts";
import {
  createLamReadContext,
  createLamWriteContext,
} from "../_lib/context.ts";

export async function GET(request: Request) {
  const settings = await getLamCompanyAttendanceSettings(
    createLamReadContext(request)
  );

  if (!settings) {
    return NextResponse.json(
      { ok: false, error: "Company context is required" },
      { status: 400 }
    );
  }

  return NextResponse.json(settings);
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

  const result = await upsertLamCompanyAttendanceSettings(
    body as UpsertLamCompanyAttendanceSettingsInput,
    createLamWriteContext(request)
  );

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus({ ...result, successStatus: 200 }),
  });
}
