import type { ShortcutActionId } from "./contract.ts";
import {
  isFnKeyBinding,
  isMediaKeyBinding,
  normalizeShortcutString,
} from "./normalize-shortcut.ts";
import { isAllowedProductOverride } from "./resolve-shortcuts.ts";

const RESERVED_BROWSER_KEYS = new Set(["f5", "f11", "f12"]);

export type CaptureValidationErrorCode =
  | "cancelled"
  | "fnKeysDisabled"
  | "fnLockRequired"
  | "notAllowedForAction"
  | "reservedBrowserKey";

export type CaptureValidationResult =
  | { ok: true; normalized: string }
  | { ok: false; code: CaptureValidationErrorCode; cancel?: boolean };

export const validateCapturedShortcut = (
  rawNormalized: string,
  actionId: ShortcutActionId,
  options: { allowFnKeyBindings: boolean }
): CaptureValidationResult => {
  const normalized = normalizeShortcutString(rawNormalized) ?? rawNormalized;

  if (normalized === "escape") {
    return { ok: false, code: "cancelled", cancel: true };
  }

  if (isMediaKeyBinding(normalized)) {
    return { ok: false, code: "fnLockRequired" };
  }

  if (RESERVED_BROWSER_KEYS.has(normalized)) {
    return { ok: false, code: "reservedBrowserKey" };
  }

  if (isFnKeyBinding(normalized) && !options.allowFnKeyBindings) {
    return { ok: false, code: "fnKeysDisabled" };
  }

  if (!isAllowedProductOverride(actionId, normalized)) {
    return { ok: false, code: "notAllowedForAction" };
  }

  return { ok: true, normalized };
};
