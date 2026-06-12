import {
  buildEmployeeLifecycleIntegrationChangeEvent,
  buildEmployeeLifecycleIntegrationSnapshot,
  buildEmployeeLifecycleTaskAttentionSnapshot,
} from "@repo/features-employee-management-employee-lifecycle-management/server";
import { NextResponse } from "next/server";
import {
  createEmployeeLifecycleReadContext,
  createEmployeeLifecycleRepositoryScope,
} from "../../_lib/context.ts";
import {
  ensureEmployeeLifecycleReadAccess,
  respondWithEmployeeLifecycleError,
} from "../../_lib/http.ts";

type RouteContext = {
  params: Promise<{
    employeeId: string;
  }>;
};

export async function GET(
  request: Request,
  routeContext: RouteContext
): Promise<Response> {
  try {
    const readContext = await createEmployeeLifecycleReadContext(request);
    const denied = ensureEmployeeLifecycleReadAccess(readContext);

    if (denied) {
      return denied;
    }

    const { employeeId } = await routeContext.params;
    const scope = createEmployeeLifecycleRepositoryScope(readContext);

    return NextResponse.json({
      snapshot: buildEmployeeLifecycleIntegrationSnapshot(
        employeeId,
        scope,
        readContext
      ),
      taskAttention: buildEmployeeLifecycleTaskAttentionSnapshot(
        employeeId,
        scope,
        readContext
      ),
      changeEvent: buildEmployeeLifecycleIntegrationChangeEvent(
        employeeId,
        scope,
        readContext
      ),
    });
  } catch (error) {
    return respondWithEmployeeLifecycleError(error);
  }
}
