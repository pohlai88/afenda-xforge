import type { CssVarMap } from "../../customise-branding/resolution";

export type CssVarLookup = Readonly<Record<string, string>>;

function readCssVar(
  cssVars: CssVarLookup,
  varName: string
): string | undefined {
  return cssVars[varName] ?? (cssVars as CssVarMap)[varName as keyof CssVarMap];
}

/** Resolve nested `var(--token[, fallback])` chains against a css var map. */
export function resolveCssVarChain(
  value: string,
  cssVars: CssVarLookup,
  depth = 0
): string {
  if (depth > 8) {
    return value.trim();
  }

  const trimmed = value.trim();
  const varMatch = trimmed.match(/^var\(\s*(--[\w-]+)(?:,\s*(.+))?\)$/);
  if (!varMatch) {
    return trimmed;
  }

  const [, varName, fallback] = varMatch;
  if (!varName) {
    return trimmed;
  }

  const resolved = readCssVar(cssVars, varName) ?? fallback?.trim();
  if (!resolved) {
    return trimmed;
  }

  return resolveCssVarChain(String(resolved), cssVars, depth + 1);
}
