import { listEmployeeSelfservicePortalTasksQuerySchema } from "@repo/features-employee-management-employee-selfservice-portal/contract";
import {
  listEmployeeSelfservicePortalTasks,
  recordEmployeeSelfservicePortalAuditEvent,
} from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";

import { createEmployeeSelfservicePortalReadContext } from "../_lib/context.ts";
import {
  ensureEmployeeSelfservicePortalActorReadAccess,
  requireEmployeeSelfservicePortalActorEmployeeId,
} from "../_lib/http.ts";

const parseQuery = (request: Request) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page");
  const pageSize = url.searchParams.get("pageSize");

  return listEmployeeSelfservicePortalTasksQuerySchema.parse({
    category: url.searchParams.get("category") ?? undefined,
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
    const tasks = await listEmployeeSelfservicePortalTasks(
      parseQuery(request),
      essContext
    );

    recordEmployeeSelfservicePortalAuditEvent({
      action: "hr.employee-selfservice-portal.tasks.view",
      after: { count: tasks.length },
      context: essContext,
      employeeId: actorEmployeeId,
      metadata: { count: tasks.length },
      summary: `Viewed ${tasks.length} employee self-service tasks`,
      targetId: actorEmployeeId,
      targetType: "employee_tasks",
    });

    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid query parameters" },
      { status: 400 }
    );
  }
}
