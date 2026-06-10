import "server-only";

import type {
  ApproveLamLeaveApplicationInput,
  LamMutationResult,
  RejectLamLeaveApplicationInput,
  RequestLamLeaveApplicationClarificationInput,
  ReturnLamLeaveApplicationInput,
} from "../contracts/index.ts";
import {
  approveLamLeaveApplicationInputSchema,
  leaveAttendanceManagementAuditEvents,
  rejectLamLeaveApplicationInputSchema,
  requestLamLeaveApplicationClarificationInputSchema,
  returnLamLeaveApplicationInputSchema,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireStrictLamApprovalAccess,
  requireLamEmployeeMutationScope,
} from "../execution.ts";
import { resolveCurrentApprovalStep } from "../projector/approval-routing.ts";
import {
  findActiveLeaveTypeForApplication,
  shouldReserveLeaveBalance,
} from "../projector/unpaid-leave-payroll-references.ts";
import type { LamRepositoryState } from "../repository.ts";
import { mutateLamRepository, upsertLamEntity } from "../repository.ts";
import type { LamLeaveApplication } from "../schema.ts";
import { lamLeaveApplicationSchema, lamWriteContextSchema } from "../schema.ts";
import {
  finalizeApprovedLeaveApplicationBalanceIfRequired,
  releaseLeaveApplicationPendingBalance,
} from "../shared/leave-application-balance.ts";
import type { ApprovalStepAuthorizationOutcome } from "../shared/leave-approval-step-enforcement.ts";
import { requireActorAuthorizedForApprovalStep } from "../shared/leave-approval-step-enforcement.ts";
import {
  assertLeaveApplicationReadyForApprovalDecision,
  resolveLeaveApprovalProgress,
} from "../shared/leave-approval-workflow.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave application decision failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error(
      "Company context is required for leave application decisions"
    );
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

const APPROVABLE_STATUSES = ["submitted", "pending_approval"] as const;
const TERMINAL_DECISION_STATUSES = ["submitted", "pending_approval"] as const;

const assertApprovableStatus = (application: LamLeaveApplication): void => {
  if (
    !APPROVABLE_STATUSES.includes(
      application.status as (typeof APPROVABLE_STATUSES)[number]
    )
  ) {
    throw new Error(
      `Leave application must be submitted or pending approval to approve; current status is "${application.status}"`
    );
  }
};

const assertDecisionStatus = (application: LamLeaveApplication): void => {
  if (
    !TERMINAL_DECISION_STATUSES.includes(
      application.status as (typeof TERMINAL_DECISION_STATUSES)[number]
    )
  ) {
    throw new Error(
      `Leave application must be submitted or pending approval; current status is "${application.status}"`
    );
  }
};

const assertDecisionActorForWorkflowStep = (args: {
  draft: LamRepositoryState;
  existing: LamLeaveApplication;
  context?: LamMutationContext;
  approvedBy?: string | null;
}): ApprovalStepAuthorizationOutcome => {
  const route = args.existing.approvalRouteId
    ? args.draft.leaveApprovalRoutes.find(
        (entry) => entry.id === args.existing.approvalRouteId
      )
    : null;

  return requireActorAuthorizedForApprovalStep({
    application: args.existing,
    route,
    context: args.context,
    approvedBy: args.approvedBy,
  });
};

const buildApprovalAuthorizationAuditMetadata = (
  authorization: ApprovalStepAuthorizationOutcome
) => ({
  viaPrimaryApprover: authorization.viaPrimaryApprover,
  viaHrFallbackDelegation: authorization.viaHrFallbackDelegation,
  viaHrOfficerStep: authorization.viaHrOfficerStep,
  viaHrAdminBypass: authorization.viaHrAdminBypass,
});

