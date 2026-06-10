import { listOffboardingAuditTrailQuerySchema } from "@repo/features-employee-management-offboarding-exit-management";
import { listOffboardingAuditTrailRecords } from "@repo/features-employee-management-offboarding-exit-management/server";
import { NextResponse } from "next/server";
import { createOffboardingReadContext, getQuery } from "../_lib/context.ts";
import {
  ensureOffboardingReadAccess,
  offboardingAuditTrailListResponseSchema,
  respondWithOffboardingError,
  validateOffboardingResponse,
} from "../_lib/http.ts";

export async function GET(request: Request) {
  try {
    const context = createOffboardingReadContext(request);
    const denied = ensureOffboardingReadAccess(context);
    if (denied) {
      return denied;
    }

    const query = listOffboardingAuditTrailQuerySchema.parse(getQuery(request));
    const data = validateOffboardingResponse(
      await listOffboardingAuditTrailRecords(query, context),
      offboardingAuditTrailListResponseSchema
    );

    return NextResponse.json(data);
  } catch (error) {
    return respondWithOffboardingError(error);
  }
}
