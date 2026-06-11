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

export async function GET(request: Request) {
  const data = await listOffboardingApprovalRecords(
    getQuery(request),
    await createOffboardingReadContext(request)
  );

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Parameters<
    typeof upsertOffboardingApprovalStep
  >[0];
  const result = await upsertOffboardingApprovalStep(
    body,
    await createOffboardingWriteContext(request)
  );

  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
