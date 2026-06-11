import type { ShortcutOverridePatch, ShortcutOverrides } from "./contract.ts";
import { isShortcutActionId } from "./contract.ts";
import { createBindingFromNormalized } from "./format-shortcut.ts";

export const applyOverridePatch = (
  current: ShortcutOverrides,
  patch: ShortcutOverridePatch
): ShortcutOverrides => {
  const next = { ...current };

  for (const [rawActionId, value] of Object.entries(patch)) {
    if (!isShortcutActionId(rawActionId)) {
      throw new Error(`Unknown shortcut action: ${rawActionId}`);
    }

    if (value === null) {
      delete next[rawActionId];
      continue;
    }

    const normalized = createBindingFromNormalized(value);

    if (!normalized) {
      throw new Error(`Invalid shortcut binding for ${rawActionId}`);
    }

    next[rawActionId] = normalized.normalized;
  }

  return next;
};
