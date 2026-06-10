import "server-only";

import type {
  LamNotificationIntent,
  ListLamOverdueApprovalsQuery,
} from "../contracts/notification.contract.ts";
import {
  DEFAULT_LAM_APPROVAL_OVERDUE_HOURS,
  listLamOverdueApprovalsQuerySchema,
} from "../contracts/notification.contract.ts";
import {
  buildLamAttendanceCorrectionNotificationIntent,
  buildLamLeaveApplicationNotificationIntent,
} from "../projector/notifications.ts";
import { loadLamRepository } from "../repository.ts";
import type { LamReadContext } from "../schema.ts";
import { filterByCompany, filterByEmployeeDataScope, readContext } from "./shared.ts";

const PENDING_LEAVE_STATUSES = ["submitted", "pending_approval"] as const;
const PENDING_CORRECTION_STATUSES = ["submitted", "pending_approval"] as const;

export type LamOverdueApprovalItem = {
  readonly intent: LamNotificationIntent;
  readonly submittedAt: Date;
};

export async function listLamOverdueApprovalNotifications(
  query: ListLamOverdueApprovalsQuery = {},
  context?: LamReadContext
): Promise<readonly LamOverdueApprovalItem[]> {
  const parsed = listLamOverdueApprovalsQuerySchema.parse(query);
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return [];
  }

  const overdueAfterHours =
    parsed.overdueAfterHours ?? DEFAULT_LAM_APPROVAL_OVERDUE_HOURS;
  const cutoff = new Date(Date.now() - overdueAfterHours * 60 * 60 * 1000);
  const items: LamOverdueApprovalItem[] = [];

  for (const application of filterByEmployeeDataScope(
    filterByCompany(state.leaveApplications, ctx.companyId),
    context
  )) {
    if (
      !(
        PENDING_LEAVE_STATUSES.includes(
          application.status as (typeof PENDING_LEAVE_STATUSES)[number]
        ) && application.submittedAt
      ) ||
      application.submittedAt.getTime() > cutoff.getTime()
    ) {
      continue;
    }

    items.push({
      submittedAt: application.submittedAt,
      intent: buildLamLeaveApplicationNotificationIntent({
        application,
        kind: "overdue",
      }),
    });
  }

  if (parsed.includeAttendanceCorrections ?? true) {
    for (const correction of filterByEmployeeDataScope(
      filterByCompany(state.attendanceCorrections, ctx.companyId),
      context
    )) {
      if (
        !PENDING_CORRECTION_STATUSES.includes(
          correction.status as (typeof PENDING_CORRECTION_STATUSES)[number]
        ) ||
        correction.submittedAt.getTime() > cutoff.getTime()
      ) {
        continue;
      }

      items.push({
        submittedAt: correction.submittedAt,
        intent: buildLamAttendanceCorrectionNotificationIntent({
          correction,
          kind: "overdue",
        }),
      });
    }
  }

  return items.sort(
    (left, right) => left.submittedAt.getTime() - right.submittedAt.getTime()
  );
}
