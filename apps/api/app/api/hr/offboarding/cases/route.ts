import {
  listOffboardingCasesQuerySchema,
  openOffboardingCaseInputSchema,
} from "@repo/features-employee-management-offboarding-exit-management";
import {
  listOffboardingCaseRecords,
  openOffboardingCase,
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
  offboardingCaseListResponseSchema,
  parseOffboardingRequestBody,
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

    const query = listOffboardingCasesQuerySchema.parse(getQuery(request));
    const data = validateOffboardingResponse(
      await listOffboardingCaseRecords(query, context),
      offboardingCaseListResponseSchema
    );

    return NextResponse.json(data);
  } catch (error) {
    return respondWithOffboardingError(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = createOffboardingWriteContext(request);
    const denied = ensureOffboardingWriteAccess(context);
    if (denied) {
      return denied;
    }

    const body = await parseOffboardingRequestBody(
      request,
      openOffboardingCaseInputSchema
    );
    const result = await openOffboardingCase(body, context);

    return NextResponse.json(result, {
      status: mutationStatusFromResult(result, 201),
    });
  } catch (error) {
    return respondWithOffboardingError(error);
  }
}
