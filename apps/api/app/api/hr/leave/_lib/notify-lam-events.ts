import type {
  LamNotificationKind,
  LamReadContext,
} from "@repo/features-time-attendance-leave-attendance-management/contract";
import {
  buildLamAttendanceCorrectionNotificationIntent,
  buildLamLeaveApplicationNotificationIntent,
  getLamAttendanceCorrectionById,
  getLamLeaveApplicationById,
  getLamLeaveTypeById,
  processLamOverdueApprovalNotifications,
  recordLamNotificationEnqueued,
  resolveLamNotificationRecipientUserIds,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  createLamNotificationReadContext as createAttendanceNotificationReadContext,
  createLamWriteContext as createAttendanceWriteContext,
} from "../../attendance/_lib/context.ts";
import {
  createLamApprovalContext,
  createLamNotificationReadContext as createLeaveNotificationReadContext,
  createLamWriteContext as createLeaveWriteContext,
} from "./context.ts";
import {
  dispatchLamNotificationIntent,
  parseLamNotificationRecipients,
} from "./dispatch-lam-notifications.ts";

const createLeaveDecisionNotificationReadContext = (
  request: Request,
  kind: LamNotificationKind
): LamReadContext => {
  const readContext = createLeaveNotificationReadContext(request);

  if (kind !== "rejected" && kind !== "returned") {
    return readContext;
  }

  return {
    ...readContext,
    canViewSensitive: true,
    grantedCapabilities: [
      ...new Set([
        ...(readContext.grantedCapabilities ?? []),
        "hr.lam.leave-applications.approve",
      ]),
    ],
  };
};

export const notifyLamLeaveApplicationEvent = async (args: {
  request: Request;
  applicationId: string;
  kind: LamNotificationKind;
  body?: Record<string, unknown>;
  rejectionReason?: string | null;
  returnedReason?: string | null;
  requestType?: "return" | "clarification";
}): Promise<void> => {
  const readContext = createLeaveDecisionNotificationReadContext(
    args.request,
    args.kind
  );
  const application = await getLamLeaveApplicationById(
    args.applicationId,
    readContext
  );

  if (!application) {
    return;
  }

  const leaveType = await getLamLeaveTypeById(
    application.leaveTypeId,
    readContext
  );
  const intent = buildLamLeaveApplicationNotificationIntent({
    application,
    kind: args.kind,
    leaveTypeName: leaveType?.name,
    rejectionReason: args.rejectionReason ?? application.rejectionReason,
    returnedReason: args.returnedReason ?? application.returnedReason,
    requestType: args.requestType,
  });
  const recipients = parseLamNotificationRecipients(args.request, args.body);
  const writeContext = createLeaveWriteContext(args.request);

  await dispatchLamNotificationIntent({
    intent,
    recipients,
    resolveRecipientUserIds: resolveLamNotificationRecipientUserIds,
    recordAudit: async ({ notificationId, recipientUserIds }) =>
      recordLamNotificationEnqueued(
        {
          companyId: application.companyId ?? undefined,
          notificationId,
          intent,
          recipientUserIds,
        },
        writeContext
      ),
  }).catch(() => undefined);
};

export const notifyLamAttendanceCorrectionEvent = async (args: {
  request: Request;
  correctionId: string;
  kind: Exclude<LamNotificationKind, "cancelled" | "returned">;
  body?: Record<string, unknown>;
  rejectionReason?: string | null;
}): Promise<void> => {
  const readContext = createAttendanceNotificationReadContext(args.request);
  const correction = await getLamAttendanceCorrectionById(
    args.correctionId,
    readContext as LamReadContext
  );

  if (!correction) {
    return;
  }

  const intent = buildLamAttendanceCorrectionNotificationIntent({
    correction,
    kind: args.kind,
    rejectionReason: args.rejectionReason,
  });
  const recipients = parseLamNotificationRecipients(args.request, args.body);
  const writeContext = createAttendanceWriteContext(args.request);

  await dispatchLamNotificationIntent({
    intent,
    recipients,
    resolveRecipientUserIds: resolveLamNotificationRecipientUserIds,
    recordAudit: async ({ notificationId, recipientUserIds }) =>
      recordLamNotificationEnqueued(
        {
          companyId: correction.companyId ?? undefined,
          notificationId,
          intent,
          recipientUserIds,
        },
        writeContext
      ),
  }).catch(() => undefined);
};

export const notifyLamOverdueApprovals = async (args: {
  request: Request;
  body?: Record<string, unknown>;
}): Promise<{ dispatchedCount: number; intentCount: number }> => {
  const writeContext = createLamApprovalContext(args.request);
  const result = await processLamOverdueApprovalNotifications(
    {
      companyId: writeContext.companyId,
      overdueAfterHours:
        typeof args.body?.overdueAfterHours === "number"
          ? args.body.overdueAfterHours
          : undefined,
      includeAttendanceCorrections: args.body?.includeAttendanceCorrections as
        | boolean
        | undefined,
    },
    writeContext
  );

  if (!result.ok || result.intents.length === 0) {
    return {
      dispatchedCount: 0,
      intentCount: result.ok ? result.intents.length : 0,
    };
  }

  const recipients = parseLamNotificationRecipients(args.request, args.body);
  let dispatchedCount = 0;

  for (const intent of result.intents) {
    const dispatchResult = await dispatchLamNotificationIntent({
      intent,
      recipients,
      resolveRecipientUserIds: resolveLamNotificationRecipientUserIds,
      recordAudit: async ({ notificationId, recipientUserIds }) =>
        recordLamNotificationEnqueued(
          {
            companyId: intent.companyId,
            notificationId,
            intent,
            recipientUserIds,
          },
          createLeaveWriteContext(args.request)
        ),
    }).catch(() => ({ dispatched: false }));

    if (dispatchResult.dispatched) {
      dispatchedCount += 1;
    }
  }

  return { dispatchedCount, intentCount: result.intents.length };
};
