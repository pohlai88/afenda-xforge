import {
  getEmployeeSelfservicePortal,
  updateEmployeeSelfservicePortal,
} from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";
import {
  createEmployeeSelfservicePortalReadContext,
  createEmployeeSelfservicePortalWriteContext,
} from "../_lib/context.ts";
import { employeeSelfservicePortalErrorResponse } from "../_lib/errors.ts";
import {
  ensureEmployeeSelfservicePortalReadAccess,
  employeeSelfservicePortalReadDeniedResponse,
} from "../_lib/http.ts";

type RouteParams = {
  params: Promise<{
    portalRecordId: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  const { portalRecordId } = await params;
  const readContext = await createEmployeeSelfservicePortalReadContext(request);
  const denied = ensureEmployeeSelfservicePortalReadAccess(readContext);

  if (denied) {
    return denied;
  }

  const record = getEmployeeSelfservicePortal(portalRecordId, readContext);

  if (!record) {
    return employeeSelfservicePortalReadDeniedResponse();
  }

  return NextResponse.json(record);
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  const { portalRecordId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  try {
    const record = updateEmployeeSelfservicePortal(
      {
        ...(body as Record<string, unknown>),
        id: portalRecordId,
      },
      await createEmployeeSelfservicePortalWriteContext(request)
    );

    return NextResponse.json(record);
  } catch (error) {
    return employeeSelfservicePortalErrorResponse(error);
  }
}
