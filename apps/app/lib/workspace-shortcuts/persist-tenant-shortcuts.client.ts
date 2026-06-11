import type {
  ShortcutActionId,
  ShortcutOverridePatch,
  ShortcutOverrides,
  TenantKeyboardShortcutPolicyPayload,
  TenantKeyboardShortcutPolicySnapshot,
} from "./contract.ts";
import {
  validateTenantLockedActions,
  validateTenantOverrides,
} from "./resolve-shortcuts.ts";

export type PersistTenantShortcutPolicyResult =
  | { ok: true; payload: TenantKeyboardShortcutPolicyPayload }
  | { ok: false; error: string; status?: number };

export const persistTenantKeyboardShortcutPolicy = async (
  patch: Record<string, unknown>
): Promise<PersistTenantShortcutPolicyResult> => {
  const response = await fetch("/api/admin/tenant/keyboard-shortcuts", {
    body: JSON.stringify(patch),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  const body =
    (await response.json()) as TenantKeyboardShortcutPolicyPayload & {
      error?: string;
    };

  if (!response.ok) {
    return {
      ok: false,
      error: body.error ?? "Failed to save tenant keyboard shortcut policy",
      status: response.status,
    };
  }

  if (!(body.policy && body.preview)) {
    return {
      ok: false,
      error: "Tenant keyboard shortcut response was incomplete",
      status: response.status,
    };
  }

  return { ok: true, payload: body };
};

export const validatePendingTenantPolicy = (input: {
  allowUserCustomize: boolean;
  allowFnKeyBindings: boolean;
  lockedActions: ShortcutActionId[];
  pendingOverrides: ShortcutOverridePatch;
  savedPolicy: TenantKeyboardShortcutPolicySnapshot;
}): { ok: true } | { ok: false; error: string } => {
  const lockedValidation = validateTenantLockedActions(input.lockedActions);

  if (!lockedValidation.ok) {
    return lockedValidation;
  }

  const stringOverrides: ShortcutOverrides = {};

  for (const [actionId, value] of Object.entries(input.pendingOverrides)) {
    if (value === null || value === undefined) {
      continue;
    }

    stringOverrides[actionId as keyof ShortcutOverrides] = value;
  }

  if (Object.keys(stringOverrides).length === 0) {
    return { ok: true };
  }

  const mergedOverrides = {
    ...input.savedPolicy.overrides,
    ...stringOverrides,
  };

  for (const actionId of Object.keys(input.pendingOverrides)) {
    if (input.pendingOverrides[actionId as ShortcutActionId] === null) {
      delete mergedOverrides[actionId as ShortcutActionId];
    }
  }

  return validateTenantOverrides(mergedOverrides, {
    tenantLockedActions: lockedValidation.lockedActions,
    allowFnKeyBindings: input.allowFnKeyBindings,
    tenantOverrides: input.savedPolicy.overrides,
  });
};
