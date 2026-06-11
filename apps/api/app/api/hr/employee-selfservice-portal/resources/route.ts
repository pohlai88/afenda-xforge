import { listEmployeeSelfservicePortalResourcesQuerySchema } from "@repo/features-employee-management-employee-selfservice-portal/contract";
import {
  listEmployeeSelfservicePortalResources,
  recordEmployeeSelfservicePortalAuditEvent,
} from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";

import { createEmployeeSelfservicePortalReadContext } from "../_lib/context.ts";

const parseQuery = (request: Request) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page");
  const pageSize = url.searchParams.get("pageSize");

  return listEmployeeSelfservicePortalResourcesQuerySchema.parse({
    category: url.searchParams.get("category") ?? undefined,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
    search: url.searchParams.get("search") ?? undefined,
  });
};

export async function GET(request: Request): Promise<Response> {
  try {
    const essContext = await createEmployeeSelfservicePortalReadContext(request);

    if (!(essContext.canRead && essContext.actorEmployeeId)) {
      return NextResponse.json([], { status: 200 });
    }

    const resources = listEmployeeSelfservicePortalResources(
      parseQuery(request),
      essContext
    );

    recordEmployeeSelfservicePortalAuditEvent({
      action: "hr.employee-selfservice-portal.resources.view",
      after: {
        count: resources.length,
      },
      context: essContext,
      employeeId: essContext.actorEmployeeId,
      metadata: {
        count: resources.length,
      },
      summary: `Viewed ${resources.length} HR resource-center items`,
      targetId: essContext.actorEmployeeId,
      targetType: "employee_resources",
    });

    return NextResponse.json(resources);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid query parameters" },
      { status: 400 }
    );
  }
}
