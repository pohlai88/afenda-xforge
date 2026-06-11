import type {
  FocusedShortcutTarget,
  FocusedShortcutTargetType,
  ShortcutActionId,
  ShortcutScope,
} from "./contract.ts";

const MODIFIER_ALIASES = new Set([
  "mod",
  "ctrl",
  "cmd",
  "meta",
  "control",
  "command",
]);
const MODIFIER_ORDER = ["mod", "alt", "shift"] as const;

const KEY_ALIASES: Record<string, string> = {
  esc: "escape",
  return: "enter",
  del: "delete",
};

const BINDING_ALIASES: Record<string, readonly string[]> = {
  "mod+/": ["mod+shift+?"],
};

export const normalizeShortcutString = (input: string): string | null => {
  const trimmed = input.trim().toLowerCase();

  if (!trimmed) {
    return null;
  }

  const rawParts = trimmed.split("+").filter(Boolean);
  const modifiers = new Set<string>();
  const keys: string[] = [];

  for (const part of rawParts) {
    if (MODIFIER_ALIASES.has(part)) {
      modifiers.add("mod");
      continue;
    }

    if (part === "alt" || part === "option") {
      modifiers.add("alt");
      continue;
    }

    if (part === "shift") {
      modifiers.add("shift");
      continue;
    }

    const key = KEY_ALIASES[part] ?? (part === " " ? "space" : part);
    keys.push(key);
  }

  if (keys.length !== 1) {
    return null;
  }

  const orderedModifiers = MODIFIER_ORDER.filter((modifier) =>
    modifiers.has(modifier)
  );

  return [...orderedModifiers, keys[0]].join("+");
};

export const normalizeKeyboardEvent = (event: KeyboardEvent): string => {
  const parts: string[] = [];

  if (event.metaKey || event.ctrlKey) {
    parts.push("mod");
  }

  if (event.altKey) {
    parts.push("alt");
  }

  if (event.shiftKey) {
    parts.push("shift");
  }

  const key = event.key.toLowerCase();

  if (key === " ") {
    parts.push("space");
  } else {
    parts.push(key);
  }

  return parts.join("+");
};

export const bindingsMatch = (
  normalized: string,
  bindingKey: string
): boolean => {
  const eventKey = normalized.toLowerCase();
  const targetKey = bindingKey.toLowerCase();

  if (eventKey === targetKey) {
    return true;
  }

  const aliases = BINDING_ALIASES[targetKey];

  return aliases?.includes(eventKey) ?? false;
};

type ShortcutBindingEntry = {
  binding: { normalized: string };
  secondaryBinding?: { normalized: string };
  scope: ShortcutScope;
};

export const resolveActiveShortcutScopes = (
  focusedTarget: FocusedShortcutTarget | null
): ShortcutScope[] => {
  if (!focusedTarget) {
    return ["crud", "grid", "workspace", "global"];
  }

  const scopeByTarget: Record<FocusedShortcutTargetType, ShortcutScope> = {
    record: "crud",
    cell: "grid",
    surface: "workspace",
    form: "crud",
  };

  const primaryScope = scopeByTarget[focusedTarget.targetType];

  return [primaryScope, "workspace", "global"];
};

export const resolveActionForNormalizedKey = (
  normalized: string,
  bindings: Record<ShortcutActionId, ShortcutBindingEntry>,
  activeScopes: readonly ShortcutScope[]
): ShortcutActionId | null => {
  const scopesToSearch = [...new Set([...activeScopes, "global"])];

  for (const scope of scopesToSearch) {
    for (const [actionId, shortcut] of Object.entries(bindings) as [
      ShortcutActionId,
      ShortcutBindingEntry,
    ][]) {
      if (shortcut.scope !== scope) {
        continue;
      }

      if (bindingsMatch(normalized, shortcut.binding.normalized)) {
        return actionId;
      }

      if (
        shortcut.secondaryBinding &&
        bindingsMatch(normalized, shortcut.secondaryBinding.normalized)
      ) {
        return actionId;
      }
    }
  }

  return null;
};

export const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable ||
    target.closest("[data-shortcuts-scope='text-entry']") !== null
  );
};

export const isFnKeyBinding = (normalized: string): boolean =>
  /^f([1-9]|1[0-2])$/.test(normalized);

export const isMediaKeyBinding = (normalized: string): boolean =>
  normalized.startsWith("audio") ||
  normalized.startsWith("media") ||
  normalized.startsWith("volume") ||
  normalized.startsWith("brightness");
