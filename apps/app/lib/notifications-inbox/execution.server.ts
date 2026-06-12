import "server-only";

import { randomUUID } from "node:crypto";
import { requireActiveTenantMembership } from "@repo/auth/server";
import { writeAuditEvent, writeAuditEventInTransaction } from "@repo/audit";
import { database } from "@repo/database";
import { ConfigurationError } from "@repo/errors";
import type {
  ExecutionDatabaseTransaction,
  ExecutionDomainResult,
} from "@repo/execution";
import { createExecutionPipeline } from "@repo/execution";
import { requirePermission } from "@repo/permissions";
import {
  archiveAllNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationsSeen,
  type NotificationInboxEntry,
} from "@repo/notifications";
import {
  notificationInboxPatchSchema,
  type NotificationInboxPatchInput,
} from "./mutation-schema.ts";

const NOTIFICATIONS_RESOURCE = "workspace.notifications";
const ROUTE = "/api/me/notifications";

export type NotificationInboxMutationScope = {
  operationId?: string;
  requestId?: string;
};

export type NotificationInboxMutationResult =
  | { archivedCount: number }
  | { updatedCount: number }
  | { item: NotificationInboxEntry | null }
  | { items: readonly NotificationInboxEntry[] };

const writeNotificationInboxAuditEvent = (
  event: Parameters<typeof writeAuditEvent>[0],
  db?: ExecutionDatabaseTransaction
) => {
  if (db) {
    return writeAuditEventInTransaction(db, event);
  }

  return writeAuditEvent(event);
};

export const executeNotificationInboxMutation = (
  input: NotificationInboxPatchInput,
  scope: NotificationInboxMutationScope = {}
): Promise<NotificationInboxMutationResult> => {
  const requestId = scope.requestId?.trim() || randomUUID();
  const operationId = scope.operationId?.trim() || requestId;
  let membership: Awaited<ReturnType<typeof requireActiveTenantMembership>> | null =
    null;

  const pipeline = createExecutionPipeline<
    NotificationInboxPatchInput,
    NotificationInboxMutationResult
  >({
    executeDomainOperation: async ({ db, input: mutationInput, actor, tenant }) => {
      const tenantId = tenant.tenantId;
      const userId = actor.actorId;

      if (mutationInput.action === "archive-all") {
        const archivedCount = await archiveAllNotifications({
          db,
          tenantId,
          userId,
        });

        return {
          action: "workspace.notifications.archive-all",
          after: { archivedCount },
          before: {},
          channel: "api",
          metadata: { feature: "workspace.notifications" },
          module: "workspace",
          reason: "Notification inbox archived",
          result: { archivedCount },
          route: ROUTE,
          summary: `Archived ${archivedCount} notifications`,
          targetId: userId,
          targetType: "user-notification-inbox",
        } satisfies ExecutionDomainResult<{ archivedCount: number }>;
      }

      if (mutationInput.action === "mark-all-read") {
        const updatedCount = await markAllNotificationsRead({
          db,
          tenantId,
          userId,
        });

        return {
          action: "workspace.notifications.mark-all-read",
          after: { updatedCount },
          before: {},
          channel: "api",
          metadata: { feature: "workspace.notifications" },
          module: "workspace",
          reason: "All notifications marked read",
          result: { updatedCount },
          route: ROUTE,
          summary: `Marked ${updatedCount} notifications read`,
          targetId: userId,
          targetType: "user-notification-inbox",
        } satisfies ExecutionDomainResult<{ updatedCount: number }>;
      }

      if (mutationInput.action === "mark-read") {
        const item = await markNotificationRead({
          db,
          id: mutationInput.id,
          tenantId,
          userId,
        });

        return {
          action: "workspace.notifications.mark-read",
          after: item ? { readAt: item.readAt } : {},
          before: {},
          channel: "api",
          metadata: { feature: "workspace.notifications" },
          module: "workspace",
          reason: "Notification marked read",
          result: { item },
          route: ROUTE,
          summary: "Marked notification read",
          targetId: mutationInput.id,
          targetType: "notification-inbox-entry",
        } satisfies ExecutionDomainResult<{ item: NotificationInboxEntry | null }>;
      }

      const items = await markNotificationsSeen({
        db,
        ids: mutationInput.ids,
        tenantId,
        userId,
      });

      return {
        action: "workspace.notifications.mark-seen",
        after: { count: items.length },
        before: {},
        channel: "api",
        metadata: { feature: "workspace.notifications", ids: mutationInput.ids },
        module: "workspace",
        reason: "Notifications marked seen",
        result: { items },
        route: ROUTE,
        summary: `Marked ${items.length} notifications seen`,
        targetId: userId,
        targetType: "user-notification-inbox",
      } satisfies ExecutionDomainResult<{ items: readonly NotificationInboxEntry[] }>;
    },
    operationId,
    permissionContext: (_actor, tenant) => ({
      action: "workspace.notifications.update",
      actorId: membership?.userId ?? "",
      grantedPermissions: [],
      resource: NOTIFICATIONS_RESOURCE,
      tenantId: tenant.tenantId,
    }),
    permissionRequirement: {},
    requestId,
    requireAuth: async () => {
      membership = await requireActiveTenantMembership();

      return {
        actorId: membership.userId,
        actorType: "user",
      };
    },
    requirePermission,
    requireTenantMembership: async () => undefined,
    resolveActiveTenant: async () => {
      if (!membership) {
        throw new ConfigurationError(
          "Active tenant membership was not resolved for notification inbox mutation"
        );
      }

      return { tenantId: membership.tenantId };
    },
    runInTransaction: (run) => database.transaction(run),
    validateInput: (value) => {
      notificationInboxPatchSchema.parse(value);
    },
    writeAuditEvent: writeNotificationInboxAuditEvent,
  });

  return pipeline(input);
};
