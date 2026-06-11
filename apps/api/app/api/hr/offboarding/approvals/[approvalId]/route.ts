import {
  approveOffboardingApprovalStep,
  escalateOffboardingApprovalStep,
  getOffboardingApprovalById,
  rejectOffboardingApprovalStep,
  reopenOffboardingApprovalStep,
  submitOffboardingApprovalStep,
} from "@repo/features-employee-management-offboarding-exit-management/server";
import { NextResponse } from "next/server";
import {
  createOffboardingReadContext,
  createOffboardingWriteContext,
} from "../../_lib/context.ts";

type ApprovalActionRequest =
  | ({ action: "submit" } & Omit<
      Parameters<typeof submitOffboardingApprovalStep>[0],
      "approvalId"
    >)
  | ({ action: "approve" } & Omit<
      Parameters<typeof approveOffboardingApprovalStep>[0],
      "approvalId"
    >)
  | ({ action: "reject" } & Omit<
      Parameters<typeof rejectOffboardingApprovalStep>[0],
      "approvalId"
    >)
  | ({ action: "reopen" } & Omit<
      Parameters<typeof reopenOffboardingApprovalStep>[0],
      "approvalId"
    >)
  | ({ action: "escalate" } & Omit<
      Parameters<typeof escalateOffboardingApprovalStep>[0],
      "approvalId"
    >);

export async function GET(
  request: Request,
  context: { params: Promise<{ approvalId: string }> }
) {
  const { approvalId } = await context.params;
  const data = await getOffboardingApprovalById(
    approvalId,
    createOffboardingReadContext(request)
  );

  return NextResponse.json(data, { status: data ? 200 : 404 });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ approvalId: string }> }
) {
  const { approvalId } = await context.params;
  const body = (await request.json()) as ApprovalActionRequest;
  const writeContext = createOffboardingWriteContext(request);

  let result: Awaited<ReturnType<typeof submitOffboardingApprovalStep>>;
  switch (body.action) {
    case "submit":
      result = await submitOffboardingApprovalStep(
        { approvalId, ...body },
        writeContext
      );
      break;
    case "approve":
      result = await approveOffboardingApprovalStep(
        { approvalId, ...body },
        writeContext
      );
      break;
    case "reject":
      result = await rejectOffboardingApprovalStep(
        { approvalId, ...body },
        writeContext
      );
      break;
    case "reopen":
      result = await reopenOffboardingApprovalStep(
        { approvalId, ...body },
        writeContext
      );
      break;
    default:
      result = await escalateOffboardingApprovalStep(
        { approvalId, ...body },
        writeContext
      );
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