const applyApproveDecision = (args: {
  draft: LamRepositoryState;
  companyId: string;
  context?: LamMutationContext;
  existing: LamLeaveApplication;
  validInput: ApproveLamLeaveApplicationInput;
  approverId: string;
  decidedAt: Date;
  authorization: ApprovalStepAuthorizationOutcome;
}): LamLeaveApplication => {
  assertLeaveApplicationReadyForApprovalDecision(args.existing);

  const route = args.existing.approvalRouteId
    ? args.draft.leaveApprovalRoutes.find(
        (entry) => entry.id === args.existing.approvalRouteId
      )
    : null;
  const currentStepOrder = args.existing.currentStepOrder ?? 1;
  const nextStep = route
    ? resolveCurrentApprovalStep(route, currentStepOrder + 1)
    : null;
  const isFinalApproval = !nextStep;

  const approved = lamLeaveApplicationSchema.parse({
    ...args.existing,
    status: isFinalApproval ? "approved" : "pending_approval",
    currentStepOrder: isFinalApproval
      ? args.existing.currentStepOrder
      : currentStepOrder + 1,
    approvedBy: args.approverId,
    approvedAt: isFinalApproval ? args.decidedAt : args.existing.approvedAt,
    updatedAt: args.decidedAt,
  });

  args.draft.leaveApplications = upsertLamEntity(
    args.draft.leaveApplications,
    approved
  );

  if (isFinalApproval) {
    const leaveType = findActiveLeaveTypeForApplication(
      args.draft,
      approved,
      args.companyId
    );
    finalizeApprovedLeaveApplicationBalanceIfRequired({
      draft: args.draft,
      companyId: args.companyId,
      context: args.context,
      application: approved,
      leaveType,
    });
  }

  const currentStep = route
    ? resolveCurrentApprovalStep(route, currentStepOrder)
    : null;
  const workflowProgress = resolveLeaveApprovalProgress({
    application: approved,
    route: route ?? null,
  });
  const nextResolvedStep = route
    ? resolveCurrentApprovalStep(route, approved.currentStepOrder ?? 1)
    : null;

  args.draft.auditEvents.push(
    createLamMutationAuditEvent({
      companyId: args.companyId,
      actorId: normalizeLamMutationActorId(args.context),
      action: leaveAttendanceManagementAuditEvents.leaveApplicationApproved,
      entityType: "leave_application",
      entityId: approved.id,
      summary: isFinalApproval
        ? `Leave application approved for employee ${args.existing.employeeId}`
        : `Leave application advanced to approval step ${approved.currentStepOrder}`,
      metadata: buildLamAuditMetadata({
        employeeId: args.existing.employeeId,
        leaveTypeId: args.existing.leaveTypeId,
        approvalRouteId: args.existing.approvalRouteId,
        approvalRouteCode: route?.code,
        approvedBy: args.approverId,
        isFinalApproval,
        stepOrderBefore: currentStepOrder,
        stepOrderAfter: approved.currentStepOrder,
        stepKindBefore: currentStep?.kind,
        stepKindAfter: nextResolvedStep?.kind,
        nextStepOrder: workflowProgress.nextStepOrder,
        isFinalStep: workflowProgress.isFinalStep,
        notes: args.validInput.notes,
        ...buildApprovalAuthorizationAuditMetadata(args.authorization),
      }),
      before: args.existing,
      after: approved,
    })
  );

  return approved;
};

