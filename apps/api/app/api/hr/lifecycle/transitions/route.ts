import {
  employeeLifecycleTransitionRequestSchema,
  transitionEmployeeLifecycleState,
} from "@repo/features-employee-management-employee-lifecycle-management";
import { getEmployeeLifecycleOverviewEntry } from "@repo/features-employee-management-employee-lifecycle-management/server";
import { NextResponse } from "next/server";
import {
  createEmployeeLifecycleReadContext,
  createEmployeeLifecycleRepositoryScope,
  createEmployeeLifecycleWriteContext,
} from "../_lib/context.ts";

export async function POST(request: Request) {
  const context = await createEmployeeLifecycleWriteContext(request);
  const body = employeeLifecycleTransitionRequestSchema.parse(
    await request.json()
  );
  const scope = createEmployeeLifecycleRepositoryScope(context);
  const nextState = transitionEmployeeLifecycleState(body, scope);
  const overview = getEmployeeLifecycleOverviewEntry(
    body.employeeId,
    scope,
    await createEmployeeLifecycleReadContext(request)
  );

  return NextResponse.json({
    state: nextState,
    overview,
  });
}
