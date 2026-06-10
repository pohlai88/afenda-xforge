import "server-only";

import type {
  LamMutationResult,
  ProcessLamLeaveEncashmentInput,
} from "../contracts/index.ts";
import {
  leaveAttendanceManagementAuditEvents,
  processLamLeaveEncashmentInputSchema,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamEncashmentWriteAccess,
  requireLamEmployeeMutationScope,
} from "../execution.ts";
import { isEntitlementRuleEffectiveOn } from "../projector/entitlement.ts";
import {
  createLamRecordId,
  mutateLamRepository,
  upsertLamEntity,
} from "../repository.ts";
import {
  lamLeaveBalanceSchema,
  lamLeaveEncashmentRequestSchema,
  lamWriteContextSchema,
} from "../schema.ts";
import { computeRemainingBalance } from "../shared/balance.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave encashment processing failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error("Company context is required for leave encashment");
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

export async function processLamLeaveEncashment(
  input: ProcessLamLeaveEncashmentInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamEncashmentWriteAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = processLamLeaveEncashmentInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });

    const scopeDenied = requireLamEmployeeMutationScope(
      context,
      validInput.employeeId
    );
    if (scopeDenied && !scopeDenied.ok) {
      return scopeDenied;
    }

    let targetId = "";

    await mutateLamRepository((draft) => {
      const policy = draft.leaveEncashmentPolicies.find(
        (entry) =>
          entry.id === validInput.policyId &&
          (entry.companyId ?? companyId) === companyId &&
          entry.active
      );
      if (!policy) {
        throw new Error("Active leave encashment policy not found");
      }

      if (policy.leaveTypeId !== validInput.leaveTypeId) {
        throw new Error("Encashment policy leave type mismatch");
      }

      const asOfDate = validInput.asOfDate ?? new Date();
      if (!isEntitlementRuleEffectiveOn(policy, asOfDate)) {
        throw new Error("Leave encashment policy is not effective on asOfDate");
      }

      if (validInput.encashmentDays > policy.maxEncashableDays) {
        throw new Error("Encashment days exceed policy maxEncashableDays");
      }

      const leaveType = draft.leaveTypes.find(
        (entry) =>
          entry.id === validInput.leaveTypeId &&
          (entry.companyId ?? companyId) === companyId &&
          entry.active
      );
      if (!leaveType) {
        throw new Error("Active leave type not found for encashment");
      }

      const balance = draft.leaveBalances.find(
        (entry) =>
          entry.companyId === companyId &&
          entry.employeeId === validInput.employeeId &&
          entry.leaveTypeId === validInput.leaveTypeId &&
          entry.periodYear === validInput.periodYear
      );

      const base = balance ?? {
        openingBalance: 0,
        earned: 0,
        used: 0,
        pending: 0,
        adjusted: 0,
        forfeited: 0,
        carriedForward: 0,
      };

      const remainingBefore = computeRemainingBalance(base);
      const remainingAfter = remainingBefore - validInput.encashmentDays;
      const minRemaining = policy.minRemainingBalanceDays ?? 0;

      if (remainingAfter < minRemaining) {
        throw new Error(
          "Encashment would leave balance below policy minRemainingBalanceDays"
        );
      }

      const nextUsed = base.used + validInput.encashmentDays;
      const nextBalance = lamLeaveBalanceSchema.parse({
        id: balance?.id ?? createLamRecordId(),
        companyId,
        employeeId: validInput.employeeId,
        leaveTypeId: validInput.leaveTypeId,
        periodYear: validInput.periodYear,
        openingBalance: base.openingBalance,
        earned: base.earned,
        used: nextUsed,
        pending: base.pending,
        adjusted: base.adjusted,
        forfeited: base.forfeited,
        carriedForward: base.carriedForward,
        remaining: computeRemainingBalance({
          ...base,
          used: nextUsed,
        }),
        updatedAt: new Date(),
      });

      draft.leaveBalances = upsertLamEntity(draft.leaveBalances, nextBalance);

      const request = lamLeaveEncashmentRequestSchema.parse({
        id: createLamRecordId(),
        companyId,
        employeeId: validInput.employeeId,
        leaveTypeId: validInput.leaveTypeId,
        policyId: policy.id,
        policyCode: policy.code,
        encashmentDays: validInput.encashmentDays,
        encashmentRatePercent: policy.encashmentRatePercent,
        periodYear: validInput.periodYear,
        payPeriodStart: validInput.payPeriodStart,
        payPeriodEnd: validInput.payPeriodEnd,
        authorizedBy: validInput.authorizedBy,
        reason: validInput.reason,
        processedAt: new Date(),
        processedBy: normalizeLamMutationActorId(context),
      });

      draft.leaveEncashmentRequests = upsertLamEntity(
        draft.leaveEncashmentRequests,
        request
      );
      targetId = request.id;

      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action: leaveAttendanceManagementAuditEvents.leaveEncashmentProcessed,
          entityType: "leave_encashment_request",
          entityId: request.id,
          summary: `Leave encashment processed for employee ${validInput.employeeId}`,
          reason: validInput.reason,
          metadata: buildLamAuditMetadata({
            employeeId: validInput.employeeId,
            leaveTypeId: validInput.leaveTypeId,
            policyId: policy.id,
            policyCode: policy.code,
            encashmentDays: validInput.encashmentDays,
            encashmentRatePercent: policy.encashmentRatePercent,
            periodYear: validInput.periodYear,
            authorizedBy: validInput.authorizedBy,
            reason: validInput.reason,
            balanceId: nextBalance.id,
          }),
          before: balance,
          after: {
            request,
            balance: nextBalance,
          },
        })
      );
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}
