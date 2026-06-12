import { listOffboardingApprovalBlockers } from "@repo/features-employee-management-offboarding-exit-management/server";
import { NextResponse } from "next/server";
import {
  createOffboardingReadContext,
  getQuery,
} from "../../_lib/context.ts";
import {
  ensureOffboardingReadAccess,
  respondWithOffboardingError,
} from "../../_lib/http.ts";

export async function GET(request: Request) {
  try {
    const context = await createOffboardingReadContext(request);
    const denied = ensureOffboardingReadAccess(context);

    if (denied) {
      return denied;
    }

    const data = await listOffboardingApprovalBlockers(getQuery(request), context);

    return NextResponse.json(data);
  } catch (error) {
    return respondWithOffboardingError(error);
  }
}
