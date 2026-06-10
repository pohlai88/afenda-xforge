import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";
import {
  collectVisualTokenViolations,
  forbiddenVisualTokenPatterns,
} from "./visual-token-rules.mts";

const scanRoots = [
  join(packageRoot, "src", "renderers"),
  join(packageRoot, "src", "components"),
  join(packageRoot, "src", "adapters"),
] as const;

const sharedShellModules = new Set([
  "field-visual-state.ts",
  "metadata-field-shell.tsx",
  "action-visual-matrix.ts",
  "base-action.renderer.tsx",
  "action-confirmation.ts",
  "state-visual-matrix.ts",
  "metadata-state-shell.tsx",
  "state-visual-icons.tsx",
]);

const visualTokenContractPath = join(
  packageRoot,
  "src",
  "visualization",
  "visual-token-contract.ts"
);

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "generated") {
        return [];
      }

      return collectSourceFiles(fullPath);
    }

    return entry.isFile() && /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

export function checkRendererVisualTokens(): void {
  const violations: string[] = [];

  if (!readFileSync(visualTokenContractPath, "utf8").includes("MUI-VIS-014")) {
    violations.push(
      "src/visualization/visual-token-contract.ts must document MUI-VIS-014"
    );
  }

  for (const root of scanRoots) {
    for (const filePath of collectSourceFiles(root)) {
      const fileName = filePath.split(/[/\\]/).pop() ?? filePath;
      const relativePath = relative(packageRoot, filePath);

      if (sharedShellModules.has(fileName)) {
        continue;
      }

      const source = readFileSync(filePath, "utf8");
      violations.push(
        ...collectVisualTokenViolations(
          relativePath,
          source,
          forbiddenVisualTokenPatterns
        )
      );
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-VIS-014 renderer visual token lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkRendererVisualTokens();
  console.log("metadata-ui renderer visual token lint passed (MUI-VIS-014)");
}
