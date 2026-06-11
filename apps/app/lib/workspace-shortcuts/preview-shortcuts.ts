import type {
  ShortcutActionId,
  ShortcutOverridePatch,
  ShortcutOverrides,
  TenantKeyboardShortcutPolicyPayload,
  WorkspaceShortcutsPayload,
} from "./contract.ts";
import { applyOverridePatch } from "./override-patch.ts";
import { resolveShortcuts } from "./resolve-shortcuts.ts";

export const previewUserShortcutPatch = (
  payload: WorkspaceShortcutsPayload,
  patch: ShortcutOverridePatch
): WorkspaceShortcutsPayload =>
  resolveShortcuts({
    tenantOverrides: payload.layers.tenant,
    tenantLockedActions: payload.policy.lockedActions,
    allowUserCustomize: payload.policy.allowUserCustomize,
    allowFnKeyBindings: payload.policy.allowFnKeyBindings,
    userOverrides: applyOverridePatch(payload.layers.user, patch),
  });

export const previewTenantPolicyDraft = (
  saved: TenantKeyboardShortcutPolicyPayload,
  draft: {
    allowUserCustomize: boolean;
    allowFnKeyBindings: boolean;
    lockedActions: ShortcutActionId[];
    pendingOverrides: ShortcutOverridePatch;
  }
): WorkspaceShortcutsPayload =>
  resolveShortcuts({
    tenantOverrides: applyOverridePatch(
      saved.policy.overrides,
      draft.pendingOverrides
    ),
    tenantLockedActions: draft.lockedActions,
    allowUserCustomize: draft.allowUserCustomize,
    allowFnKeyBindings: draft.allowFnKeyBindings,
  });

export const resolveEffectiveUserBinding = (
  payload: WorkspaceShortcutsPayload,
  actionId: ShortcutActionId,
  pendingOverrides: ShortcutOverridePatch
): string => {
  const pendingValue = pendingOverrides[actionId];

  if (pendingValue === undefined) {
    return payload.bindings[actionId].binding.normalized;
  }

  if (pendingValue === null) {
    return previewUserShortcutPatch(payload, { [actionId]: null }).bindings[
      actionId
    ].binding.normalized;
  }

  return pendingValue;
};

export const mergeUserOverridePatch = (
  payload: WorkspaceShortcutsPayload,
  patch: ShortcutOverridePatch
): ShortcutOverrides => applyOverridePatch(payload.layers.user, patch);
