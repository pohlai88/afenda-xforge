import { listEmployeeSelfservicePortalManagerApprovalInboxQuerySchema } from "@repo/features-employee-management-employee-selfservice-portal";
import {
  listEmployeeSelfservicePortalManagerApprovalInbox,
  recordEmployeeSelfservicePortalAuditEvent,
} from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";

import { createEmployeeSelfservicePortalReadContext } from "../_lib/context.ts";

const parseQuery = (request: Request) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page");
  const pageSize = url.searchParams.get("pageSize");

  return listEmployeeSelfservicePortalManagerApprovalInboxQuerySchema.parse({
    employeeId: url.searchParams.get("employeeId") ?? undefined,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
    requestType: url.searchParams.get("requestType") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  });
};

export async function GET(request: Request): Promise<Response> {
  try {
    const essContext = await createEmployeeSelfservicePortalReadContext(request);

    if (!(essContext.canRead && essContext.actorEmployeeId)) {
      return NextResponse.json([], { status: 200 });
    }

    const inboxItems = listEmployeeSelfservicePortalManagerApprovalInbox(
      parseQuery(request),
      essContext
    );

    recordEmployeeSelfservicePortalAuditEvent({
      action: "hr.employee-selfservice-portal.approval-inbox.view",
      after: { count: inboxItems.length },
      context: essContext,
      employeeId: essContext.actorEmployeeId,
      metadata: { count: inboxItems.length },
      summary: `Viewed ${inboxItems.length} manager approval inbox items`,
      targetId: essContext.actorEmployeeId,
      targetType: "manager_approval_inbox",
    });

    return NextResponse.json(inboxItems);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid query parameters" },
      { status: 400 }
    );
  }
}
