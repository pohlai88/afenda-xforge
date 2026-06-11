import { listHrOrgVacanciesQuerySchema } from "@repo/features-employee-management-organizational-chart-hierarchy";
import { listHrVacantPositionsWindow } from "@repo/features-employee-management-organizational-chart-hierarchy/server";
import { NextResponse } from "next/server";
import { createHrOrgReadContext, getHrOrgQuery } from "../_lib/context.ts";

export async function GET(request: Request): Promise<Response> {
  const query = listHrOrgVacanciesQuerySchema.parse(getHrOrgQuery(request));
  const data = await listHrVacantPositionsWindow(
    query,
    await createHrOrgReadContext(request)
  );

  return NextResponse.json(data);
}
