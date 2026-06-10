import type { LamLeaveApprovalRouteStep } from "../schema.ts";

export const lamLeaveApprovalFallbackToHrFieldLabels = {
  fallbackToHr: "Fallback to HR When Unavailable",
  hrFallbackDelegated: "HR Fallback Delegated",
  resolvedHrFallbackApproverEmployeeIds: "Resolved HR Fallback Approvers",
} as const;

export const lamLeaveApprovalFallbackToHrRules = {
  eligibleStepKinds: [
    "direct_manager",
    "department_head",
    "named_approver",
  ] as const,
  requiresDelegationFlag:
    "Orchestration must set hrFallbackDelegated when the primary approver is unavailable.",
  requiresHrFallbackApprovers:
    "Actor must appear in resolvedHrFallbackApproverEmployeeIds during HR fallback.",
  hrOfficerStepExclusion:
    "fallbackToHr is not valid on hr_officer steps because the step is already HR-owned.",
} as const;

export type LamLeaveApprovalFallbackEligibleStepKind =
  (typeof lamLeaveApprovalFallbackToHrRules.eligibleStepKinds)[number];

export const isHrFallbackEligibleStepKind = (
  kind: LamLeaveApprovalRouteStep["kind"]
): kind is LamLeaveApprovalFallbackEligibleStepKind =>
  (
    lamLeaveApprovalFallbackToHrRules.eligibleStepKinds as readonly string[]
  ).includes(kind);

export const stepSupportsHrFallback = (
  step: Pick<LamLeaveApprovalRouteStep, "kind" | "fallbackToHr">
): boolean =>
  Boolean(step.fallbackToHr) && isHrFallbackEligibleStepKind(step.kind);

export const assertRouteStepHrFallbackConfiguration = (
  step: Pick<LamLeaveApprovalRouteStep, "order" | "kind" | "fallbackToHr">
): void => {
  if (step.fallbackToHr && step.kind === "hr_officer") {
    throw new Error(
      `Step ${step.order} with kind "hr_officer" cannot use fallbackToHr`
    );
  }
};
