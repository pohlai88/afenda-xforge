import "server-only";

import { randomUUID } from "node:crypto";
import { writeAuditEvent } from "@repo/audit";
import { ConfigurationError } from "@repo/errors";
import { createQueryPipeline } from "@repo/execution";
import {
  permissionCatalog,
  requirePermission,
  resolvePermissionsForTenantRole,
} from "@repo/permissions";
import type {
  TenantKeyboardShortcutPolicyPayload,
  WorkspaceShortcutsPayload,
} from "./contract.ts";
import {
  getKeyboardShortcutsAuthBindings,
  type KeyboardShortcutsTenantAccess,
  type KeyboardShortcutsTenantMembership,
} from "./auth-bindings.server.ts";
import {
  readTenantKeyboardShortcutPolicy,
  readWorkspaceShortcuts,
} from "./repository.server.ts";

const WORKSPACE_RESOURCE = "workspace.keyboard-shortcuts";
const ADMIN_RESOURCE = "system-admin.tenant-settings";

export type WorkspaceShortcutsQueryScope = {
  requestId?: string;
};

export type TenantKeyboardShortcutPolicyQueryScope = {
  companyId?: string;
  requestId?: string;
};

export const queryWorkspaceShortcuts = (
  scope: WorkspaceShortcutsQueryScope = {}
): Promise<WorkspaceShortcutsPayload> => {
  const requestId = scope.requestId?.trim() || randomUUID();
  let resolvedMembership: KeyboardShortcutsTenantMembership | null = null;

  const pipeline = createQueryPipeline<
    Record<string, never>,
    WorkspaceShortcutsPayload
  >({
    auditQueryEvent: (result, { actor, tenant }) => ({
      action: "workspace.keyboard-shortcuts.read",
      actorId: actor.actorId,
      actorType: "user",
      after: {
        bindingCount: Object.keys(result.bindings).length,
      },
      before: {},
      metadata: {
        allowUserCustomize: result.policy.allowUserCustomize,
      },
      module: "workspace",
      reason: "Resolved workspace keyboard shortcuts",
      requestId,
      route: "/api/me/keyboard-shortcuts",
      summary: "Workspace keyboard shortcuts resolved",
      targetId: actor.actorId,
      targetType: "user-workspace-preferences",
      tenantId: tenant.tenantId,
    }),
    executeQuery: ({ actor, tenant }) =>
      readWorkspaceShortcuts(tenant.tenantId, actor.actorId),
    permissionContext: (_actor, tenant) => ({
      action: "workspace.keyboard-shortcuts.read",
      actorId: resolvedMembership?.userId ?? "",
      grantedPermissions: resolvedMembership
        ? resolvePermissionsForTenantRole(resolvedMembership.role)
        : [],
      resource: WORKSPACE_RESOURCE,
      tenantId: tenant.tenantId,
    }),
    // Intentionally empty: any authenticated tenant member may read personal shortcuts.
    permissionRequirement: {},
    requireAuth: async () => {
      resolvedMembership =
        await getKeyboardShortcutsAuthBindings().requireActiveTenantMembership();

      return {
        actorId: resolvedMembership.userId,
        actorType: "user",
      };
    },
    requirePermission,
    requireTenantMembership: async () => undefined,
    resolveActiveTenant: async () => {
      if (!resolvedMembership) {
        throw new ConfigurationError(
          "Active tenant membership was not resolved for keyboard shortcut read"
        );
      }

      return { tenantId: resolvedMembership.tenantId };
    },
    validateInput: () => undefined,
    writeAuditEvent,
  });

  return pipeline({});
};

export const queryTenantKeyboardShortcutPolicy = (
  scope: TenantKeyboardShortcutPolicyQueryScope = {}
): Promise<TenantKeyboardShortcutPolicyPayload> => {
  const requestId = scope.requestId?.trim() || randomUUID();
  let resolvedAccess: KeyboardShortcutsTenantAccess | null = null;

  const pipeline = createQueryPipeline<
    Record<string, never>,
    TenantKeyboardShortcutPolicyPayload
  >({
    auditQueryEvent: (_result, { actor, tenant }) => ({
      action: permissionCatalog.systemAdmin.tenantSettingsRead,
      actorId: actor.actorId,
      actorType: "user",
      after: {},
      before: {},
      module: "system-admin",
      reason: "Tenant keyboard shortcut policy read",
      requestId,
      route: "/api/admin/tenant/keyboard-shortcuts",
      summary: "Tenant keyboard shortcut policy read",
      targetId: tenant.tenantId,
      targetType: "tenant-keyboard-shortcut-policy",
      tenantId: tenant.tenantId,
    }),
    executeQuery: ({ tenant }) => readTenantKeyboardShortcutPolicy(tenant.tenantId),
    permissionContext: (_actor, tenant) => ({
      action: permissionCatalog.systemAdmin.tenantSettingsRead,
      actorId: resolvedAccess?.user.id ?? "",
      companyId: scope.companyId,
      grantedPermissions: resolvedAccess
        ? resolvePermissionsForTenantRole(resolvedAccess.membership.role)
        : [],
      resource: ADMIN_RESOURCE,
      tenantId: tenant.tenantId,
    }),
    permissionRequirement: {
      allOf: [permissionCatalog.systemAdmin.tenantSettingsRead],
    },
    requireAuth: async () => {
      resolvedAccess =
        await getKeyboardShortcutsAuthBindings().requireActiveTenantAccess();

      return {
        actorId: resolvedAccess.user.id,
        actorType: "user",
      };
    },
    requirePermission,
    requireTenantMembership: async () => undefined,
    resolveActiveTenant: async () => {
      if (!resolvedAccess) {
        throw new ConfigurationError(
          "Active tenant access was not resolved for tenant keyboard shortcut policy read"
        );
      }

      return { tenantId: resolvedAccess.membership.tenantId };
    },
    validateInput: () => undefined,
    writeAuditEvent,
  });

  return pipeline({});
};
