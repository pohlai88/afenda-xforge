import { verifyComplianceEvidenceArtifact } from "@repo/features-employee-management-compliance-regulatory-tracking/server";
import { NextResponse } from "next/server";
import { createComplianceWriteContext } from "../../../_lib/context.ts";

type RouteContext = {
  params: Promise<{
    evidenceId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { evidenceId } = await context.params;
  const body = await request.json();
  const result = await verifyComplianceEvidenceArtifact(
    {
      ...body,
      evidenceId,
    },
    createComplianceWriteContext(request)
  );

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
