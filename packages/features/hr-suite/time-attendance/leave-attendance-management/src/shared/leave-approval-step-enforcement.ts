import { lamPolicyContextSchema } from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import { resolveCurrentApprovalStep } from "../projector/approval-routing.ts";
import { leaveAttendanceManagementCapabilities } from "../registry/capability.ts";
import type { LamLeaveApplication, LamLeaveApprovalRoute } from "../schema.ts";
import { stepSupportsHrFallback } from "./leave-approval-fallback-to-hr.ts";

export type LamApprovalWorkflowSubject = Pick<
  LamLeaveApplication,
  "approvalRouteId" | "currentStepOrder" | "status"
>;

export type ApprovalStepAuthorizationOutcome = {
  actorEmployeeId: string;
  viaPrimaryApprover: boolean;
  viaHrFallbackDelegation: boolean;
  viaHrOfficerStep: boolean;
  viaHrAdminBypass: boolean;
};

export const lamLeaveApprovalStepIdentityFieldLabels = {
  actorEmployeeId: "Actor Employee",
  resolvedStepApproverEmployeeIds: "Resolved Step Approvers",
  hrFallbackDelegated: "HR Fallback Delegated",
  resolvedHrFallbackApproverEmployeeIds: "Resolved HR Fallback Approvers",
} as const;

export const requiresLeaveApprovalStepIdentityEnforcement = (
  subject: LamApprovalWorkflowSubject
): boolean =>
  subject.status === "pending_approval" &&
  Boolean(subject.approvalRouteId?.trim());

const normalizeEmployeeIds = (ids?: readonly string[] | null): string[] =>
  (ids ?? []).map((id) => id.trim()).filter(Boolean);

export const resolveLeaveApprovalActorEmployeeId = (args: {
  context?: LamMutationContext;
  approvedBy?: string | null;
}): string => {
  const actorEmployeeId = args.context?.actorEmployeeId?.trim();
  const approvedBy = args.approvedBy?.trim();

  if (actorEmployeeId && approvedBy && actorEmployeeId !== approvedBy) {
    throw new Error(
      "approvedBy does not match authenticated actor employee identity"
    );
  }

  const resolved = actorEmployeeId || approvedBy;
  if (!resolved) {
    throw new Error(
      "Actor employee identity is required for approval workflow decisions"
    );
  }

  return resolved;
};

const hasHrOfficerWorkflowBypass = (context?: LamMutationContext): boolean => {
  const parsed = lamPolicyContextSchema.safeParse(context ?? {});
  if (!parsed.success) {
    return false;
  }

  const capabilities = parsed.data.grantedCapabilities ?? [];
  return (
    parsed.data.canWrite === true &&
    capabilities.includes(
      leaveAttendanceManagementCapabilities.leaveApplicationsApprove
    ) &&
    (capabilities.includes(
      leaveAttendanceManagementCapabilities.leaveEntitlementsWrite
    ) ||
      capabilities.includes(
        leaveAttendanceManagementCapabilities.leaveTypesWrite
      ))
  );
};

const isHrFallbackDelegationActive = (context?: LamMutationContext): boolean =>
  context?.hrFallbackDelegated === true;

const createAuthorizedOutcome = (
  actorEmployeeId: string,
  path: Omit<ApprovalStepAuthorizationOutcome, "actorEmployeeId">
): { authorized: true; outcome: ApprovalStepAuthorizationOutcome } => ({
  authorized: true,
  outcome: { actorEmployeeId, ...path },
});

const authorizeWithoutEnforcement = (args: {
  context?: LamMutationContext;
  approvedBy?: string | null;
}):
  | { authorized: true; outcome: ApprovalStepAuthorizationOutcome }
  | { authorized: false; reason: string } => {
  const actorEmployeeId =
    args.context?.actorEmployeeId?.trim() ||
    args.approvedBy?.trim() ||
    args.context?.actorId?.trim() ||
    "system";

  if (
    args.context?.actorEmployeeId?.trim() &&
    args.approvedBy?.trim() &&
    args.context.actorEmployeeId.trim() !== args.approvedBy.trim()
  ) {
    return {
      authorized: false,
      reason: "approvedBy does not match authenticated actor employee identity",
    };
  }

  return createAuthorizedOutcome(actorEmployeeId, {
    viaPrimaryApprover: true,
    viaHrFallbackDelegation: false,
    viaHrOfficerStep: false,
    viaHrAdminBypass: false,
  });
};

const buildPrimaryApproverIds = (args: {
  context?: LamMutationContext;
  approverRef?: string | null;
}): Set<string> => {
  const primaryApproverIds = new Set(
    normalizeEmployeeIds(args.context?.resolvedStepApproverEmployeeIds)
  );

  if (args.approverRef?.trim()) {
    primaryApproverIds.add(args.approverRef.trim());
  }

  return primaryApproverIds;
};

