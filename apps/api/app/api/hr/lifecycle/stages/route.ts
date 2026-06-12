import { listEmployeeLifecycleStageSummaries } from "@repo/features-employee-management-employee-lifecycle-management/server";
import { NextResponse } from "next/server";
import {
  createEmployeeLifecycleReadContext,
  createEmployeeLifecycleRepositoryScope,
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

    const data = listEmployeeLifecycleStageSummaries(
      createEmployeeLifecycleRepositoryScope(context),
      context
    );

    return NextResponse.json(data);
  } catch (error) {
    return respondWithEmployeeLifecycleError(error);
  }
}
