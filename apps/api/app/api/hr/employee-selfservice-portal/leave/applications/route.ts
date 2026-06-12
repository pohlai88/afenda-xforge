import { listEmployeeSelfservicePortalLeaveApplicationsQuerySchema } from "@repo/features-employee-management-employee-selfservice-portal/contract";
import {
  listEmployeeSelfservicePortalLeaveApplications,
  recordEmployeeSelfservicePortalAuditEvent,
} from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";

import { createEmployeeSelfservicePortalReadContext } from "../../_lib/context.ts";
import {
  ensureEmployeeSelfservicePortalActorReadAccess,
  requireEmployeeSelfservicePortalActorEmployeeId,
} from "../../_lib/http.ts";

const parseQuery = (request: Request) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page");
  const pageSize = url.searchParams.get("pageSize");

  return listEmployeeSelfservicePortalLeaveApplicationsQuerySchema.parse({
    leaveTypeCode: url.searchParams.get("leaveTypeCode") ?? undefined,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
    search: url.searchParams.get("search") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  });
};

export async function GET(request: Request): Promise<Response> {
  try {
    const essContext = await createEmployeeSelfservicePortalReadContext(request);
    const denied = ensureEmployeeSelfservicePortalActorReadAccess(essContext);

    if (denied) {
      return denied;
    }

    const actorEmployeeId =
      requireEmployeeSelfservicePortalActorEmployeeId(essContext);
    const items = listEmployeeSelfservicePortalLeaveApplications(
      parseQuery(request),
      essContext
    );

    recordEmployeeSelfservicePortalAuditEvent({
      action: "hr.employee-selfservice-portal.leave.applications.view",
      after: { count: items.length },
      context: essContext,
      employeeId: actorEmployeeId,
      metadata: { count: items.length },
      summary: `Viewed ${items.length} leave application history entries`,
      targetId: actorEmployeeId,
      targetType: "employee_leave_applications",
    });

    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid query parameters" },
      { status: 400 }
    );
  }
}
