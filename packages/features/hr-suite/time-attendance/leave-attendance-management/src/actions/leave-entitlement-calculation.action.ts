import "server-only";

import type {
  CalculateLamLeaveEntitlementInput,
  LamEntitlementCalculationMutationResult,
} from "../contracts/index.ts";
import {
  calculateLamLeaveEntitlementInputSchema,
  leaveAttendanceManagementAuditEvents,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamMutationAccess,
} from "../execution.ts";
import { calculateLamLeaveEntitlement } from "../queries/leave-entitlement-calculation.query.ts";
import {
  createLamRecordId,
  mutateLamRepository,
  upsertLamEntity,
} from "../repository.ts";
import { lamLeaveBalanceSchema, lamWriteContextSchema } from "../schema.ts";
import { computeRemainingBalance } from "../shared/balance.ts";

const toFailure = (
  error: unknown
): LamEntitlementCalculationMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave entitlement calculation failure",
});

export async function applyLamLeaveEntitlementCalculation(
  input: CalculateLamLeaveEntitlementInput,
  context?: LamMutationContext
): Promise<LamEntitlementCalculationMutationResult> {
  const denied = requireLamMutationAccess(context);
  if (denied && !denied.ok) {
    return { ok: false, error: denied.error };
  }

  try {
    const validInput = calculateLamLeaveEntitlementInputSchema.parse({
      ...input,
      persist: true,
    });
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = parsedContext.companyId ?? validInput.companyId;
    if (!companyId) {
      throw new Error(
        "Company context is required for leave entitlement calculation"
      );
    }

    const calculations = await calculateLamLeaveEntitlement(validInput, {
      ...parsedContext,
      canRead: true,
      companyId,
    });

    let primaryBalanceId: string | null = null;

    await mutateLamRepository((draft) => {
      for (const calculation of calculations) {
        if (!calculation.matched) {
          continue;
        }

        const existing = draft.leaveBalances.find(
          (entry) =>
            entry.companyId === companyId &&
            entry.employeeId === calculation.employeeId &&
            entry.leaveTypeId === calculation.leaveTypeId &&
            entry.periodYear === calculation.periodYear
        );

        const nextBalance = lamLeaveBalanceSchema.parse({
          id: existing?.id ?? createLamRecordId(),
          companyId,
          employeeId: calculation.employeeId,
          leaveTypeId: calculation.leaveTypeId,
          periodYear: calculation.periodYear,
          openingBalance: existing?.openingBalance ?? 0,
          earned: calculation.earnedDays,
          used: existing?.used ?? 0,
          pending: existing?.pending ?? 0,
          adjusted: existing?.adjusted ?? 0,
          forfeited: existing?.forfeited ?? 0,
          carriedForward: existing?.carriedForward ?? 0,
          remaining: computeRemainingBalance({
            openingBalance: existing?.openingBalance ?? 0,
            earned: calculation.earnedDays,
            used: existing?.used ?? 0,
            pending: existing?.pending ?? 0,
            adjusted: existing?.adjusted ?? 0,
            forfeited: existing?.forfeited ?? 0,
            carriedForward: existing?.carriedForward ?? 0,
          }),
          updatedAt: new Date(),
        });

        draft.leaveBalances = upsertLamEntity(draft.leaveBalances, nextBalance);
        primaryBalanceId = nextBalance.id;

        draft.auditEvents.push(
          createLamMutationAuditEvent({
            companyId,
            actorId: normalizeLamMutationActorId(context),
            action:
              leaveAttendanceManagementAuditEvents.leaveEntitlementCalculated,
            entityType: "leave_balance",
            entityId: nextBalance.id,
            summary: `Leave entitlement calculated for employee ${calculation.employeeId}`,
            metadata: buildLamAuditMetadata({
              employeeId: calculation.employeeId,
              leaveTypeId: calculation.leaveTypeId,
              periodYear: calculation.periodYear,
              entitlementRuleId: calculation.entitlementRuleId,
              entitlementRuleCode: calculation.entitlementRuleCode,
              entitlementDays: calculation.entitlementDays,
              earnedDays: calculation.earnedDays,
              accrualRule: calculation.accrualRule,
              tenureMonths: calculation.tenureMonths,
              countryCode: validInput.countryCode,
              legalEntityCode: validInput.legalEntityCode,
              workLocationCode: validInput.workLocationCode,
              employmentType: validInput.employmentType,
              grade: validInput.grade,
              policyGroupId: validInput.policyGroupId,
              departmentId: validInput.departmentId,
            }),
            before: existing,
            after: nextBalance,
          })
        );
      }
    }, parsedContext);

    return {
      ok: true,
      targetId: primaryBalanceId,
      calculations: [...calculations],
    };
  } catch (error) {
    return toFailure(error);
  }
}
