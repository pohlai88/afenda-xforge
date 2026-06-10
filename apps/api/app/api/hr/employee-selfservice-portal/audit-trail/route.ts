import { listEmployeeSelfservicePortalAuditQuerySchema } from "@repo/features-employee-management-employee-selfservice-portal";
import { listEmployeeSelfservicePortalAuditTrailEvents } from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";
import { createEmployeeSelfservicePortalReadContext } from "../_lib/context.ts";
import { employeeSelfservicePortalErrorResponse } from "../_lib/errors.ts";

export function GET(request: Request): Response {
  try {
    const url = new URL(request.url);
    const query = listEmployeeSelfservicePortalAuditQuerySchema.parse({
      action: url.searchParams.get("action") ?? undefined,
      employeeId: url.searchParams.get("employeeId") ?? undefined,
      page: url.searchParams.get("page")
        ? Number(url.searchParams.get("page"))
        : undefined,
      pageSize: url.searchParams.get("pageSize")
        ? Number(url.searchParams.get("pageSize"))
        : undefined,
      targetType: url.searchParams.get("targetType") ?? undefined,
    });

    return NextResponse.json(
      listEmployeeSelfservicePortalAuditTrailEvents(
        query,
        createEmployeeSelfservicePortalReadContext(request)
      )
    );
  } catch (error) {
    return employeeSelfservicePortalErrorResponse(error);
  }
}
