import { rejectEmployeeSelfservicePortalProfileUpdateRequestInputSchema } from "@repo/features-employee-management-employee-selfservice-portal";
import { rejectEmployeeSelfservicePortalProfileUpdateRequest } from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";
import { createEmployeeSelfservicePortalWriteContext } from "../../../_lib/context.ts";
import { employeeSelfservicePortalErrorResponse } from "../../../_lib/errors.ts";

type RouteParams = {
  params: Promise<{
    requestId: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  const { requestId } = await params;

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
      rejectEmployeeSelfservicePortalProfileUpdateRequestInputSchema.parse({
        ...(body as Record<string, unknown>),
        requestId,
      });

    return NextResponse.json(
      rejectEmployeeSelfservicePortalProfileUpdateRequest(
        parsedInput,
        createEmployeeSelfservicePortalWriteContext(request)
      )
    );
  } catch (error) {
    return employeeSelfservicePortalErrorResponse(error);
  }
}
