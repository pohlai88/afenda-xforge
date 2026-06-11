import { loadHrOrgOverviewSnapshot } from "@repo/features-employee-management-organizational-chart-hierarchy/server";
import { NextResponse } from "next/server";
import { createHrOrgReadContext } from "../_lib/context.ts";

export async function GET(request: Request): Promise<Response> {
  const data = await loadHrOrgOverviewSnapshot(await createHrOrgReadContext(request));

  return NextResponse.json(data);
}