export async function approveLamLeaveApplication(
  input: ApproveLamLeaveApplicationInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireStrictLamApprovalAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = approveLamLeaveApplicationInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    const decidedAt = new Date();
    const approverId =
      validInput.approvedBy?.trim() || normalizeLamMutationActorId(context);

    let targetId = "";

    await mutateLamRepository((draft) => {
      const existing = draft.leaveApplications.find(
        (entry) =>
          entry.id === validInput.applicationId && entry.companyId === companyId
      );
      if (!existing) {
        throw new Error(
          `Leave application "${validInput.applicationId}" was not found`
        );
      }

      const scopeDenied = requireLamEmployeeMutationScope(
        context,
        existing.employeeId
      );
      if (scopeDenied && !scopeDenied.ok) {
        throw new Error(scopeDenied.error);
      }

      assertApprovableStatus(existing);
      const authorization = assertDecisionActorForWorkflowStep({
        draft,
        existing,
        context,
        approvedBy: validInput.approvedBy,
      });

      const approved = applyApproveDecision({
        draft,
        companyId,
        context,
        existing,
        validInput,
        approverId,
        decidedAt,
        authorization,
      });
      targetId = approved.id;
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}

export async function rejectLamLeaveApplication(
  input: RejectLamLeaveApplicationInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireStrictLamApprovalAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = rejectLamLeaveApplicationInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    const decidedAt = new Date();

    let targetId = "";

    await mutateLamRepository((draft) => {
      const existing = draft.leaveApplications.find(
        (entry) =>
          entry.id === validInput.applicationId && entry.companyId === companyId
      );
      if (!existing) {
        throw new Error(
          `Leave application "${validInput.applicationId}" was not found`
        );
      }

      const scopeDenied = requireLamEmployeeMutationScope(
        context,
        existing.employeeId
      );
      if (scopeDenied && !scopeDenied.ok) {
        throw new Error(scopeDenied.error);
      }

      assertDecisionStatus(existing);
      const authorization = assertDecisionActorForWorkflowStep({
        draft,
        existing,
        context,
        approvedBy: validInput.approvedBy,
      });

      const rejected = lamLeaveApplicationSchema.parse({
        ...existing,
        status: "rejected",
        rejectionReason: validInput.rejectionReason.trim(),
        updatedAt: decidedAt,
      });

      draft.leaveApplications = upsertLamEntity(
        draft.leaveApplications,
        rejected
      );
      targetId = rejected.id;

      const leaveType = findActiveLeaveTypeForApplication(
        draft,
        rejected,
        companyId
      );
      if (leaveType && shouldReserveLeaveBalance(leaveType)) {
        releaseLeaveApplicationPendingBalance({
          draft,
          companyId,
          context,
          application: rejected,
          reason: `Leave balance pending released after rejection for employee ${existing.employeeId}`,
        });
      }

      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action: leaveAttendanceManagementAuditEvents.leaveApplicationRejected,
          entityType: "leave_application",
          entityId: rejected.id,
          summary: `Leave application rejected for employee ${existing.employeeId}`,
          metadata: buildLamAuditMetadata({
            employeeId: existing.employeeId,
            leaveTypeId: existing.leaveTypeId,
            rejectionReason: rejected.rejectionReason,
            ...buildApprovalAuthorizationAuditMetadata(authorization),
          }),
          before: existing,
          after: rejected,
        })
      );
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}

const returnApplicationForEmployeeAction = (args: {
  draft: LamRepositoryState;
  companyId: string;
  context?: LamMutationContext;
  existing: LamLeaveApplication;
  returnedReason: string;
  auditSummary: string;
  requestType: "return" | "clarification";
  authorization: ApprovalStepAuthorizationOutcome;
}): LamLeaveApplication => {
  const decidedAt = new Date();
  const returned = lamLeaveApplicationSchema.parse({
    ...args.existing,
    status: "returned",
    returnedAt: decidedAt,
    returnedReason: args.returnedReason.trim(),
    updatedAt: decidedAt,
  });

  args.draft.leaveApplications = upsertLamEntity(
    args.draft.leaveApplications,
    returned
  );

  const leaveType = findActiveLeaveTypeForApplication(
    args.draft,
    returned,
    args.companyId
  );
  if (leaveType && shouldReserveLeaveBalance(leaveType)) {
    releaseLeaveApplicationPendingBalance({
      draft: args.draft,
      companyId: args.companyId,
      context: args.context,
      application: returned,
      reason: `Leave balance pending released after ${args.requestType} for employee ${args.existing.employeeId}`,
    });
  }

  args.draft.auditEvents.push(
    createLamMutationAuditEvent({
      companyId: args.companyId,
      actorId: normalizeLamMutationActorId(args.context),
      action: leaveAttendanceManagementAuditEvents.leaveApplicationReturned,
      entityType: "leave_application",
      entityId: returned.id,
      summary: args.auditSummary,
      metadata: buildLamAuditMetadata({
        employeeId: args.existing.employeeId,
        leaveTypeId: args.existing.leaveTypeId,
        returnedReason: returned.returnedReason,
        requestType: args.requestType,
        ...buildApprovalAuthorizationAuditMetadata(args.authorization),
      }),
      before: args.existing,
      after: returned,
    })
  );

  return returned;
};

export async function returnLamLeaveApplication(
  input: ReturnLamLeaveApplicationInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireStrictLamApprovalAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = returnLamLeaveApplicationInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });

    let targetId = "";

    await mutateLamRepository((draft) => {
      const existing = draft.leaveApplications.find(
        (entry) =>
          entry.id === validInput.applicationId && entry.companyId === companyId
      );
      if (!existing) {
        throw new Error(
          `Leave application "${validInput.applicationId}" was not found`
        );
      }

      const scopeDenied = requireLamEmployeeMutationScope(
        context,
        existing.employeeId
      );
      if (scopeDenied && !scopeDenied.ok) {
        throw new Error(scopeDenied.error);
      }

      assertDecisionStatus(existing);
      const authorization = assertDecisionActorForWorkflowStep({
        draft,
        existing,
        context,
        approvedBy: validInput.approvedBy,
      });

      const returned = returnApplicationForEmployeeAction({
        draft,
        companyId,
        context,
        existing,
        returnedReason: validInput.returnedReason,
        auditSummary: `Leave application returned for employee ${existing.employeeId}`,
        requestType: "return",
        authorization,
      });
      targetId = returned.id;
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}

export async function requestLamLeaveApplicationClarification(
  input: RequestLamLeaveApplicationClarificationInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireStrictLamApprovalAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput =
      requestLamLeaveApplicationClarificationInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });

    let targetId = "";

    await mutateLamRepository((draft) => {
      const existing = draft.leaveApplications.find(
        (entry) =>
          entry.id === validInput.applicationId && entry.companyId === companyId
      );
      if (!existing) {
        throw new Error(
          `Leave application "${validInput.applicationId}" was not found`
        );
      }

      const scopeDenied = requireLamEmployeeMutationScope(
        context,
        existing.employeeId
      );
      if (scopeDenied && !scopeDenied.ok) {
        throw new Error(scopeDenied.error);
      }

      assertDecisionStatus(existing);
      const authorization = assertDecisionActorForWorkflowStep({
        draft,
        existing,
        context,
        approvedBy: validInput.approvedBy,
      });

      const returned = returnApplicationForEmployeeAction({
        draft,
        companyId,
        context,
        existing,
        returnedReason: validInput.clarificationReason,
        auditSummary: `Clarification requested for leave application of employee ${existing.employeeId}`,
        requestType: "clarification",
        authorization,
      });
      targetId = returned.id;
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}
