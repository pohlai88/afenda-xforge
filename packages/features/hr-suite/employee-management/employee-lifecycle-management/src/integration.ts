import "server-only";

import type {
  EmployeeLifecycleIntegrationChangeEvent,
  EmployeeLifecycleIntegrationSnapshot,
  EmployeeLifecycleTaskAttentionSnapshot,
} from "./contracts/integration.contract.ts";
import {
  employeeLifecycleComplianceWorkerStatusSchema,
  employeeLifecycleIamRevocationTriggerSchema,
  employeeLifecycleIntegrationChangeEventSchema,
  employeeLifecycleIntegrationSnapshotSchema,
  employeeLifecycleLeaveAttendanceClearanceSchema,
  employeeLifecycleOffboardingHandoffSchema,
  employeeLifecyclePayrollSettlementReadinessSchema,
  employeeLifecycleTaskAttentionSnapshotSchema,
} from "./contracts/integration.contract.ts";
import type { EmployeeLifecycleManagementPolicyContext } from "./policy.ts";
import {
  getEmployeeLifecycleContractStatus,
  getEmployeeLifecycleExitStatus,
  getEmployeeLifecycleMovementStatus,
  getEmployeeLifecycleOnboardingStatus,
  getEmployeeLifecycleOverviewEntry,
  getEmployeeLifecycleProbationStatus,
  getEmployeeLifecycleSuspensionStatus,
  listEmployeeLifecycleTaskEntries,
} from "./queries.ts";
import type { EmployeeLifecycleRepositoryScope } from "./repository.ts";
import { findEmployeeLifecycleStateByEmployeeId } from "./repository.ts";

const toIsoDate = (value: Date | null | undefined): string | null =>
  value ? value.toISOString() : null;

const toNullableString = (value: string | null | undefined): string | null =>
  value?.trim() || null;

export const employeeLifecycleIntegrationEvents = {
  changed: "hr.employee-lifecycle.integration.changed.v1",
} as const;

export const employeeLifecycleIntegrationSnapshotVersion = 1 as const;

export function buildEmployeeLifecycleIntegrationSnapshot(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope,
  context?: EmployeeLifecycleManagementPolicyContext
): EmployeeLifecycleIntegrationSnapshot | null {
  const state = findEmployeeLifecycleStateByEmployeeId(employeeId, scope);
  if (!state) {
    return null;
  }

  const overview = getEmployeeLifecycleOverviewEntry(
    employeeId,
    scope,
    context
  );
  const onboarding = getEmployeeLifecycleOnboardingStatus(employeeId, scope);
  const probation = getEmployeeLifecycleProbationStatus(employeeId, scope);
  const movement = getEmployeeLifecycleMovementStatus(employeeId, scope);
  const contract = getEmployeeLifecycleContractStatus(employeeId, scope);
  const suspension = getEmployeeLifecycleSuspensionStatus(employeeId, scope);
  const exit = getEmployeeLifecycleExitStatus(employeeId, scope);

  return employeeLifecycleIntegrationSnapshotSchema.parse({
    snapshotVersion: employeeLifecycleIntegrationSnapshotVersion,
    employeeId: state.employeeId,
    companyId: toNullableString(state.companyId),
    tenantId: toNullableString(state.tenantId),
    lifecycleStage: state.currentStage,
    currentStageEffectiveAt: toIsoDate(state.currentStageEffectiveAt),
    overview: {
      movementCount: overview?.movementCount ?? 0,
      needsAttention: overview?.needsAttention ?? false,
      latestActivityAt: toIsoDate(
        overview?.latestActivityAt ?? state.updatedAt
      ),
    },
    onboarding: onboarding
      ? {
          workflowStatus: onboarding.workflowStatus,
          isReadyForActivation: onboarding.isReadyForActivation,
          isActivated: onboarding.isActivated,
          totalTasks: onboarding.totalTasks,
          completedTasks: onboarding.completedTasks,
        }
      : null,
    probation: probation
      ? {
          workflowStatus: probation.workflowStatus,
          reviewDueAt: toIsoDate(probation.reviewDueAt),
          isReviewDue: probation.isReviewDue,
          isOverdue: probation.isOverdue,
          lastReviewOutcome: toNullableString(probation.lastReviewOutcome),
        }
      : null,
    movement: movement
      ? {
          latestMovementKind: movement.latestMovementKind,
          latestMovementAt: toIsoDate(movement.latestMovementAt),
          currentAssignment: movement.currentAssignment ?? null,
        }
      : null,
    contract: contract
      ? {
          contractStatus: contract.contractStatus,
          expiryAt: toIsoDate(contract.expiryAt),
          isExpired: contract.isExpired,
          isRenewalDue: contract.isRenewalDue,
          isReminderDue: contract.isReminderDue,
        }
      : null,
    suspension: suspension
      ? {
          suspensionStatus: suspension.suspensionStatus,
          suspensionKind: suspension.suspensionKind,
          isRestricted: suspension.isRestricted,
          isClosed: suspension.isClosed,
        }
      : null,
    exit: exit
      ? {
          exitKind: exit.exitKind,
          exitStatus: exit.exitStatus,
          finalStage: exit.finalStage,
          startedAt: toIsoDate(exit.startedAt),
          noticeEndsAt: toIsoDate(exit.noticeEndsAt),
          lastWorkingAt: toIsoDate(exit.lastWorkingAt),
          isNoticeActive: exit.isNoticeActive,
          isOffboardingTriggered: exit.isOffboardingTriggered,
          isArchived: exit.isArchived,
        }
      : null,
  });
}

