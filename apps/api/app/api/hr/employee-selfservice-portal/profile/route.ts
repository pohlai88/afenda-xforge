import { getEmployeeSelfservicePortalProfile } from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";
import { createEmployeeSelfservicePortalReadContext } from "../_lib/context.ts";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const profile = getEmployeeSelfservicePortalProfile(
    {
      employeeId: url.searchParams.get("employeeId") ?? undefined,
    },
    await createEmployeeSelfservicePortalReadContext(request)
  );

  if (!profile) {
    return NextResponse.json(
      { ok: false, error: "Profile not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(profile);
}
