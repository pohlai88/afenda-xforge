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

type RouteContext = {
  params: Promise<{
    employeeId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const readContext = await createEmployeeLifecycleReadContext(request);
  const { employeeId } = await context.params;
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
}