export function buildEmployeeLifecycleTaskAttentionSnapshot(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope,
  context?: EmployeeLifecycleManagementPolicyContext
): EmployeeLifecycleTaskAttentionSnapshot | null {
  const state = findEmployeeLifecycleStateByEmployeeId(employeeId, scope);
  if (!state) {
    return null;
  }

  const tasks = listEmployeeLifecycleTaskEntries(employeeId, scope, context);

  return employeeLifecycleTaskAttentionSnapshotSchema.parse({
    snapshotVersion: 1,
    employeeId: state.employeeId,
    companyId: toNullableString(state.companyId),
    tenantId: toNullableString(state.tenantId),
    totalTasks: tasks.length,
    dueTasks: tasks.filter((task) => task.status === "due").length,
    overdueTasks: tasks.filter((task) => task.status === "overdue").length,
    pendingTasks: tasks.filter((task) => task.status === "pending").length,
    taskKinds: tasks.map((task) => task.kind),
    generatedAt: new Date().toISOString(),
  });
}

export function buildEmployeeLifecycleIntegrationChangeEvent(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope,
  context?: EmployeeLifecycleManagementPolicyContext
): EmployeeLifecycleIntegrationChangeEvent | null {
  const snapshot = buildEmployeeLifecycleIntegrationSnapshot(
    employeeId,
    scope,
    context
  );
  const taskAttention = buildEmployeeLifecycleTaskAttentionSnapshot(
    employeeId,
    scope,
    context
  );

  if (!(snapshot && taskAttention)) {
    return null;
  }

  return employeeLifecycleIntegrationChangeEventSchema.parse({
    eventName: employeeLifecycleIntegrationEvents.changed,
    eventVersion: 1,
    occurredAt:
      snapshot.overview.latestActivityAt ?? snapshot.currentStageEffectiveAt,
    companyId: snapshot.companyId,
    tenantId: snapshot.tenantId,
    employeeId,
    snapshot,
    taskAttention,
  });
}

export function buildEmployeeLifecyclePayrollSettlementReadiness(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
) {
  const snapshot = buildEmployeeLifecycleIntegrationSnapshot(employeeId, scope);
  if (!snapshot) {
    return null;
  }

  return employeeLifecyclePayrollSettlementReadinessSchema.parse({
    contractVersion: 1,
    employeeId,
    lifecycleStage: snapshot.lifecycleStage,
    exitKind: snapshot.exit?.exitKind ?? null,
    finalStage: snapshot.exit?.finalStage ?? null,
    isArchived: snapshot.exit?.isArchived ?? false,
    lastWorkingAt: snapshot.exit?.lastWorkingAt ?? null,
  });
}

export function buildEmployeeLifecycleLeaveAttendanceClearance(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
) {
  const snapshot = buildEmployeeLifecycleIntegrationSnapshot(employeeId, scope);
  if (!snapshot) {
    return null;
  }

  return employeeLifecycleLeaveAttendanceClearanceSchema.parse({
    contractVersion: 1,
    employeeId,
    lifecycleStage: snapshot.lifecycleStage,
    exitKind: snapshot.exit?.exitKind ?? null,
    noticeEndsAt: snapshot.exit?.noticeEndsAt ?? null,
    lastWorkingAt: snapshot.exit?.lastWorkingAt ?? null,
  });
}

export function buildEmployeeLifecycleIamRevocationTrigger(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
) {
  const snapshot = buildEmployeeLifecycleIntegrationSnapshot(employeeId, scope);
  if (!snapshot) {
    return null;
  }

  return employeeLifecycleIamRevocationTriggerSchema.parse({
    contractVersion: 1,
    employeeId,
    lifecycleStage: snapshot.lifecycleStage,
    exitKind: snapshot.exit?.exitKind ?? null,
    offboardingTriggered: snapshot.exit?.isOffboardingTriggered ?? false,
    lastWorkingAt: snapshot.exit?.lastWorkingAt ?? null,
  });
}

export function buildEmployeeLifecycleComplianceWorkerStatus(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
) {
  const snapshot = buildEmployeeLifecycleIntegrationSnapshot(employeeId, scope);
  if (!snapshot) {
    return null;
  }

  return employeeLifecycleComplianceWorkerStatusSchema.parse({
    contractVersion: 1,
    employeeId,
    lifecycleStage: snapshot.lifecycleStage,
    suspended: snapshot.lifecycleStage === "suspended",
    noticePeriodActive: snapshot.exit?.isNoticeActive ?? false,
    separatedAt:
      snapshot.lifecycleStage === "archived" &&
      snapshot.exit?.finalStage === "separated"
        ? snapshot.exit.lastWorkingAt
        : null,
    retiredAt:
      snapshot.lifecycleStage === "archived" &&
      snapshot.exit?.finalStage === "retired"
        ? snapshot.exit.lastWorkingAt
        : null,
  });
}

export function buildEmployeeLifecycleOffboardingHandoffProjection(input: {
  employeeId: string;
  companyId?: string | null;
  tenantId?: string | null;
  lifecycleExitReference: string;
  exitKind: "resignation" | "termination" | "retirement" | "contract_expiry";
  effectiveSeparationDate: Date;
  noticeEndsAt?: Date | null;
  lastWorkingAt?: Date | null;
}) {
  return employeeLifecycleOffboardingHandoffSchema.parse({
    handoffVersion: 1,
    employeeId: input.employeeId,
    companyId: toNullableString(input.companyId),
    tenantId: toNullableString(input.tenantId),
    lifecycleExitReference: input.lifecycleExitReference,
    exitKind: input.exitKind,
    effectiveSeparationDate: input.effectiveSeparationDate.toISOString(),
    noticeEndsAt: toIsoDate(input.noticeEndsAt),
    lastWorkingAt: toIsoDate(input.lastWorkingAt),
  });
}
