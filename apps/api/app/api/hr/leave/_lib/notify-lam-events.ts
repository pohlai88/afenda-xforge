import type {
  LamNotificationIntent,
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
  resolveLeaveApprovalOrchestration,
  type LamApprovalOrchestrationSubject,
} from "../../_lib/lam-approval-orchestration.ts";
import { resolveLamNotificationRecipientsWithRegistry } from "../../_lib/lam-notification-orchestration.ts";
import {
  createLamNotificationReadContext as createAttendanceNotificationReadContext,
  createLamWriteContext as createAttendanceWriteContext,
} from "../../attendance/_lib/context.ts";
import {
  createLamApprovalContext,
  createLamNotificationReadContext as createLeaveNotificationReadContext,
  createLamWriteContext as createLeaveWriteContext,
} from "./context.ts";
import { dispatchLamNotificationIntent } from "./dispatch-lam-notifications.ts";

const createLeaveDecisionNotificationReadContext = async (
  request: Request,
  kind: LamNotificationKind
): Promise<LamReadContext> => {
  const readContext = await createLeaveNotificationReadContext(request);

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

const toApprovalOrchestrationSubject = (args: {
  approvalRouteId?: string | null;
  currentStepOrder?: number | null;
  employeeId: string;
  status: string;
}): LamApprovalOrchestrationSubject => ({
  approvalRouteId: args.approvalRouteId,
  currentStepOrder: args.currentStepOrder,
  employeeId: args.employeeId,
  status: args.status,
});

const resolveNotificationOrchestration = async (args: {
  correction?: {
    approvalRouteId?: string | null;
    currentStepOrder?: number | null;
    employeeId: string;
    status: string;
  } | null;
  intent?: LamNotificationIntent;
  readContext: LamReadContext;
  subject?: LamApprovalOrchestrationSubject | null;
}) => {
  if (args.subject) {
    return resolveLeaveApprovalOrchestration({
      readContext: args.readContext,
      subject: args.subject,
    });
  }

  if (args.correction) {
    return resolveLeaveApprovalOrchestration({
      readContext: args.readContext,
      subject: toApprovalOrchestrationSubject(args.correction),
    });
  }

  if (!args.intent) {
    return {};
  }

  if (args.intent.subjectType === "leave_application") {
    const application = await getLamLeaveApplicationById(
      args.intent.subjectId,
      args.readContext
    );

    if (application) {
      return resolveLeaveApprovalOrchestration({
        readContext: args.readContext,
        subject: application,
      });
    }
  }

  if (args.intent.subjectType === "attendance_correction") {
    const correction = await getLamAttendanceCorrectionById(
      args.intent.subjectId,
      args.readContext
    );

    if (correction) {
      return resolveLeaveApprovalOrchestration({
        readContext: args.readContext,
        subject: toApprovalOrchestrationSubject(correction),
      });
    }
  }

  return {};
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
  const readContext = await createLeaveDecisionNotificationReadContext(
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
  const orchestration = await resolveNotificationOrchestration({
    readContext,
    subject: application,
  });
  const recipients = await resolveLamNotificationRecipientsWithRegistry({
    request: args.request,
    body: args.body,
    hints: {
      approverEmployeeIds: orchestration.resolvedStepApproverEmployeeIds,
      companyId: application.companyId ?? readContext.companyId,
      employeeId: application.employeeId,
      tenantId: readContext.tenantId,
    },
  });
  const writeContext = await createLeaveWriteContext(args.request);

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
  const readContext = await createAttendanceNotificationReadContext(args.request);
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
  const orchestration = await resolveNotificationOrchestration({
    correction,
    readContext: readContext as LamReadContext,
  });
  const recipients = await resolveLamNotificationRecipientsWithRegistry({
    request: args.request,
    body: args.body,
    hints: {
      approverEmployeeIds: orchestration.resolvedStepApproverEmployeeIds,
      companyId: correction.companyId ?? readContext.companyId,
      employeeId: correction.employeeId,
      tenantId: readContext.tenantId,
    },
  });
  const writeContext = await createAttendanceWriteContext(args.request);

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
  const writeContext = await createLamApprovalContext(args.request);
  const readContext = await createLeaveNotificationReadContext(args.request);
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

  let dispatchedCount = 0;

  for (const intent of result.intents) {
    const orchestration = await resolveNotificationOrchestration({
      intent,
      readContext,
    });
    const recipients = await resolveLamNotificationRecipientsWithRegistry({
      request: args.request,
      body: args.body,
      hints: {
        approverEmployeeIds: orchestration.resolvedStepApproverEmployeeIds,
        companyId: intent.companyId ?? writeContext.companyId,
        employeeId: intent.employeeId,
        tenantId: writeContext.tenantId ?? readContext.tenantId,
      },
    });
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
          writeContext
        ),
    }).catch(() => ({ dispatched: false }));

    if (dispatchResult.dispatched) {
      dispatchedCount += 1;
    }
  }

  return { dispatchedCount, intentCount: result.intents.length };
};
