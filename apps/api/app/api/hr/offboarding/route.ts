import { openOffboardingCaseInputSchema } from "@repo/features-employee-management-offboarding-exit-management";
import {
  listOffboardingCases,
  openOffboardingCase,
} from "@repo/features-employee-management-offboarding-exit-management/server";
import { NextResponse } from "next/server";
import {
  createOffboardingReadContext,
  createOffboardingWriteContext,
  getOffboardingQuery,
  toOffboardingErrorResponse,
} from "./_lib/context.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const records = await listOffboardingCases(
      getOffboardingQuery(request),
      createOffboardingReadContext(request)
    );

    return NextResponse.json(records);
  } catch (error) {
    return toOffboardingErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = openOffboardingCaseInputSchema.parse(await request.json());
    const record = await openOffboardingCase(
      body,
      createOffboardingWriteContext(request)
    );

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return toOffboardingErrorResponse(error);
  }
}
