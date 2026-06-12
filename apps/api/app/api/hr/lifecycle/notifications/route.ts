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
import {
  ensureEmployeeLifecycleReadAccess,
  ensureEmployeeLifecycleWriteAccess,
  respondWithEmployeeLifecycleError,
} from "../_lib/http.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const context = await createEmployeeLifecycleReadContext(request);
    const denied = ensureEmployeeLifecycleReadAccess(context);

    if (denied) {
      return denied;
    }

    const query = getEmployeeLifecycleQuery(request);
    const scope = createEmployeeLifecycleRepositoryScope(context);
    const data = listEnqueuedEmployeeLifecycleNotificationIntents(scope).filter(
      (intent) => !query.employeeId || intent.employeeId === query.employeeId
    );

    return NextResponse.json(data);
  } catch (error) {
    return respondWithEmployeeLifecycleError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const context = await createEmployeeLifecycleWriteContext(request);
    const denied = ensureEmployeeLifecycleWriteAccess(context);

    if (denied) {
      return denied;
    }

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
  } catch (error) {
    return respondWithEmployeeLifecycleError(error);
  }
}
