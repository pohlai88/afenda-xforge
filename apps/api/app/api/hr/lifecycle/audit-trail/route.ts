import { listEmployeeLifecycleAuditTrailEntries } from "@repo/features-employee-management-employee-lifecycle-management/server";
import { NextResponse } from "next/server";
import {
  createEmployeeLifecycleReadContext,
  createEmployeeLifecycleRepositoryScope,
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
    const data = listEmployeeLifecycleAuditTrailEntries(
      query.employeeId,
      createEmployeeLifecycleRepositoryScope(context),
      context
    );

    return NextResponse.json(data);
  } catch (error) {
    return respondWithEmployeeLifecycleError(error);
  }
}
