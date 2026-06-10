import { employeeLifecycleTransitionRequestSchema } from "@repo/features-employee-management-employee-lifecycle-management/contract";
import {
  getEmployeeLifecycleOverviewEntry,
  transitionEmployeeLifecycleState,
} from "@repo/features-employee-management-employee-lifecycle-management/server";
import { NextResponse } from "next/server";
import {
  createEmployeeLifecycleReadContext,
  createEmployeeLifecycleRepositoryScope,
  createEmployeeLifecycleWriteContext,
} from "../_lib/context.ts";

export async function POST(request: Request) {
  const context = createEmployeeLifecycleWriteContext(request);
  const body = employeeLifecycleTransitionRequestSchema.parse(
    await request.json()
  );
  const scope = createEmployeeLifecycleRepositoryScope(context);
  const nextState = transitionEmployeeLifecycleState(body, scope);
  const overview = getEmployeeLifecycleOverviewEntry(
    body.employeeId,
    scope,
    createEmployeeLifecycleReadContext(request)
  );

  return NextResponse.json({
    state: nextState,
    overview,
  });
}
