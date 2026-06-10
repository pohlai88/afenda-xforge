import { leaveAttendanceManagementAuditEvents } from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
} from "../execution.ts";
import { shouldReserveLeaveBalance } from "../projector/unpaid-leave-payroll-references.ts";
import { upsertLamEntity } from "../repository.ts";
import type {
  LamLeaveApplication,
  LamLeaveBalance,
  LamLeaveType,
} from "../schema.ts";
import { lamLeaveBalanceSchema } from "../schema.ts";
import { computeRemainingBalance } from "./balance.ts";

export type LeaveApplicationBalancePhase = "submit" | "approve";

export const resolveAvailableLeaveBalanceForApplication = (args: {
  balance: LamLeaveBalance;
  totalDays: number;
  phase: LeaveApplicationBalancePhase;
}): number =>
  args.phase === "submit"
    ? args.balance.remaining
    : args.balance.remaining + args.totalDays;

export const assertLeaveApplicationAvailableBalance = (args: {
  balance: LamLeaveBalance;
  totalDays: number;
  phase: LeaveApplicationBalancePhase;
}): void => {
  const available = resolveAvailableLeaveBalanceForApplication(args);
  if (available < args.totalDays) {
    throw new Error(
      `Insufficient leave balance: ${args.balance.remaining} day(s) remaining, ${args.totalDays} requested`
    );
  }
};

type BalanceDraft = {
  leaveBalances: LamLeaveBalance[];
  auditEvents: ReturnType<typeof createLamMutationAuditEvent>[];
};

export const findLeaveApplicationBalance = (args: {
  balances: readonly LamLeaveBalance[];
  companyId: string;
  application: LamLeaveApplication;
}): LamLeaveBalance => {
  const periodYear = args.application.startDate.getFullYear();
  const balance = args.balances.find(
    (entry) =>
      entry.companyId === args.companyId &&
      entry.employeeId === args.application.employeeId &&
      entry.leaveTypeId === args.application.leaveTypeId &&
      entry.periodYear === periodYear
  );

  if (!balance) {
    throw new Error(
      `Leave balance was not found for employee ${args.application.employeeId} in period ${periodYear}`
    );
  }

  return balance;
};

export const applicationHasPendingBalanceReservation = (args: {
  balances: readonly LamLeaveBalance[];
  companyId: string;
  application: LamLeaveApplication;
}): boolean => {
  try {
    const balance = findLeaveApplicationBalance(args);
    return balance.pending >= args.application.totalDays;
  } catch {
    return false;
  }
};

export const applicationHasUsedBalanceReservation = (args: {
  balances: readonly LamLeaveBalance[];
  companyId: string;
  application: LamLeaveApplication;
}): boolean => {
  try {
    const balance = findLeaveApplicationBalance(args);
    return balance.used >= args.application.totalDays;
  } catch {
    return false;
  }
};

export const finalizeApprovedLeaveApplicationBalanceIfRequired = (args: {
  draft: BalanceDraft;
  companyId: string;
  context?: LamMutationContext;
  application: LamLeaveApplication;
  leaveType: LamLeaveType | null;
}): void => {
  if (args.leaveType && shouldReserveLeaveBalance(args.leaveType)) {
    finalizeLeaveApplicationApprovedBalance({
      draft: args.draft,
      companyId: args.companyId,
      context: args.context,
      application: args.application,
    });
    return;
  }

  if (
    applicationHasPendingBalanceReservation({
      balances: args.draft.leaveBalances,
      companyId: args.companyId,
      application: args.application,
    })
  ) {
    throw new Error(
      `Active leave type is required to finalize leave balance for approved application "${args.application.id}"`
    );
  }
};

const pushBalanceAudit = (args: {
  draft: BalanceDraft;
  companyId: string;
  context?: LamMutationContext;
  balanceBefore: LamLeaveBalance;
  balanceAfter: LamLeaveBalance;
  summary: string;
  metadata: Record<string, unknown>;
}): void => {
  args.draft.auditEvents.push(
    createLamMutationAuditEvent({
      companyId: args.companyId,
      actorId: normalizeLamMutationActorId(args.context),
      action: leaveAttendanceManagementAuditEvents.leaveBalanceUpdated,
      entityType: "leave_balance",
      entityId: args.balanceAfter.id,
      summary: args.summary,
      metadata: buildLamAuditMetadata(args.metadata),
      before: args.balanceBefore,
      after: args.balanceAfter,
    })
  );
};

