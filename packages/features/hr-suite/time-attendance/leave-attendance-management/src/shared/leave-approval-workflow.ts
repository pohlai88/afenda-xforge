export type { LamLeaveApprovalRoutingContext } from "../projector/approval-routing.ts";

import { resolveCurrentApprovalStep } from "../projector/approval-routing.ts";
import type {
  LamLeaveApplication,
  LamLeaveApprovalRoute,
  lamLeaveApprovalStepKindValues,
} from "../schema.ts";

export const lamLeaveApprovalRouteFieldLabels = {
  code: "Route Code",
  title: "Title",
  leaveTypeId: "Leave Type",
  minDurationDays: "Minimum Duration (Days)",
  maxDurationDays: "Maximum Duration (Days)",
  scope: "Scope",
  steps: "Approval Steps",
  active: "Active",
} as const;

export const lamLeaveApprovalStepKindLabels = {
  direct_manager: "Direct Manager",
  department_head: "Department Head",
  hr_officer: "HR Officer",
  named_approver: "Named Approver",
} as const satisfies Record<
  (typeof lamLeaveApprovalStepKindValues)[number],
  string
>;

export const lamLeaveApplicationWorkflowFieldLabels = {
  approvalRouteId: "Approval Route",
  currentStepOrder: "Current Step",
  approvedBy: "Approved By",
  returnedAt: "Returned At",
  returnedReason: "Returned Reason",
  status: "Workflow Status",
} as const;

export type LeaveApprovalProgress = {
  currentStep: LamLeaveApprovalRoute["steps"][number] | null;
  currentStepOrder: number | null;
  isFinalStep: boolean;
  nextStep: LamLeaveApprovalRoute["steps"][number] | null;
  nextStepOrder: number | null;
};

export const isLeaveApplicationInConfiguredWorkflow = (
  application: Pick<LamLeaveApplication, "approvalRouteId" | "status">
): boolean =>
  application.status === "pending_approval" ||
  Boolean(application.approvalRouteId);

export const resolveLeaveApprovalProgress = (args: {
  application: Pick<
    LamLeaveApplication,
    "approvalRouteId" | "currentStepOrder" | "status"
  >;
  route?: LamLeaveApprovalRoute | null;
}): LeaveApprovalProgress => {
  if (!(args.application.approvalRouteId && args.route)) {
    return {
      currentStep: null,
      currentStepOrder: null,
      isFinalStep: true,
      nextStep: null,
      nextStepOrder: null,
    };
  }

  const currentStepOrder = args.application.currentStepOrder ?? 1;
  const currentStep = resolveCurrentApprovalStep(args.route, currentStepOrder);
  const nextStepOrder = currentStepOrder + 1;
  const nextStep = resolveCurrentApprovalStep(args.route, nextStepOrder);

  return {
    currentStep,
    currentStepOrder,
    isFinalStep: !nextStep,
    nextStep,
    nextStepOrder: nextStep ? nextStepOrder : null,
  };
};

export const assertLeaveApplicationReadyForApprovalDecision = (
  application: Pick<
    LamLeaveApplication,
    "approvalRouteId" | "currentStepOrder" | "status"
  >
): void => {
  if (application.approvalRouteId && application.status === "submitted") {
    throw new Error(
      "Leave application has a configured approval route but is not pending approval"
    );
  }
};
