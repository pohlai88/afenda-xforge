import "server-only";

import type {
  AdjustLamLeaveBalanceInput,
  LamMutationResult,
} from "../contracts/index.ts";
import {
  adjustLamLeaveBalanceInputSchema,
  leaveAttendanceManagementAuditEvents,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamBalanceWriteAccess,
  requireLamEmployeeMutationScope,
} from "../execution.ts";
import {
  createLamRecordId,
  mutateLamRepository,
  upsertLamEntity,
} from "../repository.ts";
import { lamLeaveBalanceSchema, lamWriteContextSchema } from "../schema.ts";
import { computeRemainingBalance } from "../shared/balance.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave balance adjustment failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error("Company context is required for leave balance mutations");
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

export async function adjustLamLeaveBalance(
  input: AdjustLamLeaveBalanceInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamBalanceWriteAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = adjustLamLeaveBalanceInputSchema.parse(input);
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
      const existing = validInput.balanceId
        ? draft.leaveBalances.find(
            (entry) =>
              entry.id === validInput.balanceId && entry.companyId === companyId
          )
        : draft.leaveBalances.find(
            (entry) =>
              entry.companyId === companyId &&
              entry.employeeId === validInput.employeeId &&
              entry.leaveTypeId === validInput.leaveTypeId &&
              entry.periodYear === validInput.periodYear
          );

      const base = existing ?? {
        openingBalance: 0,
        earned: 0,
        used: 0,
        pending: 0,
        adjusted: 0,
        forfeited: 0,
        carriedForward: 0,
      };

      const nextAdjusted = base.adjusted + validInput.adjustmentDays;
      const nextBalance = lamLeaveBalanceSchema.parse({
        id: existing?.id ?? createLamRecordId(),
        companyId,
        employeeId: validInput.employeeId,
        leaveTypeId: validInput.leaveTypeId,
        periodYear: validInput.periodYear,
        openingBalance: base.openingBalance,
        earned: base.earned,
        used: base.used,
        pending: base.pending,
        adjusted: nextAdjusted,
        forfeited: base.forfeited,
        carriedForward: base.carriedForward,
        remaining: computeRemainingBalance({
          openingBalance: base.openingBalance,
          earned: base.earned,
          used: base.used,
          pending: base.pending,
          adjusted: nextAdjusted,
          forfeited: base.forfeited,
          carriedForward: base.carriedForward,
        }),
        updatedAt: new Date(),
      });

      draft.leaveBalances = upsertLamEntity(draft.leaveBalances, nextBalance);
      targetId = nextBalance.id;

      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action: leaveAttendanceManagementAuditEvents.leaveBalanceUpdated,
          entityType: "leave_adjustment",
          entityId: nextBalance.id,
          summary: `Leave balance adjusted for employee ${validInput.employeeId}`,
          reason: validInput.reason,
          metadata: buildLamAuditMetadata({
            employeeId: validInput.employeeId,
            leaveTypeId: validInput.leaveTypeId,
            periodYear: validInput.periodYear,
            adjustmentDays: validInput.adjustmentDays,
            authorizedBy: validInput.authorizedBy,
            reason: validInput.reason,
          }),
          before: existing,
          after: nextBalance,
        })
      );
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}
