import { listHrOrgHeadcountQuerySchema } from "@repo/features-employee-management-organizational-chart-hierarchy";
import { listHrOrgHeadcountWindow } from "@repo/features-employee-management-organizational-chart-hierarchy/server";
import { NextResponse } from "next/server";
import { createHrOrgReadContext, getHrOrgQuery } from "../_lib/context.ts";

export async function GET(request: Request): Promise<Response> {
  const query = listHrOrgHeadcountQuerySchema.parse(getHrOrgQuery(request));
  const data = await listHrOrgHeadcountWindow(
    query,
    createHrOrgReadContext(request)
  );

  return NextResponse.json(data);
}
