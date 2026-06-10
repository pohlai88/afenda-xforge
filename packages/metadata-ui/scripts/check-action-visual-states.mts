import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const actionRendererRoot = join(packageRoot, "src", "renderers", "actions");
const sharedActionModules = new Set([
  "action-confirmation.ts",
  "action-visual-matrix.ts",
  "base-action.renderer.tsx",
  "index.ts",
]);

const surfaceExpectations = [
  {
    file: "button-action.renderer.tsx",
    surface: "button",
    variant: '"default"',
  },
  {
    file: "destructive-action.renderer.tsx",
    surface: "destructive",
    variant: '"destructive"',
  },
  {
    file: "menu-action.renderer.tsx",
    surface: "menu",
    variant: '"ghost"',
  },
] as const;

function collectSurfaceViolations(
  fileName: string,
  source: string,
  relativePath: string
): string[] {
  const violations: string[] = [];
  const expectation = surfaceExpectations.find(
    (entry) => entry.file === fileName
  );

  if (!expectation) {
    return violations;
  }

  if (!source.includes("resolveActionVisualDefinition")) {
    violations.push(
      `${relativePath}: must resolve action visual definition (MUI-VIS-004)`
    );
  }

  if (!source.includes(`"${expectation.surface}"`)) {
    violations.push(
      `${relativePath}: must target ${expectation.surface} action surface`
    );
  }

  return violations;
}

export function checkActionVisualStates(): void {
  const violations: string[] = [];
  const baseActionPath = join(actionRendererRoot, "base-action.renderer.tsx");
  const baseActionSource = readFileSync(baseActionPath, "utf8");

  if (
    baseActionSource.includes("window?.confirm") ||
    baseActionSource.includes("window.confirm")
  ) {
    violations.push(
      `${relative(packageRoot, baseActionPath)}: must not use window.confirm (MUI-VIS-004)`
    );
  }

  if (!baseActionSource.includes("AlertDialog")) {
    violations.push(
      `${relative(packageRoot, baseActionPath)}: must use @repo/ui AlertDialog for confirmation`
    );
  }

  if (!baseActionSource.includes("data-action-surface")) {
    violations.push(
      `${relative(packageRoot, baseActionPath)}: must expose data-action-surface`
    );
  }

  if (!baseActionSource.includes("requiresActionConfirmation")) {
    violations.push(
      `${relative(packageRoot, baseActionPath)}: must use requiresActionConfirmation`
    );
  }

  for (const entry of readdirSync(actionRendererRoot, {
    withFileTypes: true,
  })) {
    if (
      !(entry.isFile() && entry.name.endsWith(".renderer.tsx")) ||
      sharedActionModules.has(entry.name)
    ) {
      continue;
    }

    const filePath = join(actionRendererRoot, entry.name);
    const source = readFileSync(filePath, "utf8");
    const relativePath = relative(packageRoot, filePath);

    if (entry.name === "base-action.renderer.tsx") {
      continue;
    }

    if (!source.includes("BaseActionRenderer")) {
      violations.push(
        `${relativePath}: action renderers must compose BaseActionRenderer`
      );
    }

    violations.push(
      ...collectSurfaceViolations(entry.name, source, relativePath)
    );
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-VIS-004 action visual lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkActionVisualStates();
  console.log("metadata-ui action visual lint passed (MUI-VIS-004)");
}
