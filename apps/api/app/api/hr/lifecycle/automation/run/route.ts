import { runEmployeeLifecycleAutomationInputSchema } from "@repo/features-employee-management-employee-lifecycle-management";
import { runEmployeeLifecycleAutomation } from "@repo/features-employee-management-employee-lifecycle-management/server";
import { NextResponse } from "next/server";
import {
  createEmployeeLifecycleRepositoryScope,
  createEmployeeLifecycleWriteContext,
} from "../../_lib/context.ts";
import {
  ensureEmployeeLifecycleWriteAccess,
  respondWithEmployeeLifecycleError,
} from "../../_lib/http.ts";

export async function POST(request: Request): Promise<Response> {
  try {
    const context = await createEmployeeLifecycleWriteContext(request);
    const denied = ensureEmployeeLifecycleWriteAccess(context);

    if (denied) {
      return denied;
    }

    const body = runEmployeeLifecycleAutomationInputSchema.parse(
      (await request.json()) as unknown
    );
    const data = await runEmployeeLifecycleAutomation(
      {
        employeeId: body.employeeId,
        now: body.now,
        source: context.actorId ?? "api",
        employeeProfile: body.employeeProfile,
        enqueueNotifications: body.enqueueNotifications ?? true,
        triggerOffboardingHandoff: body.triggerOffboardingHandoff ?? true,
      },
      createEmployeeLifecycleRepositoryScope(context)
    );

    return NextResponse.json(data);
  } catch (error) {
    return respondWithEmployeeLifecycleError(error);
  }
}
