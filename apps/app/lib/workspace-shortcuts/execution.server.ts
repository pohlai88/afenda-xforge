import "server-only";

import { randomUUID } from "node:crypto";
import { writeAuditEvent, writeAuditEventInTransaction } from "@repo/audit";
import { database } from "@repo/database";
import { BusinessRuleError, ForbiddenError } from "@repo/errors";
import type {
  ExecutionDatabaseTransaction,
  ExecutionDomainResult,
  ExecutionMutationContext,
} from "@repo/execution";
import { createExecutionPipeline } from "@repo/execution";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import type {
  ShortcutOverridePatch,
  TenantKeyboardShortcutPolicyPayload,
  WorkspaceShortcutsPayload,
} from "./contract.ts";
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
  tenantId: string;
  userId: string;
};

export type TenantKeyboardShortcutMutationScope = {
  companyId?: string;
  grantedPermissions: readonly string[];
  operationId?: string;
  requestId?: string;
  tenantId: string;
  userId: string;
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
  scope: UserShortcutMutationScope
): Promise<WorkspaceShortcutsPayload> => {
  const requestId = scope.requestId?.trim() || randomUUID();
  const operationId = scope.operationId?.trim() || requestId;

  const pipeline = createExecutionPipeline<
    ExecuteUserShortcutOverridesInput,
    WorkspaceShortcutsPayload
  >({
    executeDomainOperation: async ({
      input: mutationInput,
      actor,
      tenant,
    }: ExecutionMutationContext<ExecuteUserShortcutOverridesInput>): Promise<
      ExecutionDomainResult<WorkspaceShortcutsPayload>
    > => {
      const current = await readWorkspaceShortcuts(
        tenant.tenantId,
        actor.actorId
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
        mutationInput.overrides
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
    permissionRequirement: {},
    requestId,
    requireAuth: async () => ({
      actorId: scope.userId,
      actorType: "user",
    }),
    requirePermission,
    requireTenantMembership: async () => undefined,
    resolveActiveTenant: async () => ({ tenantId: scope.tenantId }),
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
  scope: TenantKeyboardShortcutMutationScope
): Promise<TenantKeyboardShortcutPolicyPayload> => {
  const requestId = scope.requestId?.trim() || randomUUID();
  const operationId = scope.operationId?.trim() || requestId;

  const pipeline = createExecutionPipeline<
    TenantKeyboardShortcutPolicyPost,
    TenantKeyboardShortcutPolicyPayload
  >({
    executeDomainOperation: async ({
      input: mutationInput,
      tenant,
    }: ExecutionMutationContext<TenantKeyboardShortcutPolicyPost>): Promise<
      ExecutionDomainResult<TenantKeyboardShortcutPolicyPayload>
    > => {
      const before = await readTenantKeyboardShortcutPolicy(tenant.tenantId);
      const payload = await upsertTenantKeyboardShortcutPolicy(
        tenant.tenantId,
        mutationInput
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
      grantedPermissions: scope.grantedPermissions,
      resource: ADMIN_RESOURCE,
      tenantId: tenant.tenantId,
    }),
    permissionRequirement: {
      allOf: [permissionCatalog.systemAdmin.tenantSettingsWrite],
    },
    requestId,
    requireAuth: async () => ({
      actorId: scope.userId,
      actorType: "user",
    }),
    requirePermission,
    requireTenantMembership: async () => undefined,
    resolveActiveTenant: async () => ({ tenantId: scope.tenantId }),
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
