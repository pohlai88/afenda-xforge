import "server-only";

import type {
  LamMutationResult,
  RecordLamNotificationEnqueuedInput,
} from "../contracts/index.ts";
import {
  leaveAttendanceManagementAuditEvents,
  processLamOverdueNotificationsInputSchema,
  recordLamNotificationEnqueuedInputSchema,
} from "../contracts/index.ts";
import type { LamNotificationIntent } from "../contracts/notification.contract.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamOverdueNotificationAccess,
} from "../execution.ts";
import { listLamOverdueApprovalNotifications } from "../queries/overdue-approvals.query.ts";
import { mutateLamRepository } from "../repository.ts";
import { lamWriteContextSchema } from "../schema.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave and attendance notification failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error("Company context is required for notification mutations");
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

const entityTypeForIntent = (
  intent: LamNotificationIntent
): "leave_application" | "attendance_correction" =>
  intent.subjectType === "leave_application"
    ? "leave_application"
    : "attendance_correction";

export async function recordLamNotificationEnqueued(
  input: RecordLamNotificationEnqueuedInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamOverdueNotificationAccess(context);
  if (denied && !denied.ok) {
    return { ok: false, error: denied.error ?? "Write access denied" };
  }

  try {
    const validInput = recordLamNotificationEnqueuedInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId ?? validInput.intent.companyId,
    });
    const notificationId =
      validInput.notificationId?.trim() || crypto.randomUUID();
    const intent = validInput.intent;

    await mutateLamRepository((draft) => {
      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action: leaveAttendanceManagementAuditEvents.notificationEnqueued,
          entityType: entityTypeForIntent(intent),
          entityId: intent.subjectId,
          summary: `Notification enqueued for ${intent.event}`,
          metadata: buildLamAuditMetadata({
            notificationId,
            event: intent.event,
            kind: intent.kind,
            subjectType: intent.subjectType,
            subjectId: intent.subjectId,
            employeeId: intent.employeeId,
            recipientUserIds: validInput.recipientUserIds,
            title: intent.title,
          }),
          before: null,
          after: {
            notificationId,
            event: intent.event,
            recipientUserIds: validInput.recipientUserIds,
          },
        })
      );
    }, parsedContext);

    return { ok: true, targetId: notificationId };
  } catch (error) {
    return toFailure(error);
  }
}

export async function processLamOverdueApprovalNotifications(
  input: Parameters<typeof processLamOverdueNotificationsInputSchema.parse>[0],
  context?: LamMutationContext
): Promise<
  | { ok: false; error: string }
  | {
      ok: true;
      targetId: string;
      intents: readonly LamNotificationIntent[];
    }
> {
  const denied = requireLamOverdueNotificationAccess(context);
  if (denied && !denied.ok) {
    return { ok: false, error: denied.error ?? "Write access denied" };
  }

  try {
    const validInput = processLamOverdueNotificationsInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });

    const overdueItems = await listLamOverdueApprovalNotifications(
      {
        companyId,
        overdueAfterHours: validInput.overdueAfterHours,
        includeAttendanceCorrections: validInput.includeAttendanceCorrections,
      },
      {
        ...parsedContext,
        canRead: true,
      }
    );

    if (overdueItems.length === 0) {
      return {
        ok: true,
        targetId: companyId,
        intents: [],
      };
    }

    const batchId = crypto.randomUUID();

    await mutateLamRepository((draft) => {
      for (const item of overdueItems) {
        draft.auditEvents.push(
          createLamMutationAuditEvent({
            companyId,
            actorId: normalizeLamMutationActorId(context),
            action: leaveAttendanceManagementAuditEvents.notificationEnqueued,
            entityType: entityTypeForIntent(item.intent),
            entityId: item.intent.subjectId,
            summary: `Overdue notification prepared for ${item.intent.event}`,
            metadata: buildLamAuditMetadata({
              notificationBatchId: batchId,
              event: item.intent.event,
              kind: item.intent.kind,
              subjectType: item.intent.subjectType,
              subjectId: item.intent.subjectId,
              employeeId: item.intent.employeeId,
              submittedAt: item.submittedAt.toISOString(),
            }),
            before: null,
            after: item.intent,
          })
        );
      }
    }, parsedContext);

    return {
      ok: true,
      targetId: batchId,
      intents: overdueItems.map((item) => item.intent),
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Overdue notification failure",
    };
  }
}
