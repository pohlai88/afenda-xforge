import "server-only";

import { randomUUID } from "node:crypto";
import { requireActiveTenantMembership } from "@repo/auth/server";
import { writeAuditEvent } from "@repo/audit";
import { ConfigurationError } from "@repo/errors";
import { createQueryPipeline } from "@repo/execution";
import { requirePermission } from "@repo/permissions";
import {
  listNotificationInbox,
  type NotificationInboxListResult,
} from "@repo/notifications";

const NOTIFICATIONS_RESOURCE = "workspace.notifications";
const ROUTE = "/api/me/notifications";

export type NotificationInboxQueryScope = {
  limit?: number;
  requestId?: string;
};

export const queryNotificationInbox = (
  scope: NotificationInboxQueryScope = {}
): Promise<NotificationInboxListResult> => {
  const requestId = scope.requestId?.trim() || randomUUID();
  let membership: Awaited<ReturnType<typeof requireActiveTenantMembership>> | null =
    null;
  const limit = scope.limit;

  const pipeline = createQueryPipeline<
    { limit?: number },
    NotificationInboxListResult
  >({
    auditQueryEvent: (result, { actor, tenant }) => ({
      action: "workspace.notifications.read",
      actorId: actor.actorId,
      actorType: "user",
      after: {
        itemCount: result.items.length,
        unreadCount: result.unreadCount,
      },
      before: {},
      module: "workspace",
      reason: "Notification inbox listed",
      requestId,
      route: ROUTE,
      summary: "Notification inbox read",
      targetId: actor.actorId,
      targetType: "user-notification-inbox",
      tenantId: tenant.tenantId,
    }),
    executeQuery: ({ actor, tenant }) =>
      listNotificationInbox({
        limit: limit,
        tenantId: tenant.tenantId,
        userId: actor.actorId,
      }),
    permissionContext: (_actor, tenant) => ({
      action: "workspace.notifications.read",
      actorId: membership?.userId ?? "",
      grantedPermissions: [],
      resource: NOTIFICATIONS_RESOURCE,
      tenantId: tenant.tenantId,
    }),
    permissionRequirement: {},
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
          "Active tenant membership was not resolved for notification inbox read"
        );
      }

      return { tenantId: membership.tenantId };
    },
    validateInput: () => undefined,
    writeAuditEvent,
  });

  return pipeline({ limit });
};
