import "server-only";

import type {
  LamLeaveBalanceCarryForwardMutationResult,
  ProcessLamLeaveBalanceCarryForwardInput,
} from "../contracts/index.ts";
import {
  leaveAttendanceManagementAuditEvents,
  processLamLeaveBalanceCarryForwardInputSchema,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamBalanceWriteAccess,
  requireLamEmployeeMutationScope,
} from "../execution.ts";
import { projectLeaveBalanceCarryForward } from "../projector/carry-forward.ts";
import { filterByCompany } from "../queries/shared.ts";
import {
  createLamRecordId,
  mutateLamRepository,
  upsertLamEntity,
} from "../repository.ts";
import type { LamLeaveBalance } from "../schema.ts";
import {
  lamEmployeeEntitlementProfileSchema,
  lamLeaveBalanceSchema,
  lamWriteContextSchema,
} from "../schema.ts";
import { computeRemainingBalance } from "../shared/balance.ts";

const toFailure = (
  error: unknown
): LamLeaveBalanceCarryForwardMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave balance carry-forward failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error(
      "Company context is required for leave balance carry-forward"
    );
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

const buildClosedSourceBalance = (
  previousBalance: LamLeaveBalance,
  projection: ReturnType<typeof projectLeaveBalanceCarryForward>
): LamLeaveBalance => {
  const nextAdjusted = previousBalance.adjusted - projection.carryForwardDays;
  const nextForfeited = previousBalance.forfeited + projection.forfeitDays;

  return lamLeaveBalanceSchema.parse({
    ...previousBalance,
    adjusted: nextAdjusted,
    forfeited: nextForfeited,
    remaining: computeRemainingBalance({
      ...previousBalance,
      adjusted: nextAdjusted,
      forfeited: nextForfeited,
    }),
    updatedAt: new Date(),
  });
};

const buildCarryForwardTargetBalance = (args: {
  existingTarget: LamLeaveBalance | undefined;
  projection: ReturnType<typeof projectLeaveBalanceCarryForward>;
  companyId: string;
  employeeId: string;
  leaveTypeId: string;
  targetPeriodYear: number;
}): LamLeaveBalance => {
  const nextCarriedForward =
    (args.existingTarget?.carriedForward ?? 0) +
    args.projection.carryForwardDays;

  return lamLeaveBalanceSchema.parse({
    id: args.existingTarget?.id ?? createLamRecordId(),
    companyId: args.companyId,
    employeeId: args.employeeId,
    leaveTypeId: args.leaveTypeId,
    periodYear: args.targetPeriodYear,
    openingBalance: args.existingTarget?.openingBalance ?? 0,
    earned: args.existingTarget?.earned ?? 0,
    used: args.existingTarget?.used ?? 0,
    pending: args.existingTarget?.pending ?? 0,
    adjusted: args.existingTarget?.adjusted ?? 0,
    forfeited: args.existingTarget?.forfeited ?? 0,
    carriedForward: nextCarriedForward,
    remaining: computeRemainingBalance({
      openingBalance: args.existingTarget?.openingBalance ?? 0,
      earned: args.existingTarget?.earned ?? 0,
      used: args.existingTarget?.used ?? 0,
      pending: args.existingTarget?.pending ?? 0,
      adjusted: args.existingTarget?.adjusted ?? 0,
      forfeited: args.existingTarget?.forfeited ?? 0,
      carriedForward: nextCarriedForward,
    }),
    updatedAt: new Date(),
  });
};

