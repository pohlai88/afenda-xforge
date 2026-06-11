import { exportComplianceReport } from "@repo/features-employee-management-compliance-regulatory-tracking/server";
import { NextResponse } from "next/server";
import { createComplianceWriteContext } from "../../_lib/context.ts";

export async function POST(request: Request) {
  const result = await exportComplianceReport(
    await request.json(),
    await createComplianceWriteContext(request)
  );

  if ("ok" in result) {
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  return new Response(result.content, {
    headers: {
      "Content-Disposition": `attachment; filename="${result.fileName}"`,
      "Content-Type": result.contentType,
    },
  });
}
