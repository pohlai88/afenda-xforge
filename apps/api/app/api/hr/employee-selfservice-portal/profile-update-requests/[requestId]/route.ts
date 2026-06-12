import { getEmployeeSelfservicePortalProfileUpdateRequestView } from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";
import { createEmployeeSelfservicePortalReadContext } from "../../_lib/context.ts";
import {
  ensureEmployeeSelfservicePortalReadAccess,
  employeeSelfservicePortalReadDeniedResponse,
} from "../../_lib/http.ts";

type RouteParams = {
  params: Promise<{
    requestId: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  const { requestId } = await params;
  const readContext = await createEmployeeSelfservicePortalReadContext(request);
  const denied = ensureEmployeeSelfservicePortalReadAccess(readContext);

  if (denied) {
    return denied;
  }

  const requestView = getEmployeeSelfservicePortalProfileUpdateRequestView(
    requestId,
    readContext
  );

  if (!requestView) {
    return employeeSelfservicePortalReadDeniedResponse();
  }

  return NextResponse.json(requestView);
}
