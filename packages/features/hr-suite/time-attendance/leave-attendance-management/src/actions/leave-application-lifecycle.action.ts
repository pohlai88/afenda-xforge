import "server-only";

import type {
  AmendLamLeaveApplicationInput,
  CancelLamLeaveApplicationInput,
  LamMutationResult,
} from "../contracts/index.ts";
import {
  amendLamLeaveApplicationInputSchema,
  cancelLamLeaveApplicationInputSchema,
  leaveAttendanceManagementAuditEvents,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireStrictLamApprovalAccess,
  requireLamEmployeeMutationScope,
  requireLamLeaveApplicationsWriteAccess,
} from "../execution.ts";
import {
  findActiveLeaveTypeForApplication,
  shouldReserveLeaveBalance,
} from "../projector/unpaid-leave-payroll-references.ts";
import { mutateLamRepository, upsertLamEntity } from "../repository.ts";
import type { LamLeaveApplication } from "../schema.ts";
import { lamLeaveApplicationSchema, lamWriteContextSchema } from "../schema.ts";
import {
  adjustLeaveApplicationUsedBalance,
  releaseLeaveApplicationPendingBalanceIfRequired,
  reverseLeaveApplicationApprovedBalanceIfRequired,
} from "../shared/leave-application-balance.ts";
import { assertLeaveApplicationPolicyGates } from "../shared/leave-application-policy-validation.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave application lifecycle failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error(
      "Company context is required for leave application lifecycle mutations"
    );
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

const CANCELLABLE_STATUSES = [
  "submitted",
  "pending_approval",
  "approved",
  "returned",
] as const;

const assertCancellableStatus = (application: LamLeaveApplication): void => {
  if (
    !CANCELLABLE_STATUSES.includes(
      application.status as (typeof CANCELLABLE_STATUSES)[number]
    )
  ) {
    throw new Error(
      `Leave application cannot be cancelled from status "${application.status}"`
    );
  }
};

const requireCancelAccess = (
  application: LamLeaveApplication,
  context?: LamMutationContext
): LamMutationResult | null => {
  if (application.status === "approved") {
    return requireStrictLamApprovalAccess(context);
  }

  return requireLamLeaveApplicationsWriteAccess(context);
};

export async function cancelLamLeaveApplication(
  input: CancelLamLeaveApplicationInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  try {
    const validInput = cancelLamLeaveApplicationInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});

    let targetId = "";

    await mutateLamRepository((draft) => {
      const companyId = resolveScopedCompanyId({
        contextCompanyId: parsedContext.companyId,
        inputCompanyId: validInput.companyId,
      });

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

      const denied = requireCancelAccess(existing, context);
      if (denied && !denied.ok) {
        throw new Error(denied.error);
      }

      assertCancellableStatus(existing);

      const cancelledAt = new Date();
      const cancelled = lamLeaveApplicationSchema.parse({
        ...existing,
        status: "cancelled",
        cancellationReason: validInput.cancellationReason.trim(),
        cancelledAt,
        updatedAt: cancelledAt,
      });

      draft.leaveApplications = upsertLamEntity(
        draft.leaveApplications,
        cancelled
      );
      targetId = cancelled.id;

      const leaveType = findActiveLeaveTypeForApplication(
        draft,
        cancelled,
        companyId
      );

      if (
        existing.status === "submitted" ||
        existing.status === "pending_approval"
      ) {
        releaseLeaveApplicationPendingBalanceIfRequired({
          draft,
          companyId,
          context,
          application: cancelled,
          leaveType,
          reason: `Leave balance pending released after cancellation for employee ${existing.employeeId}`,
        });
      } else if (existing.status === "approved") {
        reverseLeaveApplicationApprovedBalanceIfRequired({
          draft,
          companyId,
          context,
          application: cancelled,
          leaveType,
          reason: `Leave balance used reversed after cancellation for employee ${existing.employeeId}`,
        });
      }

      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action:
            leaveAttendanceManagementAuditEvents.leaveApplicationCancelled,
          entityType: "leave_application",
          entityId: cancelled.id,
          summary: `Leave application cancelled for employee ${existing.employeeId}`,
          metadata: buildLamAuditMetadata({
            employeeId: existing.employeeId,
            leaveTypeId: existing.leaveTypeId,
            cancellationReason: cancelled.cancellationReason,
            cancelledBy:
              validInput.cancelledBy?.trim() ??
              normalizeLamMutationActorId(context),
            previousStatus: existing.status,
          }),
          before: existing,
          after: cancelled,
        })
      );
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}

export async function amendLamLeaveApplication(
  input: AmendLamLeaveApplicationInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireStrictLamApprovalAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = amendLamLeaveApplicationInputSchema.parse(input);
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

      if (existing.status !== "approved") {
        throw new Error(
          `Leave application must be approved to amend; current status is "${existing.status}"`
        );
      }

      const amendedAt = new Date();
      const leaveType = assertLeaveApplicationPolicyGates(draft, {
        companyId,
        employeeId: existing.employeeId,
        leaveTypeId: existing.leaveTypeId,
        startDate: validInput.startDate,
        endDate: validInput.endDate,
        totalDays: validInput.totalDays,
        hireDate: validInput.hireDate,
        gender: validInput.gender ?? null,
        countryCode: validInput.countryCode,
        legalEntityCode: validInput.legalEntityCode,
        workLocationCode: validInput.workLocationCode,
        employmentType: validInput.employmentType,
        grade: validInput.grade,
        policyGroupId: validInput.policyGroupId,
        departmentId: validInput.departmentId,
        excludeApplicationId: existing.id,
        evaluatedAt: amendedAt,
      });

      const amended = lamLeaveApplicationSchema.parse({
        ...existing,
        startDate: validInput.startDate,
        endDate: validInput.endDate,
        totalDays: validInput.totalDays,
        reason: validInput.reason ?? existing.reason,
        updatedAt: amendedAt,
      });

      if (
        validInput.totalDays !== existing.totalDays &&
        shouldReserveLeaveBalance(leaveType)
      ) {
        if (
          validInput.startDate.getFullYear() !==
          existing.startDate.getFullYear()
        ) {
          throw new Error(
            "Leave application amendment cannot move approved leave balance across leave balance periods"
          );
        }

        adjustLeaveApplicationUsedBalance({
          draft,
          companyId,
          context,
          application: amended,
          previousTotalDays: existing.totalDays,
          nextTotalDays: validInput.totalDays,
          reason: `Leave balance used adjusted after amendment for employee ${existing.employeeId}`,
        });
      }

      draft.leaveApplications = upsertLamEntity(
        draft.leaveApplications,
        amended
      );
      targetId = amended.id;

      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action: leaveAttendanceManagementAuditEvents.leaveApplicationAmended,
          entityType: "leave_application",
          entityId: amended.id,
          summary: `Leave application amended for employee ${existing.employeeId}`,
          metadata: buildLamAuditMetadata({
            employeeId: existing.employeeId,
            leaveTypeId: existing.leaveTypeId,
            amendmentReason: validInput.amendmentReason,
            amendedBy:
              validInput.amendedBy ?? normalizeLamMutationActorId(context),
            previousStartDate: existing.startDate.toISOString(),
            previousEndDate: existing.endDate.toISOString(),
            previousTotalDays: existing.totalDays,
            nextStartDate: validInput.startDate.toISOString(),
            nextEndDate: validInput.endDate.toISOString(),
            nextTotalDays: validInput.totalDays,
          }),
          before: existing,
          after: amended,
        })
      );
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}
