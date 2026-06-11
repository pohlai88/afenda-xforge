import "server-only";

import {
  database,
  tenantKeyboardShortcutPolicies,
  timeDatabaseQuery,
  userWorkspacePreferences,
} from "@repo/database";
import type { ExecutionDatabaseTransaction } from "@repo/execution";
import { and, eq } from "drizzle-orm";
import type {
  ShortcutActionId,
  ShortcutOverridePatch,
  ShortcutOverrides,
  TenantKeyboardShortcutPolicyPayload,
  TenantKeyboardShortcutPolicySnapshot,
  WorkspaceShortcutsPayload,
} from "./contract.ts";
import { isShortcutActionId } from "./contract.ts";
import { createBindingFromNormalized } from "./format-shortcut.ts";
import { applyOverridePatch } from "./override-patch.ts";
import { DEFAULT_TENANT_SHORTCUT_POLICY } from "./policy.server.ts";
import {
  resolveShortcuts,
  validateTenantLockedActions,
  validateTenantOverrides,
} from "./resolve-shortcuts.ts";
import type { TenantKeyboardShortcutPolicyPost } from "./tenant-policy-schema.ts";

type TenantPolicyRow = typeof tenantKeyboardShortcutPolicies.$inferSelect;
type UserWorkspaceRow = typeof userWorkspacePreferences.$inferSelect;

const resolveDatabase = (
  db?: ExecutionDatabaseTransaction
): typeof database | ExecutionDatabaseTransaction => db ?? database;

const sanitizeLockedActions = (
  values: string[] | null | undefined
): ShortcutActionId[] => (values ?? []).filter(isShortcutActionId);

const sanitizeOverrides = (
  overrides: Record<string, string> | null | undefined
): ShortcutOverrides => {
  const sanitized: ShortcutOverrides = {};

  for (const [actionId, binding] of Object.entries(overrides ?? {})) {
    if (!isShortcutActionId(actionId)) {
      continue;
    }

    const normalized = createBindingFromNormalized(binding);

    if (normalized) {
      sanitized[actionId] = normalized.normalized;
    }
  }

  return sanitized;
};

const mapTenantPolicy = (
  row: TenantPolicyRow | undefined
): TenantKeyboardShortcutPolicySnapshot => {
  if (!row) {
    return DEFAULT_TENANT_SHORTCUT_POLICY;
  }

  return {
    allowUserCustomize: row.allowUserCustomize,
    allowFnKeyBindings: row.allowFnKeyBindings,
    lockedActions: sanitizeLockedActions(row.lockedActions),
    overrides: sanitizeOverrides(row.overrides),
  };
};

const mapUserOverrides = (
  row: UserWorkspaceRow | undefined
): ShortcutOverrides => sanitizeOverrides(row?.shortcuts);

export const readWorkspaceShortcuts = async (
  tenantId: string,
  userId: string,
  db?: ExecutionDatabaseTransaction
): Promise<WorkspaceShortcutsPayload> => {
  const conn = resolveDatabase(db);

  const [tenantPolicyRow, userPreferencesRow] = await Promise.all([
    timeDatabaseQuery(
      () =>
        conn.query.tenantKeyboardShortcutPolicies.findFirst({
          where: eq(tenantKeyboardShortcutPolicies.tenantId, tenantId),
        }),
      {
        operation: "select",
        resource: "tenant_keyboard_shortcut_policies.read",
      }
    ),
    timeDatabaseQuery(
      () =>
        conn.query.userWorkspacePreferences.findFirst({
          where: and(
            eq(userWorkspacePreferences.tenantId, tenantId),
            eq(userWorkspacePreferences.userId, userId)
          ),
        }),
      {
        operation: "select",
        resource: "user_workspace_preferences.read",
      }
    ),
  ]);

  const tenantPolicy = mapTenantPolicy(tenantPolicyRow);
  const userOverrides = mapUserOverrides(userPreferencesRow);

  return resolveShortcuts({
    tenantOverrides: tenantPolicy.overrides,
    tenantLockedActions: tenantPolicy.lockedActions,
    allowUserCustomize: tenantPolicy.allowUserCustomize,
    allowFnKeyBindings: tenantPolicy.allowFnKeyBindings,
    userOverrides,
  });
};

