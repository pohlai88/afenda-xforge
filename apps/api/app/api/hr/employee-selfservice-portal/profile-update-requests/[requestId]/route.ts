import { getEmployeeSelfservicePortalProfileUpdateRequestView } from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";
import { createEmployeeSelfservicePortalReadContext } from "../../_lib/context.ts";

type RouteParams = {
  params: Promise<{
    requestId: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  const { requestId } = await params;
  const requestView = getEmployeeSelfservicePortalProfileUpdateRequestView(
    requestId,
    await createEmployeeSelfservicePortalReadContext(request)
  );

  if (!requestView) {
    return NextResponse.json(
      { ok: false, error: "Profile update request not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(requestView);
}
