import { listEmployeeSelfservicePortalLeaveBalancesQuerySchema } from "@repo/features-employee-management-employee-selfservice-portal/contract";
import {
  listEmployeeSelfservicePortalLeaveBalances,
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

  return listEmployeeSelfservicePortalLeaveBalancesQuerySchema.parse({
    leaveTypeCode: url.searchParams.get("leaveTypeCode") ?? undefined,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
    search: url.searchParams.get("search") ?? undefined,
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
    const items = listEmployeeSelfservicePortalLeaveBalances(
      parseQuery(request),
      essContext
    );

    recordEmployeeSelfservicePortalAuditEvent({
      action: "hr.employee-selfservice-portal.leave.balances.view",
      after: { count: items.length },
      context: essContext,
      employeeId: actorEmployeeId,
      metadata: { count: items.length },
      summary: `Viewed ${items.length} leave balance entries`,
      targetId: actorEmployeeId,
      targetType: "employee_leave_balances",
    });

    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid query parameters" },
      { status: 400 }
    );
  }
}
