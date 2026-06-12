import {
  listOffboardingApprovalRecords,
  upsertOffboardingApprovalStep,
} from "@repo/features-employee-management-offboarding-exit-management/server";
import { NextResponse } from "next/server";
import {
  createOffboardingReadContext,
  createOffboardingWriteContext,
  getQuery,
} from "../_lib/context.ts";
import {
  ensureOffboardingReadAccess,
  ensureOffboardingWriteAccess,
  mutationStatusFromResult,
  respondWithOffboardingError,
} from "../_lib/http.ts";

export async function GET(request: Request) {
  try {
    const context = await createOffboardingReadContext(request);
    const denied = ensureOffboardingReadAccess(context);

    if (denied) {
      return denied;
    }

    const data = await listOffboardingApprovalRecords(getQuery(request), context);

    return NextResponse.json(data);
  } catch (error) {
    return respondWithOffboardingError(error);
  }
}

export async function POST(request: Request) {
  try {
    const writeContext = await createOffboardingWriteContext(request);
    const denied = ensureOffboardingWriteAccess(writeContext);

    if (denied) {
      return denied;
    }

    const body = (await request.json()) as Parameters<
      typeof upsertOffboardingApprovalStep
    >[0];
    const result = await upsertOffboardingApprovalStep(body, writeContext);

    return NextResponse.json(result, {
      status: mutationStatusFromResult(result),
    });
  } catch (error) {
    return respondWithOffboardingError(error);
  }
}
