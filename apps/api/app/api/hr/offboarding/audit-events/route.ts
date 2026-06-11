import { recordOffboardingAuditEventInputSchema } from "@repo/features-employee-management-offboarding-exit-management";
import { recordOffboardingAuditEvent } from "@repo/features-employee-management-offboarding-exit-management/server";
import { NextResponse } from "next/server";
import { createOffboardingWriteContext } from "../_lib/context.ts";
import {
  ensureOffboardingWriteAccess,
  mutationStatusFromResult,
  parseOffboardingRequestBody,
  respondWithOffboardingError,
} from "../_lib/http.ts";

export async function POST(request: Request) {
  try {
    const context = await createOffboardingWriteContext(request);
    const denied = ensureOffboardingWriteAccess(context);
    if (denied) {
      return denied;
    }

    const body = await parseOffboardingRequestBody(
      request,
      recordOffboardingAuditEventInputSchema
    );
    const result = await recordOffboardingAuditEvent(body, context);

    return NextResponse.json(result, {
      status: mutationStatusFromResult(result, 201),
    });
  } catch (error) {
    return respondWithOffboardingError(error);
  }
}
