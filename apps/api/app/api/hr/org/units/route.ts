import { listHrOrgUnitsQuerySchema } from "@repo/features-employee-management-organizational-chart-hierarchy";
import { listHrOrgUnitsWindow } from "@repo/features-employee-management-organizational-chart-hierarchy/server";
import { NextResponse } from "next/server";
import { createHrOrgReadContext, getHrOrgQuery } from "../_lib/context.ts";
import {
  ensureHrOrgReadAccess,
  ensureHrOrgWriteAccess,
  respondWithHrOrgError,
} from "../_lib/http.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const context = await createHrOrgReadContext(request);
    const denied = ensureHrOrgReadAccess(context);
    if (denied) {
      return denied;
    }

    const query = listHrOrgUnitsQuerySchema.parse(getHrOrgQuery(request));
    const data = await listHrOrgUnitsWindow(query, context);

    return NextResponse.json(data);
  } catch (error) {
    return respondWithHrOrgError(error);
  }
}
