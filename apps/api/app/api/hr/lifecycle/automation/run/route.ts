import { runEmployeeLifecycleAutomationInputSchema } from "@repo/features-employee-management-employee-lifecycle-management";
import { runEmployeeLifecycleAutomation } from "@repo/features-employee-management-employee-lifecycle-management/server";
import { NextResponse } from "next/server";
import {
  createEmployeeLifecycleRepositoryScope,
  createEmployeeLifecycleWriteContext,
} from "../../_lib/context.ts";

export async function POST(request: Request) {
  const context = await createEmployeeLifecycleWriteContext(request);
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
}
