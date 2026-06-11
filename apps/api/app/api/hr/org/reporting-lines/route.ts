import { listHrOrgReportingRelationshipsQuerySchema } from "@repo/features-employee-management-organizational-chart-hierarchy";
import { listHrOrgReportingLinesWindow } from "@repo/features-employee-management-organizational-chart-hierarchy/server";
import { NextResponse } from "next/server";
import { createHrOrgReadContext, getHrOrgQuery } from "../_lib/context.ts";

export async function GET(request: Request): Promise<Response> {
  const query = listHrOrgReportingRelationshipsQuerySchema.parse(
    getHrOrgQuery(request)
  );
  const data = await listHrOrgReportingLinesWindow(
    query,
    await createHrOrgReadContext(request)
  );

  return NextResponse.json(data);
}
