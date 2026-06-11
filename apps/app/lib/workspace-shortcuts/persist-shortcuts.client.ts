import type {
  ShortcutOverridePatch,
  ShortcutOverrides,
  WorkspaceShortcutsPayload,
} from "./contract.ts";
import { validateUserOverrides } from "./resolve-shortcuts.ts";

export type PersistShortcutOverridesResult =
  | { ok: true; payload: WorkspaceShortcutsPayload }
  | { ok: false; error: string; status?: number };

export const persistShortcutOverrides = async (
  overrides: ShortcutOverridePatch
): Promise<PersistShortcutOverridesResult> => {
  const response = await fetch("/api/me/keyboard-shortcuts", {
    body: JSON.stringify({ overrides }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  const body = (await response.json()) as {
    error?: string;
    payload?: WorkspaceShortcutsPayload;
  };

  if (!response.ok) {
    return {
      ok: false,
      error: body.error ?? "Failed to save keyboard shortcuts",
      status: response.status,
    };
  }

  if (!body.payload) {
    return {
      ok: false,
      error: "Keyboard shortcuts response was missing payload",
      status: response.status,
    };
  }

  return { ok: true, payload: body.payload };
};

export const validatePendingUserOverrides = (
  pending: ShortcutOverridePatch,
  payload: WorkspaceShortcutsPayload
):
  | { ok: true; overrides: ShortcutOverridePatch }
  | { ok: false; error: string } => {
  const stringOverrides: ShortcutOverrides = {};

  for (const [actionId, value] of Object.entries(pending)) {
    if (value === null || value === undefined) {
      continue;
    }

    stringOverrides[actionId as keyof ShortcutOverrides] = value;
  }

  if (Object.keys(stringOverrides).length === 0) {
    return { ok: true, overrides: pending };
  }

  const existingUserOverrides = payload.layers.user;
  const tenantOverrides = payload.layers.tenant;

  const validation = validateUserOverrides(stringOverrides, {
    tenantLockedActions: payload.policy.lockedActions,
    allowUserCustomize: payload.policy.allowUserCustomize,
    allowFnKeyBindings: payload.policy.allowFnKeyBindings,
    tenantOverrides,
    userOverrides: existingUserOverrides,
  });

  if (!validation.ok) {
    return validation;
  }

  return { ok: true, overrides: pending };
};
