import type { ShortcutBinding } from "./contract.ts";
import { normalizeShortcutString } from "./normalize-shortcut.ts";

const MOD_LABEL = "Ctrl/Cmd";

const formatKeyToken = (token: string): string => {
  if (token === "mod") {
    return MOD_LABEL;
  }

  if (token === "escape") {
    return "Esc";
  }

  if (/^f\d+$/.test(token)) {
    return token.toUpperCase();
  }

  if (token.length === 1) {
    return token.toUpperCase();
  }

  return token;
};

export const formatShortcutKeyTokens = (normalized: string): string[] => {
  const parts = normalized.toLowerCase().split("+").filter(Boolean);

  if (parts.length === 0) {
    return [normalized];
  }

  return parts.map(formatKeyToken);
};

export const formatShortcutLabel = (normalized: string): string => {
  const tokens = formatShortcutKeyTokens(normalized);

  if (tokens.length === 0) {
    return normalized;
  }

  return tokens.join(" + ");
};

export const createBindingFromNormalized = (
  normalized: string
): ShortcutBinding | null => {
  const canonical = normalizeShortcutString(normalized);

  if (!canonical) {
    return null;
  }

  return {
    key: canonical,
    normalized: canonical,
    label: formatShortcutLabel(canonical),
  };
};
