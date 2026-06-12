import { getEmployeeSelfservicePortalProfile } from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";
import { createEmployeeSelfservicePortalReadContext } from "../_lib/context.ts";
import {
  ensureEmployeeSelfservicePortalReadAccess,
  employeeSelfservicePortalReadDeniedResponse,
} from "../_lib/http.ts";

export async function GET(request: Request): Promise<Response> {
  const readContext = await createEmployeeSelfservicePortalReadContext(request);
  const denied = ensureEmployeeSelfservicePortalReadAccess(readContext);

  if (denied) {
    return denied;
  }

  const url = new URL(request.url);
  const profile = getEmployeeSelfservicePortalProfile(
    {
      employeeId: url.searchParams.get("employeeId") ?? undefined,
    },
    readContext
  );

  if (!profile) {
    return employeeSelfservicePortalReadDeniedResponse();
  }

  return NextResponse.json(profile);
}