export const readTenantKeyboardShortcutPolicy = async (
  tenantId: string,
  db?: ExecutionDatabaseTransaction
): Promise<TenantKeyboardShortcutPolicyPayload> => {
  const conn = resolveDatabase(db);

  const row = await timeDatabaseQuery(
    () =>
      conn.query.tenantKeyboardShortcutPolicies.findFirst({
        where: eq(tenantKeyboardShortcutPolicies.tenantId, tenantId),
      }),
    {
      operation: "select",
      resource: "tenant_keyboard_shortcut_policies.read",
    }
  );

  const policy = mapTenantPolicy(row);

  return {
    policy,
    preview: resolveShortcuts({
      tenantOverrides: policy.overrides,
      tenantLockedActions: policy.lockedActions,
      allowUserCustomize: policy.allowUserCustomize,
      allowFnKeyBindings: policy.allowFnKeyBindings,
    }),
  };
};

export const upsertUserShortcutOverrides = async (
  tenantId: string,
  userId: string,
  patch: ShortcutOverridePatch,
  db?: ExecutionDatabaseTransaction
): Promise<WorkspaceShortcutsPayload> => {
  const conn = resolveDatabase(db);

  const existingRow = await timeDatabaseQuery(
    () =>
      conn.query.userWorkspacePreferences.findFirst({
        where: and(
          eq(userWorkspacePreferences.tenantId, tenantId),
          eq(userWorkspacePreferences.userId, userId)
        ),
      }),
    {
      operation: "select",
      resource: "user_workspace_preferences.read",
    }
  );

  const mergedOverrides = applyOverridePatch(
    mapUserOverrides(existingRow),
    patch
  );
  const now = new Date();

  await timeDatabaseQuery(
    () =>
      conn
        .insert(userWorkspacePreferences)
        .values({
          tenantId,
          userId,
          shortcuts: mergedOverrides,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [
            userWorkspacePreferences.tenantId,
            userWorkspacePreferences.userId,
          ],
          set: {
            shortcuts: mergedOverrides,
            updatedAt: now,
          },
        }),
    {
      operation: "upsert",
      resource: "user_workspace_preferences.upsert",
    }
  );

  return readWorkspaceShortcuts(tenantId, userId, db);
};

export const upsertTenantKeyboardShortcutPolicy = async (
  tenantId: string,
  patch: TenantKeyboardShortcutPolicyPost,
  db?: ExecutionDatabaseTransaction
): Promise<TenantKeyboardShortcutPolicyPayload> => {
  const conn = resolveDatabase(db);
  const existing = await readTenantKeyboardShortcutPolicy(tenantId, db);
  const nextPolicy: TenantKeyboardShortcutPolicySnapshot = {
    allowUserCustomize:
      patch.allowUserCustomize ?? existing.policy.allowUserCustomize,
    allowFnKeyBindings:
      patch.allowFnKeyBindings ?? existing.policy.allowFnKeyBindings,
    lockedActions: patch.lockedActions ?? existing.policy.lockedActions,
    overrides: patch.overrides
      ? applyOverridePatch(existing.policy.overrides, patch.overrides)
      : existing.policy.overrides,
  };

  const lockedValidation = validateTenantLockedActions(
    nextPolicy.lockedActions
  );

  if (!lockedValidation.ok) {
    throw new Error(lockedValidation.error);
  }

  const overrideValidation = validateTenantOverrides(nextPolicy.overrides, {
    tenantLockedActions: nextPolicy.lockedActions,
    allowFnKeyBindings: nextPolicy.allowFnKeyBindings,
  });

  if (!overrideValidation.ok) {
    throw new Error(overrideValidation.error);
  }

  nextPolicy.overrides = overrideValidation.overrides;
  nextPolicy.lockedActions = lockedValidation.lockedActions;
  const now = new Date();

  await timeDatabaseQuery(
    () =>
      conn
        .insert(tenantKeyboardShortcutPolicies)
        .values({
          tenantId,
          allowUserCustomize: nextPolicy.allowUserCustomize,
          allowFnKeyBindings: nextPolicy.allowFnKeyBindings,
          lockedActions: nextPolicy.lockedActions,
          overrides: nextPolicy.overrides,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: tenantKeyboardShortcutPolicies.tenantId,
          set: {
            allowUserCustomize: nextPolicy.allowUserCustomize,
            allowFnKeyBindings: nextPolicy.allowFnKeyBindings,
            lockedActions: nextPolicy.lockedActions,
            overrides: nextPolicy.overrides,
            updatedAt: now,
          },
        }),
    {
      operation: "upsert",
      resource: "tenant_keyboard_shortcut_policies.upsert",
    }
  );

  return readTenantKeyboardShortcutPolicy(tenantId, db);
};
