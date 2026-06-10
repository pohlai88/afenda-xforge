import { getOffboardingFoundationSnapshot } from "@repo/features-employee-management-offboarding-exit-management/server";
import { NextResponse } from "next/server";
import { createOffboardingReadContext } from "../_lib/context.ts";
import {
  ensureOffboardingReadAccess,
  respondWithOffboardingError,
  validateOffboardingOverview,
} from "../_lib/http.ts";

export async function GET(request: Request) {
  try {
    const context = createOffboardingReadContext(request);
    const denied = ensureOffboardingReadAccess(context);
    if (denied) {
      return denied;
    }

    const data = validateOffboardingOverview(
      await getOffboardingFoundationSnapshot(context)
    );

    return NextResponse.json(data);
  } catch (error) {
    return respondWithOffboardingError(error);
  }
}
