import type {
  ShortcutActionId,
  ShortcutOverridePatch,
  WorkspaceShortcutsPayload,
} from "./contract.ts";
import { bindingsMatch } from "./normalize-shortcut.ts";
import { resolveShortcuts } from "./resolve-shortcuts.ts";

export type CaptureCollision = {
  actionId: ShortcutActionId;
  label: string;
};

export const validateCaptureCollision = (
  actionId: ShortcutActionId,
  normalized: string,
  payload: WorkspaceShortcutsPayload,
  pendingOverrides: ShortcutOverridePatch = {}
): CaptureCollision | null => {
  const existingUserOverrides = payload.layers.user;
  const tenantOverrides = payload.layers.tenant;

  const stringPending: Record<string, string> = {};

  for (const [id, value] of Object.entries(pendingOverrides)) {
    if (value !== null && value !== undefined) {
      stringPending[id] = value;
    }
  }

  stringPending[actionId] = normalized;

  const preview = resolveShortcuts({
    tenantOverrides,
    tenantLockedActions: payload.policy.lockedActions,
    allowUserCustomize: payload.policy.allowUserCustomize,
    allowFnKeyBindings: payload.policy.allowFnKeyBindings,
    userOverrides: {
      ...existingUserOverrides,
      ...stringPending,
    },
  });

  for (const [otherActionId, shortcut] of Object.entries(preview.bindings)) {
    if (otherActionId === actionId) {
      continue;
    }

    if (
      bindingsMatch(normalized, shortcut.binding.normalized) ||
      (shortcut.secondaryBinding &&
        bindingsMatch(normalized, shortcut.secondaryBinding.normalized))
    ) {
      return {
        actionId: otherActionId as ShortcutActionId,
        label: shortcut.binding.label,
      };
    }
  }

  return null;
};
