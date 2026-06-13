import { wcagContrast, parse } from "culori";

import {
  calcApcaLc,
  AFENDA_APCA_CONTRAST_TARGETS,
} from "../src/css/tokens/apca-contrast.ts";
import { resolveCssVarChain } from "../src/css/tokens/css-var.util.ts";
import {
  GLOBALS_CSS_DARK_DECLARATIONS,
  GLOBALS_CSS_ROOT_DECLARATIONS,
} from "../src/css/tokens/css-theme.ts";

const MIN_NORMAL_TEXT_WCAG = 4.5;
const MIN_UI_WCAG = 3;

type ContrastPair = {
  apcaTarget: keyof typeof AFENDA_APCA_CONTRAST_TARGETS;
  background: string;
  foreground: string;
  label: string;
  minimumWcag: number;
};

function declarationLookup(
  declarations: readonly (readonly [string, string])[]
): Readonly<Record<string, string>> {
  return Object.fromEntries(declarations);
}

function wcagRatio(foreground: string, background: string): number {
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
  const lookup = declarationLookup(
    mode === "light"
      ? GLOBALS_CSS_ROOT_DECLARATIONS
      : GLOBALS_CSS_DARK_DECLARATIONS
  );

  const read = (token: string) =>
    resolveCssVarChain(`var(--${token})`, lookup);

  return [
    {
      label: `${mode}: primary / primary-foreground`,
      background: read("primary"),
      foreground: read("primary-foreground"),
      apcaTarget: "standardUiText",
      minimumWcag: MIN_NORMAL_TEXT_WCAG,
    },
    {
      label: `${mode}: brand-secondary / brand-secondary-foreground`,
      background: read("brand-secondary"),
      foreground: read("brand-secondary-foreground"),
      apcaTarget: "standardUiText",
      minimumWcag: MIN_NORMAL_TEXT_WCAG,
    },
    {
      label: `${mode}: brand-accent / brand-accent-foreground`,
      background: read("brand-accent"),
      foreground: read("brand-accent-foreground"),
      apcaTarget: "standardUiText",
      minimumWcag: MIN_NORMAL_TEXT_WCAG,
    },
    {
      label: `${mode}: background / foreground`,
      background: read("background"),
      foreground: read("foreground"),
      apcaTarget: "criticalText",
      minimumWcag: MIN_NORMAL_TEXT_WCAG,
    },
    {
      label: `${mode}: background / muted-foreground`,
      background: read("background"),
      foreground: read("muted-foreground"),
      apcaTarget: "standardUiText",
      minimumWcag: MIN_NORMAL_TEXT_WCAG,
    },
    {
      label: `${mode}: success / success-foreground`,
      background: read("success"),
      foreground: read("success-foreground"),
      apcaTarget: "standardUiText",
      minimumWcag: MIN_NORMAL_TEXT_WCAG,
    },
    {
      label: `${mode}: warning / warning-foreground`,
      background: read("warning"),
      foreground: read("warning-foreground"),
      apcaTarget: "standardUiText",
      minimumWcag: MIN_NORMAL_TEXT_WCAG,
    },
    {
      label: `${mode}: destructive / destructive-foreground`,
      background: read("destructive"),
      foreground: read("destructive-foreground"),
      apcaTarget: "standardUiText",
      minimumWcag: MIN_NORMAL_TEXT_WCAG,
    },
    {
      label: `${mode}: info / info-foreground`,
      background: read("info"),
      foreground: read("info-foreground"),
      apcaTarget: "standardUiText",
      minimumWcag: MIN_NORMAL_TEXT_WCAG,
    },
    {
      label: `${mode}: lane-money / lane-money-foreground`,
      background: read("lane-money"),
      foreground: read("lane-money-foreground"),
      apcaTarget: "largeDisplayText",
      minimumWcag: MIN_UI_WCAG,
    },
  ];
}

const failures: string[] = [];

for (const pair of [...collectPairs("light"), ...collectPairs("dark")]) {
  const apcaLc = calcApcaLc(pair.foreground, pair.background);
  const apcaMinimum = AFENDA_APCA_CONTRAST_TARGETS[pair.apcaTarget];
  const wcag = wcagRatio(pair.foreground, pair.background);

  if (apcaLc < apcaMinimum) {
    failures.push(
      `${pair.label}: APCA ${apcaLc.toFixed(1)} Lc < ${apcaMinimum} (${pair.foreground} on ${pair.background})`
    );
  }

  if (wcag < pair.minimumWcag) {
    failures.push(
      `${pair.label}: WCAG ${wcag.toFixed(2)}:1 < ${pair.minimumWcag}:1 (${pair.foreground} on ${pair.background})`
    );
  }
}

if (failures.length > 0) {
  console.error("Color contrast check failed:\n");
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Color contrast check passed (APCA-first, WCAG-compatible).");
