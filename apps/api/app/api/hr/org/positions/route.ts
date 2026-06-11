import { listHrOrgPositionsQuerySchema } from "@repo/features-employee-management-organizational-chart-hierarchy";
import { listHrOrgPositionsWindow } from "@repo/features-employee-management-organizational-chart-hierarchy/server";
import { NextResponse } from "next/server";
import { createHrOrgReadContext, getHrOrgQuery } from "../_lib/context.ts";

export async function GET(request: Request): Promise<Response> {
  const query = listHrOrgPositionsQuerySchema.parse(getHrOrgQuery(request));
  const data = await listHrOrgPositionsWindow(
    query,
    await createHrOrgReadContext(request)
  );

  return NextResponse.json(data);
}
