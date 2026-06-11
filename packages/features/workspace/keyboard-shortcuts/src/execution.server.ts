import "server-only";

import { randomUUID } from "node:crypto";
import { writeAuditEvent, writeAuditEventInTransaction } from "@repo/audit";
import { database } from "@repo/database";
import { BusinessRuleError, ConfigurationError, ForbiddenError } from "@repo/errors";
import type {
  ExecutionDatabaseTransaction,
  ExecutionDomainResult,
  ExecutionMutationContext,
} from "@repo/execution";
import { createExecutionPipeline } from "@repo/execution";
import { permissionCatalog, requirePermission, resolvePermissionsForTenantRole } from "@repo/permissions";
import type {
  ShortcutOverridePatch,
  TenantKeyboardShortcutPolicyPayload,
  WorkspaceShortcutsPayload,
} from "./contract.ts";
import {
  getKeyboardShortcutsAuthBindings,
  type KeyboardShortcutsTenantAccess,
  type KeyboardShortcutsTenantMembership,
} from "./auth-bindings.server.ts";
import { shortcutOverridesPostSchema } from "./override-schema.ts";
import {
  readTenantKeyboardShortcutPolicy,
  readWorkspaceShortcuts,
  upsertTenantKeyboardShortcutPolicy,
  upsertUserShortcutOverrides,
} from "./repository.server.ts";
import { validateUserOverrides } from "./resolve-shortcuts.ts";
import type { TenantKeyboardShortcutPolicyPost } from "./tenant-policy-schema.ts";
import { tenantKeyboardShortcutPolicyPostSchema } from "./tenant-policy-schema.ts";

const WORKSPACE_RESOURCE = "workspace.keyboard-shortcuts";
const ADMIN_RESOURCE = "system-admin.tenant-settings";

export type UserShortcutMutationScope = {
  operationId?: string;
  requestId?: string;
};

export type TenantKeyboardShortcutMutationScope = {
  companyId?: string;
  operationId?: string;
  requestId?: string;
};

export type ExecuteUserShortcutOverridesInput = {
  overrides: ShortcutOverridePatch;
};

const partitionOverridePatch = (
  patch: Record<string, string | null>
): {
  overrides: Record<string, string>;
  hasResets: boolean;
} => {
  const overrides: Record<string, string> = {};
  let hasResets = false;

  for (const [actionId, value] of Object.entries(patch)) {
    if (value === null) {
      hasResets = true;
      continue;
    }

    overrides[actionId] = value;
  }

  return { overrides, hasResets };
};

const writeWorkspaceShortcutAuditEvent = (
  event: Parameters<typeof writeAuditEvent>[0],
  db?: ExecutionDatabaseTransaction
): ReturnType<typeof writeAuditEvent> => {
  if (db) {
    return writeAuditEventInTransaction(db, event);
  }

  return writeAuditEvent(event);
};

