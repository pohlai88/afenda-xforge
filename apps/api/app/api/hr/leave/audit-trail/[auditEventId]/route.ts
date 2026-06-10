import { getLamAuditTrailRecordById } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext } from "../../_lib/context.ts";

export async function GET(
  request: Request,
  context: { params: Promise<{ auditEventId: string }> }
) {
  const { auditEventId } = await context.params;
  const record = await getLamAuditTrailRecordById(
    auditEventId,
    await createLamReadContext(request)
  );

  if (!record) {
    return NextResponse.json({ error: "Audit event not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}