const updateBalance = (args: {
  draft: BalanceDraft;
  companyId: string;
  context?: LamMutationContext;
  application: LamLeaveApplication;
  balance: LamLeaveBalance;
  nextPending: number;
  nextUsed: number;
  summary: string;
  metadata: Record<string, unknown>;
}): LamLeaveBalance => {
  const nextBalance = lamLeaveBalanceSchema.parse({
    ...args.balance,
    pending: args.nextPending,
    used: args.nextUsed,
    remaining: computeRemainingBalance({
      openingBalance: args.balance.openingBalance,
      earned: args.balance.earned,
      used: args.nextUsed,
      pending: args.nextPending,
      adjusted: args.balance.adjusted,
      forfeited: args.balance.forfeited,
      carriedForward: args.balance.carriedForward,
    }),
    updatedAt: new Date(),
  });

  args.draft.leaveBalances = upsertLamEntity(
    args.draft.leaveBalances,
    nextBalance
  );
  pushBalanceAudit({
    draft: args.draft,
    companyId: args.companyId,
    context: args.context,
    balanceBefore: args.balance,
    balanceAfter: nextBalance,
    summary: args.summary,
    metadata: args.metadata,
  });

  return nextBalance;
};

export const releaseLeaveApplicationPendingBalance = (args: {
  draft: BalanceDraft;
  companyId: string;
  context?: LamMutationContext;
  application: LamLeaveApplication;
  reason: string;
}): LamLeaveBalance => {
  const balance = findLeaveApplicationBalance({
    balances: args.draft.leaveBalances,
    companyId: args.companyId,
    application: args.application,
  });

  if (balance.pending < args.application.totalDays) {
    throw new Error(
      `Leave balance pending is lower than application totalDays (${balance.pending} < ${args.application.totalDays})`
    );
  }

  const nextPending = balance.pending - args.application.totalDays;
  return updateBalance({
    draft: args.draft,
    companyId: args.companyId,
    context: args.context,
    application: args.application,
    balance,
    nextPending,
    nextUsed: balance.used,
    summary: args.reason,
    metadata: {
      employeeId: args.application.employeeId,
      leaveTypeId: args.application.leaveTypeId,
      periodYear: args.application.startDate.getFullYear(),
      pendingBefore: balance.pending,
      pendingAfter: nextPending,
      remainingAfter: computeRemainingBalance({
        openingBalance: balance.openingBalance,
        earned: balance.earned,
        used: balance.used,
        pending: nextPending,
        adjusted: balance.adjusted,
        forfeited: balance.forfeited,
        carriedForward: balance.carriedForward,
      }),
      leaveApplicationId: args.application.id,
    },
  });
};

export const finalizeLeaveApplicationApprovedBalance = (args: {
  draft: BalanceDraft;
  companyId: string;
  context?: LamMutationContext;
  application: LamLeaveApplication;
}): LamLeaveBalance => {
  const balance = findLeaveApplicationBalance({
    balances: args.draft.leaveBalances,
    companyId: args.companyId,
    application: args.application,
  });

  assertLeaveApplicationAvailableBalance({
    balance,
    totalDays: args.application.totalDays,
    phase: "approve",
  });

  if (balance.pending < args.application.totalDays) {
    throw new Error(
      `Leave balance pending is lower than application totalDays (${balance.pending} < ${args.application.totalDays})`
    );
  }

  const nextPending = balance.pending - args.application.totalDays;
  const nextUsed = balance.used + args.application.totalDays;
  return updateBalance({
    draft: args.draft,
    companyId: args.companyId,
    context: args.context,
    application: args.application,
    balance,
    nextPending,
    nextUsed,
    summary: `Leave balance finalized after approval for employee ${args.application.employeeId}`,
    metadata: {
      employeeId: args.application.employeeId,
      leaveTypeId: args.application.leaveTypeId,
      periodYear: args.application.startDate.getFullYear(),
      pendingBefore: balance.pending,
      pendingAfter: nextPending,
      usedBefore: balance.used,
      usedAfter: nextUsed,
      leaveApplicationId: args.application.id,
    },
  });
};

