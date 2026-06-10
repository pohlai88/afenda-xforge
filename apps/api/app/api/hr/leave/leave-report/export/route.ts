import type { ExportLamLeaveReportInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { exportLamLeaveReport } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { mapLamMutationHttpStatus } from "../../_lib/mutation-response.ts";
import { createLamWriteContext } from "../../_lib/context.ts";

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

  const result = await exportLamLeaveReport(
    body as ExportLamLeaveReportInput,
    await createLamWriteContext(request)
  );

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus(result),
  });
}
