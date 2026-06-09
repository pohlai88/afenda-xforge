import { listHrOrgUnitsQuerySchema } from "@repo/features-employee-management-organizational-chart-hierarchy";
import { listHrOrgUnitsWindow } from "@repo/features-employee-management-organizational-chart-hierarchy/server";
import { NextResponse } from "next/server";
import { createHrOrgReadContext, getHrOrgQuery } from "../_lib/context.ts";

export async function GET(request: Request): Promise<Response> {
  const query = listHrOrgUnitsQuerySchema.parse(getHrOrgQuery(request));
  const data = await listHrOrgUnitsWindow(
    query,
    createHrOrgReadContext(request)
  );

  return NextResponse.json(data);
}
