import type { ShortcutActionId } from "./contract.ts";
import {
  isFnKeyBinding,
  isMediaKeyBinding,
  normalizeShortcutString,
} from "./normalize-shortcut.ts";
import { isAllowedProductOverride } from "./resolve-shortcuts.ts";

const RESERVED_BROWSER_KEYS = new Set(["f5", "f11", "f12"]);

export type CaptureValidationResult =
  | { ok: true; normalized: string }
  | { ok: false; reason: string; cancel?: boolean };

export const validateCapturedShortcut = (
  rawNormalized: string,
  actionId: ShortcutActionId,
  options: { allowFnKeyBindings: boolean }
): CaptureValidationResult => {
  const normalized = normalizeShortcutString(rawNormalized) ?? rawNormalized;

  if (normalized === "escape") {
    return { ok: false, reason: "Capture cancelled.", cancel: true };
  }

  if (isMediaKeyBinding(normalized)) {
    return {
      ok: false,
      reason: "Turn Fn lock off to bind function keys.",
    };
  }

  if (RESERVED_BROWSER_KEYS.has(normalized)) {
    return {
      ok: false,
      reason: "F5, F11, and F12 are reserved by the browser.",
    };
  }

  if (isFnKeyBinding(normalized) && !options.allowFnKeyBindings) {
    return {
      ok: false,
      reason: "Function key bindings are disabled by organization policy.",
    };
  }

  if (!isAllowedProductOverride(actionId, normalized)) {
    return {
      ok: false,
      reason: "That shortcut cannot be assigned to this action.",
    };
  }

  return { ok: true, normalized };
};
