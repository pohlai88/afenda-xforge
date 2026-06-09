import { listHrOrgAuditQuerySchema } from "@repo/features-employee-management-organizational-chart-hierarchy";
import { listHrOrgStructureAuditTrailWindow } from "@repo/features-employee-management-organizational-chart-hierarchy/server";
import { NextResponse } from "next/server";
import { createHrOrgReadContext, getHrOrgQuery } from "../_lib/context.ts";

export async function GET(request: Request): Promise<Response> {
  const query = listHrOrgAuditQuerySchema.parse(getHrOrgQuery(request));
  const data = await listHrOrgStructureAuditTrailWindow(
    query,
    createHrOrgReadContext(request)
  );

  return NextResponse.json(data);
}
