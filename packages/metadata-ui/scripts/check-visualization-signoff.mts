#!/usr/bin/env tsx
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const visualizationGates = [
  "check:field-visual-tokens",
  "check:renderer-visual-tokens",
  "check:field-a11y",
  "check:action-a11y",
  "check:keyboard-focus",
  "check:locale-formatting",
  "check:density-visual",
  "check:content-length",
  "check:reduced-motion",
  "check:surface-visual",
  "check:diagnostics-visual",
  "check:visual-states",
  "check:action-visual-states",
  "check:layout-composition-visual",
  "check:renderer-catalog",
  "check:renderer-axe-audit",
] as const;

export function checkVisualizationSignoff(): void {
  const packageJson = JSON.parse(
    readFileSync(join(packageRoot, "package.json"), "utf8")
  ) as { scripts?: Record<string, string> };
  const verifyScript = packageJson.scripts?.verify ?? "";
  const violations: string[] = [];

  for (const gate of visualizationGates) {
    if (!packageJson.scripts?.[gate]) {
      violations.push(`missing visualization gate script: ${gate}`);
    }

    if (!verifyScript.includes(gate)) {
      violations.push(
        `verify must include ${gate} for 9.5 visualization sign-off`
      );
    }
  }

  if (!existsSync(join(packageRoot, "tests", "renderer-axe-audit.test.tsx"))) {
    violations.push(
      "tests/renderer-axe-audit.test.tsx is required for MUI-VIS-016"
    );
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-VIS 9.5 visualization sign-off failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkVisualizationSignoff();
  console.log(
    `metadata-ui visualization sign-off passed (${visualizationGates.length} gates wired)`
  );
}
