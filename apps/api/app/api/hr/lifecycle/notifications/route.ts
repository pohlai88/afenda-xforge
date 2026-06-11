import {
  enqueueEmployeeLifecycleNotificationIntents,
  evaluateEmployeeLifecycleNotificationIntents,
  listEnqueuedEmployeeLifecycleNotificationIntents,
} from "@repo/features-employee-management-employee-lifecycle-management/server";
import { NextResponse } from "next/server";
import {
  createEmployeeLifecycleReadContext,
  createEmployeeLifecycleRepositoryScope,
  createEmployeeLifecycleWriteContext,
  getEmployeeLifecycleQuery,
} from "../_lib/context.ts";

export async function GET(request: Request) {
  const context = await createEmployeeLifecycleReadContext(request);
  const query = getEmployeeLifecycleQuery(request);
  const scope = createEmployeeLifecycleRepositoryScope(context);
  const data = listEnqueuedEmployeeLifecycleNotificationIntents(scope).filter(
    (intent) => !query.employeeId || intent.employeeId === query.employeeId
  );

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const context = await createEmployeeLifecycleWriteContext(request);
  const body = (await request.json()) as Record<string, unknown>;
  const scope = createEmployeeLifecycleRepositoryScope(context);
  const employeeId =
    typeof body.employeeId === "string" ? body.employeeId : undefined;
  const data = enqueueEmployeeLifecycleNotificationIntents(
    evaluateEmployeeLifecycleNotificationIntents(
      {
        employeeId,
      },
      scope
    ),
    scope
  );

  return NextResponse.json(data);
}