export const executeUserShortcutOverridesUpdate = (
  input: ExecuteUserShortcutOverridesInput,
  scope: UserShortcutMutationScope = {}
): Promise<WorkspaceShortcutsPayload> => {
  const requestId = scope.requestId?.trim() || randomUUID();
  const operationId = scope.operationId?.trim() || requestId;
  let resolvedMembership: KeyboardShortcutsTenantMembership | null = null;

  const pipeline = createExecutionPipeline<
    ExecuteUserShortcutOverridesInput,
    WorkspaceShortcutsPayload
  >({
    executeDomainOperation: async ({
      input: mutationInput,
      actor,
      tenant,
      db,
    }: ExecutionMutationContext<ExecuteUserShortcutOverridesInput>): Promise<
      ExecutionDomainResult<WorkspaceShortcutsPayload>
    > => {
      const current = await readWorkspaceShortcuts(
        tenant.tenantId,
        actor.actorId,
        db
      );

      if (!current.policy.allowUserCustomize) {
        throw new ForbiddenError(
          "User keyboard shortcut customization is disabled by policy."
        );
      }

      const { overrides: stringOverrides } = partitionOverridePatch(
        mutationInput.overrides
      );

      if (Object.keys(stringOverrides).length > 0) {
        const validation = validateUserOverrides(stringOverrides, {
          tenantLockedActions: current.policy.lockedActions,
          allowUserCustomize: current.policy.allowUserCustomize,
          allowFnKeyBindings: current.policy.allowFnKeyBindings,
          tenantOverrides: current.layers.tenant,
          userOverrides: current.layers.user,
        });

        if (!validation.ok) {
          throw new BusinessRuleError(validation.error);
        }
      }

      const payload = await upsertUserShortcutOverrides(
        tenant.tenantId,
        actor.actorId,
        mutationInput.overrides,
        db
      );

      return {
        action: "workspace.keyboard-shortcuts.user.update",
        after: {
          overrides: payload.layers.user,
          policy: payload.policy,
        },
        before: {
          overrides: current.layers.user,
          policy: current.policy,
        },
        channel: "api",
        metadata: {
          feature: "workspace.keyboard-shortcuts",
        },
        module: "workspace",
        reason: "User keyboard shortcut overrides updated",
        result: payload,
        route: "/api/me/keyboard-shortcuts",
        summary: "Updated personal keyboard shortcut overrides",
        targetId: actor.actorId,
        targetType: "user-workspace-preferences",
      };
    },
    operationId,
    permissionContext: (actor, tenant) => ({
      action: "workspace.keyboard-shortcuts.user.update",
      actorId: actor.actorId,
      grantedPermissions: [],
      resource: WORKSPACE_RESOURCE,
      tenantId: tenant.tenantId,
    }),
    // Intentionally empty: any authenticated tenant member may update personal prefs.
    permissionRequirement: {},
    requestId,
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
          "Active tenant membership was not resolved for keyboard shortcut update"
        );
      }

      return { tenantId: resolvedMembership.tenantId };
    },
    runInTransaction: <T>(
      run: (db: ExecutionDatabaseTransaction) => Promise<T>
    ): Promise<T> => database.transaction(run),
    validateInput: (mutationInput) => {
      shortcutOverridesPostSchema.parse({ overrides: mutationInput.overrides });
    },
    writeAuditEvent: writeWorkspaceShortcutAuditEvent,
  });

  return pipeline(input);
};

export const executeTenantKeyboardShortcutPolicyUpdate = (
  input: TenantKeyboardShortcutPolicyPost,
  scope: TenantKeyboardShortcutMutationScope = {}
): Promise<TenantKeyboardShortcutPolicyPayload> => {
  const requestId = scope.requestId?.trim() || randomUUID();
  const operationId = scope.operationId?.trim() || requestId;
  let resolvedAccess: KeyboardShortcutsTenantAccess | null = null;

  const pipeline = createExecutionPipeline<
    TenantKeyboardShortcutPolicyPost,
    TenantKeyboardShortcutPolicyPayload
  >({
    executeDomainOperation: async ({
      input: mutationInput,
      tenant,
      db,
    }: ExecutionMutationContext<TenantKeyboardShortcutPolicyPost>): Promise<
      ExecutionDomainResult<TenantKeyboardShortcutPolicyPayload>
    > => {
      const before = await readTenantKeyboardShortcutPolicy(tenant.tenantId, db);
      const payload = await upsertTenantKeyboardShortcutPolicy(
        tenant.tenantId,
        mutationInput,
        db
      );

      return {
        action: "system-admin.tenant-settings.write",
        after: payload.policy,
        before: before.policy,
        channel: "api",
        metadata: {
          feature: "workspace.keyboard-shortcuts",
        },
        module: "system-admin",
        reason: "Tenant keyboard shortcut policy updated",
        result: payload,
        route: "/api/admin/tenant/keyboard-shortcuts",
        summary: "Updated tenant keyboard shortcut policy",
        targetId: tenant.tenantId,
        targetType: "tenant-keyboard-shortcut-policy",
      };
    },
    operationId,
    permissionContext: (actor, tenant) => ({
      action: permissionCatalog.systemAdmin.tenantSettingsWrite,
      actorId: actor.actorId,
      companyId: scope.companyId,
      grantedPermissions: resolvedAccess
        ? resolvePermissionsForTenantRole(resolvedAccess.membership.role)
        : [],
      resource: ADMIN_RESOURCE,
      tenantId: tenant.tenantId,
    }),
    permissionRequirement: {
      allOf: [permissionCatalog.systemAdmin.tenantSettingsWrite],
    },
    requestId,
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
          "Active tenant access was not resolved for tenant keyboard shortcut update"
        );
      }

      return { tenantId: resolvedAccess.membership.tenantId };
    },
    runInTransaction: <T>(
      run: (db: ExecutionDatabaseTransaction) => Promise<T>
    ): Promise<T> => database.transaction(run),
    validateInput: (mutationInput) => {
      tenantKeyboardShortcutPolicyPostSchema.parse(mutationInput);
    },
    writeAuditEvent: writeWorkspaceShortcutAuditEvent,
  });

  return pipeline(input);
};
