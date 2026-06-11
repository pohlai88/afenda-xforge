import { parse, wcagContrast } from "culori";

import {
  GLOBALS_CSS_DARK_DECLARATIONS,
  GLOBALS_CSS_ROOT_DECLARATIONS,
} from "../src/tokens/css-theme.ts";

const MIN_NORMAL_TEXT_CONTRAST = 4.5;
const MIN_UI_CONTRAST = 3;

type ContrastPair = {
  background: string;
  foreground: string;
  label: string;
  minimum: number;
};

function declarationMap(
  declarations: readonly (readonly [string, string])[]
): Map<string, string> {
  return new Map(declarations);
}

function resolveValue(
  value: string,
  lookup: Map<string, string>,
  depth = 0
): string {
  if (depth > 8) {
    return value;
  }

  const trimmed = value.trim();
  const varMatch = trimmed.match(/^var\((--[\w-]+)(?:,\s*(.+))?\)$/);
  if (!varMatch) {
    return trimmed;
  }

  const [, varName, fallback] = varMatch;
  const resolved = lookup.get(varName) ?? fallback?.trim();
  if (!resolved) {
    return trimmed;
  }

  return resolveValue(resolved, lookup, depth + 1);
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundColor = parse(foreground);
  const backgroundColor = parse(background);

  if (!(foregroundColor && backgroundColor)) {
    throw new Error(
      `Unable to parse contrast pair: ${foreground} on ${background}`
    );
  }

  return wcagContrast(foregroundColor, backgroundColor);
}

function collectPairs(mode: "dark" | "light"): ContrastPair[] {
  const lookup = declarationMap(
    mode === "light"
      ? GLOBALS_CSS_ROOT_DECLARATIONS
      : GLOBALS_CSS_DARK_DECLARATIONS
  );

  const read = (token: string) => resolveValue(`var(${token})`, lookup);

  return [
    {
      label: `${mode}: primary / primary-foreground`,
      background: read("--primary"),
      foreground: read("--primary-foreground"),
      minimum: MIN_NORMAL_TEXT_CONTRAST,
    },
    {
      label: `${mode}: muted-foreground / background`,
      background: read("--background"),
      foreground: read("--muted-foreground"),
      minimum: MIN_NORMAL_TEXT_CONTRAST,
    },
    {
      label: `${mode}: success / success-foreground`,
      background: read("--success"),
      foreground: read("--success-foreground"),
      minimum: MIN_NORMAL_TEXT_CONTRAST,
    },
    {
      label: `${mode}: warning / warning-foreground`,
      background: read("--warning"),
      foreground: read("--warning-foreground"),
      minimum: MIN_NORMAL_TEXT_CONTRAST,
    },
    {
      label: `${mode}: destructive / destructive-foreground`,
      background: read("--destructive"),
      foreground: read("--destructive-foreground"),
      minimum: MIN_NORMAL_TEXT_CONTRAST,
    },
    {
      label: `${mode}: info / info-foreground`,
      background: read("--info"),
      foreground: read("--info-foreground"),
      minimum: MIN_NORMAL_TEXT_CONTRAST,
    },
    {
      label: `${mode}: lane-money / lane-money-foreground`,
      background: read("--lane-money"),
      foreground: read("--lane-money-foreground"),
      minimum: MIN_UI_CONTRAST,
    },
  ];
}

const failures: string[] = [];

for (const pair of [...collectPairs("light"), ...collectPairs("dark")]) {
  const ratio = contrastRatio(pair.foreground, pair.background);
  if (ratio < pair.minimum) {
    failures.push(
      `${pair.label}: ${ratio.toFixed(2)}:1 < ${pair.minimum}:1 (${pair.foreground} on ${pair.background})`
    );
  }
}

if (failures.length > 0) {
  console.error("Color contrast check failed:\n");
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Color contrast check passed.");