export async function processLamLeaveBalanceCarryForward(
  input: ProcessLamLeaveBalanceCarryForwardInput,
  context?: LamMutationContext
): Promise<LamLeaveBalanceCarryForwardMutationResult> {
  const denied = requireLamBalanceWriteAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput =
      processLamLeaveBalanceCarryForwardInputSchema.parse(input);
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

    const asOfDate = validInput.asOfDate ?? new Date();
    const employee = lamEmployeeEntitlementProfileSchema.parse({
      companyId,
      employeeId: validInput.employeeId,
      hireDate: validInput.hireDate,
      countryCode: validInput.countryCode,
      legalEntityCode: validInput.legalEntityCode,
      workLocationCode: validInput.workLocationCode,
      employmentType: validInput.employmentType,
      grade: validInput.grade,
      policyGroupId: validInput.policyGroupId,
      departmentId: validInput.departmentId,
    });

    let targetId: string | null = null;
    let projection!: ReturnType<typeof projectLeaveBalanceCarryForward>;

    await mutateLamRepository((draft) => {
      const previousBalance =
        draft.leaveBalances.find(
          (entry) =>
            entry.companyId === companyId &&
            entry.employeeId === validInput.employeeId &&
            entry.leaveTypeId === validInput.leaveTypeId &&
            entry.periodYear === validInput.sourcePeriodYear
        ) ?? null;

      projection = projectLeaveBalanceCarryForward({
        asOfDate,
        employee,
        leaveTypeId: validInput.leaveTypeId,
        previousBalance,
        rules: filterByCompany(draft.leaveCarryForwardRules, companyId),
        sourcePeriodYear: validInput.sourcePeriodYear,
        targetPeriodYear: validInput.targetPeriodYear,
      });

      if (
        previousBalance &&
        (projection.carryForwardDays > 0 || projection.forfeitDays > 0)
      ) {
        const closedSource = buildClosedSourceBalance(
          previousBalance,
          projection
        );
        draft.leaveBalances = upsertLamEntity(
          draft.leaveBalances,
          closedSource
        );

        draft.auditEvents.push(
          createLamMutationAuditEvent({
            companyId,
            actorId: normalizeLamMutationActorId(context),
            action: leaveAttendanceManagementAuditEvents.leaveBalanceUpdated,
            entityType: "leave_balance",
            entityId: closedSource.id,
            summary:
              projection.carryForwardDays > 0
                ? `Leave carry-forward closed source period for employee ${validInput.employeeId}`
                : `Leave forfeiture applied for employee ${validInput.employeeId}`,
            metadata: buildLamAuditMetadata({
              employeeId: validInput.employeeId,
              leaveTypeId: validInput.leaveTypeId,
              periodYear: validInput.sourcePeriodYear,
              carryForwardDays: projection.carryForwardDays,
              forfeitDays: projection.forfeitDays,
              carryForwardRuleId: projection.carryForwardRuleId,
              carryForwardRuleCode: projection.carryForwardRuleCode,
            }),
            before: previousBalance,
            after: closedSource,
          })
        );
      }

      const existingTarget = draft.leaveBalances.find(
        (entry) =>
          entry.companyId === companyId &&
          entry.employeeId === validInput.employeeId &&
          entry.leaveTypeId === validInput.leaveTypeId &&
          entry.periodYear === validInput.targetPeriodYear
      );

      if (projection.carryForwardDays > 0) {
        const nextTarget = buildCarryForwardTargetBalance({
          existingTarget,
          projection,
          companyId,
          employeeId: validInput.employeeId,
          leaveTypeId: validInput.leaveTypeId,
          targetPeriodYear: validInput.targetPeriodYear,
        });

        draft.leaveBalances = upsertLamEntity(draft.leaveBalances, nextTarget);
        targetId = nextTarget.id;

        draft.auditEvents.push(
          createLamMutationAuditEvent({
            companyId,
            actorId: normalizeLamMutationActorId(context),
            action: leaveAttendanceManagementAuditEvents.leaveBalanceUpdated,
            entityType: "leave_balance",
            entityId: nextTarget.id,
            summary: `Leave carry-forward processed for employee ${validInput.employeeId}`,
            metadata: buildLamAuditMetadata({
              employeeId: validInput.employeeId,
              leaveTypeId: validInput.leaveTypeId,
              sourcePeriodYear: validInput.sourcePeriodYear,
              targetPeriodYear: validInput.targetPeriodYear,
              carryForwardRuleId: projection.carryForwardRuleId,
              carryForwardRuleCode: projection.carryForwardRuleCode,
              unusedDays: projection.unusedDays,
              carryForwardDays: projection.carryForwardDays,
              forfeitDays: projection.forfeitDays,
              countryCode: validInput.countryCode,
              legalEntityCode: validInput.legalEntityCode,
              workLocationCode: validInput.workLocationCode,
              employmentType: validInput.employmentType,
              grade: validInput.grade,
              policyGroupId: validInput.policyGroupId,
              departmentId: validInput.departmentId,
            }),
            before: existingTarget,
            after: nextTarget,
          })
        );
      } else {
        targetId = existingTarget?.id ?? null;
      }
    }, parsedContext);

    return { ok: true, targetId, result: projection };
  } catch (error) {
    return toFailure(error);
  }
}
