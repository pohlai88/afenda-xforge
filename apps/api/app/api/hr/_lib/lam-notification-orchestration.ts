import "server-only";

import type { LamNotificationRecipients } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { resolveAuthUserIdByEmployeeId } from "@repo/features-employee-management-employee-records-management/server";
import { isLamOrchestrationHeaderMode } from "./lam-governed-context.ts";
import { parseLamNotificationRecipients } from "../leave/_lib/dispatch-lam-notifications.ts";

const header = (request: Request, name: string): string | undefined =>
  request.headers.get(name)?.trim() || undefined;

const hasExplicitNotificationRecipients = (
  recipients: LamNotificationRecipients
): boolean =>
  Boolean(recipients.employeeUserId?.trim()) ||
  (recipients.approverUserIds?.length ?? 0) > 0;

const resolveAuthUserIdsForEmployeeIds = async (args: {
  companyId: string;
  employeeIds: readonly string[];
  tenantId: string;
}): Promise<string[]> => {
  const userIds = new Set<string>();

  for (const employeeId of args.employeeIds) {
    const trimmedEmployeeId = employeeId.trim();
    if (!trimmedEmployeeId) {
      continue;
    }

    const userId = await resolveAuthUserIdByEmployeeId({
      companyId: args.companyId,
      employeeId: trimmedEmployeeId,
      tenantId: args.tenantId,
    });

    if (userId?.trim()) {
      userIds.add(userId.trim());
    }
  }

  return [...userIds];
};

export const resolveLamNotificationRecipientsWithRegistry = async (args: {
  body?: Record<string, unknown>;
  hints?: {
    approverEmployeeIds?: readonly string[];
    companyId?: string | null;
    employeeId?: string | null;
    tenantId?: string | null;
  };
  request: Request;
}): Promise<
  LamNotificationRecipients & { tenantId?: string; companyId?: string }
> => {
  const parsed = parseLamNotificationRecipients(args.request, args.body);

  if (
    isLamOrchestrationHeaderMode() &&
    (header(args.request, "x-lam-employee-user-id") ||
      header(args.request, "x-lam-approver-user-ids"))
  ) {
    return parsed;
  }

  if (hasExplicitNotificationRecipients(parsed)) {
    return parsed;
  }

  const tenantId =
    parsed.tenantId?.trim() ||
    args.hints?.tenantId?.trim() ||
    header(args.request, "x-tenant-id");
  const companyId =
    parsed.companyId?.trim() ||
    args.hints?.companyId?.trim() ||
    header(args.request, "x-company-id");

  if (!tenantId || !companyId) {
    return parsed;
  }

  const scope = { companyId, tenantId };
  const employeeUserId =
    parsed.employeeUserId ??
    (args.hints?.employeeId
      ? await resolveAuthUserIdByEmployeeId({
          ...scope,
          employeeId: args.hints.employeeId,
        })
      : undefined);

  const approverUserIds =
    parsed.approverUserIds ??
    (args.hints?.approverEmployeeIds?.length
      ? await resolveAuthUserIdsForEmployeeIds({
          ...scope,
          employeeIds: args.hints.approverEmployeeIds,
        })
      : undefined);

  return {
    ...parsed,
    companyId,
    tenantId,
    ...(employeeUserId ? { employeeUserId } : {}),
    ...(approverUserIds?.length ? { approverUserIds } : {}),
  };
};