const authorizeHrOfficerStep = (args: {
  actorEmployeeId: string;
  context?: LamMutationContext;
  hrFallbackApproverIds: Set<string>;
}): { authorized: true; outcome: ApprovalStepAuthorizationOutcome } | null => {
  if (args.hrFallbackApproverIds.has(args.actorEmployeeId)) {
    return createAuthorizedOutcome(args.actorEmployeeId, {
      viaPrimaryApprover: false,
      viaHrFallbackDelegation: false,
      viaHrOfficerStep: true,
      viaHrAdminBypass: false,
    });
  }

  if (hasHrOfficerWorkflowBypass(args.context)) {
    return createAuthorizedOutcome(args.actorEmployeeId, {
      viaPrimaryApprover: false,
      viaHrFallbackDelegation: false,
      viaHrOfficerStep: false,
      viaHrAdminBypass: true,
    });
  }

  return null;
};

const authorizeHrFallbackStep = (args: {
  actorEmployeeId: string;
  context?: LamMutationContext;
  currentStep: LamLeaveApprovalRoute["steps"][number];
  hrFallbackApproverIds: Set<string>;
}):
  | { authorized: true; outcome: ApprovalStepAuthorizationOutcome }
  | { authorized: false; reason: string } => {
  if (!isHrFallbackDelegationActive(args.context)) {
    return {
      authorized: false,
      reason: `Actor is not authorized for approval workflow step "${args.currentStep.kind}" (order ${args.currentStep.order})`,
    };
  }

  if (args.hrFallbackApproverIds.size === 0) {
    return {
      authorized: false,
      reason:
        "HR fallback delegation is active but no resolved HR fallback approvers were supplied",
    };
  }

  if (args.hrFallbackApproverIds.has(args.actorEmployeeId)) {
    return createAuthorizedOutcome(args.actorEmployeeId, {
      viaPrimaryApprover: false,
      viaHrFallbackDelegation: true,
      viaHrOfficerStep: false,
      viaHrAdminBypass: false,
    });
  }

  return {
    authorized: false,
    reason:
      "HR fallback delegation is active but actor is not an authorized HR fallback approver",
  };
};

export const evaluateApprovalStepAuthorization = (args: {
  application: LamApprovalWorkflowSubject;
  route?: LamLeaveApprovalRoute | null;
  context?: LamMutationContext;
  approvedBy?: string | null;
}):
  | { authorized: true; outcome: ApprovalStepAuthorizationOutcome }
  | { authorized: false; reason: string } => {
  if (!requiresLeaveApprovalStepIdentityEnforcement(args.application)) {
    return authorizeWithoutEnforcement(args);
  }

  if (!args.route) {
    return {
      authorized: false,
      reason:
        "Approval route configuration was not found for this leave application",
    };
  }

  const currentStepOrder = args.application.currentStepOrder ?? 1;
  const currentStep = resolveCurrentApprovalStep(args.route, currentStepOrder);
  if (!currentStep) {
    return {
      authorized: false,
      reason: `Approval workflow step ${currentStepOrder} was not found on the configured route`,
    };
  }

  const actorEmployeeId = resolveLeaveApprovalActorEmployeeId({
    context: args.context,
    approvedBy: args.approvedBy,
  });
  const primaryApproverIds = buildPrimaryApproverIds({
    context: args.context,
    approverRef:
      currentStep.kind === "named_approver" ? currentStep.approverRef : null,
  });
  const hrFallbackApproverIds = new Set(
    normalizeEmployeeIds(args.context?.resolvedHrFallbackApproverEmployeeIds)
  );

  if (primaryApproverIds.has(actorEmployeeId)) {
    return createAuthorizedOutcome(actorEmployeeId, {
      viaPrimaryApprover: true,
      viaHrFallbackDelegation: false,
      viaHrOfficerStep: false,
      viaHrAdminBypass: false,
    });
  }

  if (currentStep.kind === "hr_officer") {
    const hrOfficerAuthorization = authorizeHrOfficerStep({
      actorEmployeeId,
      context: args.context,
      hrFallbackApproverIds,
    });
    if (hrOfficerAuthorization) {
      return hrOfficerAuthorization;
    }
  }

  if (stepSupportsHrFallback(currentStep)) {
    return authorizeHrFallbackStep({
      actorEmployeeId,
      context: args.context,
      currentStep,
      hrFallbackApproverIds,
    });
  }

  return {
    authorized: false,
    reason: `Actor is not authorized for approval workflow step "${currentStep.kind}" (order ${currentStep.order})`,
  };
};

export const requireActorAuthorizedForApprovalStep = (args: {
  application: LamApprovalWorkflowSubject;
  route?: LamLeaveApprovalRoute | null;
  context?: LamMutationContext;
  approvedBy?: string | null;
}): ApprovalStepAuthorizationOutcome => {
  const evaluation = evaluateApprovalStepAuthorization(args);
  if (!evaluation.authorized) {
    throw new Error(evaluation.reason);
  }
  return evaluation.outcome;
};

export const assertActorAuthorizedForApprovalStep = (args: {
  application: LamApprovalWorkflowSubject;
  route?: LamLeaveApprovalRoute | null;
  context?: LamMutationContext;
  approvedBy?: string | null;
}): void => {
  requireActorAuthorizedForApprovalStep(args);
};
