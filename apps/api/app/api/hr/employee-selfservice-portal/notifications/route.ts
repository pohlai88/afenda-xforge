import { listEmployeeSelfservicePortalNotificationsQuerySchema } from "@repo/features-employee-management-employee-selfservice-portal/contract";
import {
  listEmployeeSelfservicePortalNotifications,
  recordEmployeeSelfservicePortalAuditEvent,
} from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";

import { createEmployeeSelfservicePortalReadContext } from "../_lib/context.ts";

const parseQuery = (request: Request) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page");
  const pageSize = url.searchParams.get("pageSize");

  return listEmployeeSelfservicePortalNotificationsQuerySchema.parse({
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
    search: url.searchParams.get("search") ?? undefined,
    severity: url.searchParams.get("severity") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  });
};

export async function GET(request: Request): Promise<Response> {
  try {
    const essContext = await createEmployeeSelfservicePortalReadContext(request);

    if (!(essContext.canRead && essContext.actorEmployeeId)) {
      return NextResponse.json([], { status: 200 });
    }

    const notifications = await listEmployeeSelfservicePortalNotifications(
      parseQuery(request),
      essContext
    );

    recordEmployeeSelfservicePortalAuditEvent({
      action: "hr.employee-selfservice-portal.notifications.view",
      after: { count: notifications.length },
      context: essContext,
      employeeId: essContext.actorEmployeeId,
      metadata: { count: notifications.length },
      summary: `Viewed ${notifications.length} self-service notifications`,
      targetId: essContext.actorEmployeeId,
      targetType: "employee_notifications",
    });

    return NextResponse.json(notifications);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid query parameters" },
      { status: 400 }
    );
  }
}
