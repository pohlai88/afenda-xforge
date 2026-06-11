import {
  createEmployeeSelfservicePortalProfileUpdateRequestInputSchema,
  listEmployeeSelfservicePortalProfileUpdateRequestsQuerySchema,
} from "@repo/features-employee-management-employee-selfservice-portal";
import {
  listEmployeeSelfservicePortalProfileUpdateRequestViews,
  submitEmployeeSelfservicePortalProfileUpdateRequest,
} from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";
import {
  createEmployeeSelfservicePortalReadContext,
  createEmployeeSelfservicePortalWriteContext,
} from "../_lib/context.ts";
import { employeeSelfservicePortalErrorResponse } from "../_lib/errors.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const query =
      listEmployeeSelfservicePortalProfileUpdateRequestsQuerySchema.parse({
        employeeId: url.searchParams.get("employeeId") ?? undefined,
        page: url.searchParams.get("page")
          ? Number(url.searchParams.get("page"))
          : undefined,
        pageSize: url.searchParams.get("pageSize")
          ? Number(url.searchParams.get("pageSize"))
          : undefined,
        status: url.searchParams.get("status") ?? undefined,
      });

    return NextResponse.json(
      listEmployeeSelfservicePortalProfileUpdateRequestViews(
        query,
        await createEmployeeSelfservicePortalReadContext(request)
      )
    );
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
    const parsedInput =
      createEmployeeSelfservicePortalProfileUpdateRequestInputSchema.parse(
        body as Record<string, unknown>
      );

    return NextResponse.json(
      submitEmployeeSelfservicePortalProfileUpdateRequest(
        parsedInput,
        await createEmployeeSelfservicePortalWriteContext(request)
      ),
      { status: 201 }
    );
  } catch (error) {
    return employeeSelfservicePortalErrorResponse(error);
  }
}
