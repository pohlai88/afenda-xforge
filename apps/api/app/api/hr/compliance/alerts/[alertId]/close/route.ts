import { closeComplianceAlert } from "@repo/features-employee-management-compliance-regulatory-tracking/server";
import { NextResponse } from "next/server";
import { createComplianceWriteContext } from "../../../_lib/context.ts";

type RouteContext = {
  params: Promise<{
    alertId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { alertId } = await context.params;
  const body = await request.json();
  const result = await closeComplianceAlert(
    {
      ...body,
      alertId,
    },
    await createComplianceWriteContext(request)
  );

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
