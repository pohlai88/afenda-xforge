import { createEmployeeSelfservicePortalInputSchema } from "@repo/features-employee-management-employee-selfservice-portal";
import {
  createEmployeeSelfservicePortal,
  listEmployeeSelfservicePortal,
} from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";
import {
  createEmployeeSelfservicePortalReadContext,
  createEmployeeSelfservicePortalWriteContext,
} from "./_lib/context.ts";
import { employeeSelfservicePortalErrorResponse } from "./_lib/errors.ts";

export function GET(request: Request): Response {
  try {
    const url = new URL(request.url);

    const records = listEmployeeSelfservicePortal(
      {
        employeeId: url.searchParams.get("employeeId") ?? undefined,
        page: url.searchParams.get("page")
          ? Number(url.searchParams.get("page"))
          : undefined,
        pageSize: url.searchParams.get("pageSize")
          ? Number(url.searchParams.get("pageSize"))
          : undefined,
        search: url.searchParams.get("search") ?? undefined,
        status:
          (url.searchParams.get("status") as
            | "active"
            | "archived"
            | "invited"
            | "suspended"
            | null) ?? undefined,
      },
      createEmployeeSelfservicePortalReadContext(request)
    );

    return NextResponse.json(records);
  } catch (error) {
    return employeeSelfservicePortalErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
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
    const parsedInput = createEmployeeSelfservicePortalInputSchema.parse(
      body as Record<string, unknown>
    );

    const record = createEmployeeSelfservicePortal(
      parsedInput,
      createEmployeeSelfservicePortalWriteContext(request)
    );

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return employeeSelfservicePortalErrorResponse(error);
  }
}
