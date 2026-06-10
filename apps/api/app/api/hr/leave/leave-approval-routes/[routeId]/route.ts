import { getLamLeaveApprovalRouteById } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext } from "../../_lib/context.ts";

type RouteContext = {
  params: Promise<{ routeId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { routeId } = await context.params;
  const data = await getLamLeaveApprovalRouteById(
    routeId,
    createLamReadContext(_request)
  );

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
