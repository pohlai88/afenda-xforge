import { listEmployeeSelfservicePortalRequestStatusesQuerySchema } from "@repo/features-employee-management-employee-selfservice-portal/contract";
import {
  listEmployeeSelfservicePortalRequestStatuses,
  recordEmployeeSelfservicePortalAuditEvent,
} from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";

import { createEmployeeSelfservicePortalReadContext } from "../_lib/context.ts";

const parseQuery = (request: Request) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page");
  const pageSize = url.searchParams.get("pageSize");

  return listEmployeeSelfservicePortalRequestStatusesQuerySchema.parse({
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
    requestType: url.searchParams.get("requestType") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  });
};

export function GET(request: Request): Response {
  try {
    const essContext = createEmployeeSelfservicePortalReadContext(request);

    if (!(essContext.canRead && essContext.actorEmployeeId)) {
      return NextResponse.json([], { status: 200 });
    }

    const items = listEmployeeSelfservicePortalRequestStatuses(
      parseQuery(request),
      essContext
    );

    recordEmployeeSelfservicePortalAuditEvent({
      action: "hr.employee-selfservice-portal.request-status.view",
      after: { count: items.length },
      context: essContext,
      employeeId: essContext.actorEmployeeId,
      metadata: { count: items.length },
      summary: `Viewed ${items.length} self-service request statuses`,
      targetId: essContext.actorEmployeeId,
      targetType: "employee_request_statuses",
    });

    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid query parameters" },
      { status: 400 }
    );
  }
}
