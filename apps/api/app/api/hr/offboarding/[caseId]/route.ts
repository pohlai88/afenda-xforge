import { getOffboardingCaseById } from "@repo/features-employee-management-offboarding-exit-management/server";
import { NextResponse } from "next/server";
import {
  createOffboardingReadContext,
  toOffboardingErrorResponse,
} from "../_lib/context.ts";

type RouteParams = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  const { caseId } = await params;

  try {
    const record = await getOffboardingCaseById(
      caseId,
      createOffboardingReadContext(request)
    );

    if (!record) {
      return NextResponse.json(
        { ok: false, error: "Offboarding case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    return toOffboardingErrorResponse(error);
  }
}