export const reverseLeaveApplicationApprovedBalance = (args: {
  draft: BalanceDraft;
  companyId: string;
  context?: LamMutationContext;
  application: LamLeaveApplication;
  reason: string;
}): LamLeaveBalance => {
  const balance = findLeaveApplicationBalance({
    balances: args.draft.leaveBalances,
    companyId: args.companyId,
    application: args.application,
  });

  if (balance.used < args.application.totalDays) {
    throw new Error(
      `Leave balance used is lower than application totalDays (${balance.used} < ${args.application.totalDays})`
    );
  }

  const nextUsed = balance.used - args.application.totalDays;
  return updateBalance({
    draft: args.draft,
    companyId: args.companyId,
    context: args.context,
    application: args.application,
    balance,
    nextPending: balance.pending,
    nextUsed,
    summary: args.reason,
    metadata: {
      employeeId: args.application.employeeId,
      leaveTypeId: args.application.leaveTypeId,
      periodYear: args.application.startDate.getFullYear(),
      usedBefore: balance.used,
      usedAfter: nextUsed,
      leaveApplicationId: args.application.id,
    },
  });
};

export const adjustLeaveApplicationUsedBalance = (args: {
  draft: BalanceDraft;
  companyId: string;
  context?: LamMutationContext;
  application: LamLeaveApplication;
  previousTotalDays: number;
  nextTotalDays: number;
  reason: string;
}): LamLeaveBalance => {
  const balance = findLeaveApplicationBalance({
    balances: args.draft.leaveBalances,
    companyId: args.companyId,
    application: args.application,
  });

  const dayDelta = args.nextTotalDays - args.previousTotalDays;
  if (dayDelta > 0 && balance.remaining < dayDelta) {
    throw new Error(
      `Insufficient leave balance for amendment: ${balance.remaining} day(s) remaining, ${dayDelta} additional day(s) required`
    );
  }

  if (balance.used < args.previousTotalDays) {
    throw new Error(
      `Leave balance used is lower than previous application totalDays (${balance.used} < ${args.previousTotalDays})`
    );
  }

  const nextUsed = balance.used - args.previousTotalDays + args.nextTotalDays;
  return updateBalance({
    draft: args.draft,
    companyId: args.companyId,
    context: args.context,
    application: args.application,
    balance,
    nextPending: balance.pending,
    nextUsed,
    summary: args.reason,
    metadata: {
      employeeId: args.application.employeeId,
      leaveTypeId: args.application.leaveTypeId,
      periodYear: args.application.startDate.getFullYear(),
      previousTotalDays: args.previousTotalDays,
      nextTotalDays: args.nextTotalDays,
      usedBefore: balance.used,
      usedAfter: nextUsed,
      leaveApplicationId: args.application.id,
    },
  });
};

export const releaseLeaveApplicationPendingBalanceIfRequired = (args: {
  draft: BalanceDraft;
  companyId: string;
  context?: LamMutationContext;
  application: LamLeaveApplication;
  leaveType: LamLeaveType | null;
  reason: string;
}): void => {
  if (
    !applicationHasPendingBalanceReservation({
      balances: args.draft.leaveBalances,
      companyId: args.companyId,
      application: args.application,
    })
  ) {
    return;
  }

  if (args.leaveType && shouldReserveLeaveBalance(args.leaveType)) {
    releaseLeaveApplicationPendingBalance({
      draft: args.draft,
      companyId: args.companyId,
      context: args.context,
      application: args.application,
      reason: args.reason,
    });
    return;
  }

  throw new Error(
    `Active leave type is required to release pending leave balance for cancelled application "${args.application.id}"`
  );
};

export const reverseLeaveApplicationApprovedBalanceIfRequired = (args: {
  draft: BalanceDraft;
  companyId: string;
  context?: LamMutationContext;
  application: LamLeaveApplication;
  leaveType: LamLeaveType | null;
  reason: string;
}): void => {
  if (
    !applicationHasUsedBalanceReservation({
      balances: args.draft.leaveBalances,
      companyId: args.companyId,
      application: args.application,
    })
  ) {
    return;
  }

  if (args.leaveType && shouldReserveLeaveBalance(args.leaveType)) {
    reverseLeaveApplicationApprovedBalance({
      draft: args.draft,
      companyId: args.companyId,
      context: args.context,
      application: args.application,
      reason: args.reason,
    });
    return;
  }

  throw new Error(
    `Active leave type is required to reverse used leave balance for cancelled application "${args.application.id}"`
  );
};
