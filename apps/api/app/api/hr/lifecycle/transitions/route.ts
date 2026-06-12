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
import {
  ensureEmployeeLifecycleReadAccess,
  ensureEmployeeLifecycleWriteAccess,
  respondWithEmployeeLifecycleError,
} from "../_lib/http.ts";

export async function POST(request: Request): Promise<Response> {
  try {
    const context = await createEmployeeLifecycleWriteContext(request);
    const denied = ensureEmployeeLifecycleWriteAccess(context);
    if (denied) {
      return denied;
    }

    const body = employeeLifecycleTransitionRequestSchema.parse(
      await request.json()
    );
    const scope = createEmployeeLifecycleRepositoryScope(context);
    const nextState = transitionEmployeeLifecycleState(body, scope);
    const overview = getEmployeeLifecycleOverviewEntry(
      body.employeeId,
      scope,
      context
    );

    return NextResponse.json({
      state: nextState,
      overview,
    });
  } catch (error) {
    return respondWithEmployeeLifecycleError(error);
  }
}
