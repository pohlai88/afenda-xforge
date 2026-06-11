import { submitComplianceFiling } from "@repo/features-employee-management-compliance-regulatory-tracking/server";
import { NextResponse } from "next/server";
import { createComplianceWriteContext } from "../../../_lib/context.ts";

type RouteContext = {
  params: Promise<{
    filingId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { filingId } = await context.params;
  const body = await request.json();
  const result = await submitComplianceFiling(
    {
      ...body,
      filingId,
    },
    await createComplianceWriteContext(request)
  );

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
