import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const stateRendererRoot = join(packageRoot, "src", "renderers", "states");
const sharedStateModules = new Set([
  "index.ts",
  "metadata-state-shell.tsx",
  "state-visual-icons.tsx",
  "state-visual-matrix.ts",
]);

const requiredStateRenderers = [
  "loading-state.renderer.tsx",
  "empty-state.renderer.tsx",
  "error-state.renderer.tsx",
  "forbidden-state.renderer.tsx",
  "ready-state.renderer.tsx",
  "invalid-state.renderer.tsx",
  "degraded-state.renderer.tsx",
  "partial-state.renderer.tsx",
  "readonly-state.renderer.tsx",
  "maintenance-state.renderer.tsx",
] as const;

const forbiddenDelegationPatterns = [
  {
    file: "invalid-state.renderer.tsx",
    pattern: /from\s+["'].*error-state\.renderer["']/,
    message: "invalid state must not delegate to ErrorState",
  },
  {
    file: "degraded-state.renderer.tsx",
    pattern: /from\s+["'].*error-state\.renderer["']/,
    message: "degraded state must not delegate to ErrorState",
  },
  {
    file: "maintenance-state.renderer.tsx",
    pattern: /from\s+["'].*forbidden-state\.renderer["']/,
    message: "maintenance state must not delegate to ForbiddenState",
  },
  {
    file: "partial-state.renderer.tsx",
    pattern: /from\s+["'].*ready-state\.renderer["']/,
    message: "partial state must not passthrough via ReadyState only",
  },
  {
    file: "readonly-state.renderer.tsx",
    pattern: /from\s+["'].*ready-state\.renderer["']/,
    message: "readonly state must not passthrough via ReadyState only",
  },
];

function collectMissingRendererFiles(): string[] {
  const violations: string[] = [];

  for (const fileName of requiredStateRenderers) {
    const filePath = join(stateRendererRoot, fileName);
    const relativePath = relative(packageRoot, filePath);

    try {
      readFileSync(filePath, "utf8");
    } catch {
      violations.push(`${relativePath}: missing required state renderer file`);
    }
  }

  return violations;
}

function collectRendererViolations(
  fileName: string,
  source: string,
  relativePath: string
): string[] {
  const violations: string[] = [];

  if (fileName === "ready-state.renderer.tsx") {
    if (source.includes("MetadataStateShell")) {
      violations.push(`${relativePath}: ready state must passthrough content`);
    }

    return violations;
  }

  if (!source.includes("MetadataStateShell")) {
    violations.push(
      `${relativePath}: missing MetadataStateShell (MUI-VIS-003)`
    );
  }

  for (const rule of forbiddenDelegationPatterns) {
    if (fileName === rule.file && rule.pattern.test(source)) {
      violations.push(`${relativePath}: ${rule.message}`);
    }
  }

  if (
    fileName === "loading-state.renderer.tsx" &&
    !source.includes("MetadataMotionSkeleton")
  ) {
    violations.push(
      `${relativePath}: loading state must render MetadataMotionSkeleton (MUI-VIS-003/MUI-VIS-010)`
    );
  }

  return violations;
}

export function checkVisualStates(): void {
  const violations = collectMissingRendererFiles();

  for (const entry of readdirSync(stateRendererRoot, { withFileTypes: true })) {
    if (
      !(entry.isFile() && entry.name.endsWith(".renderer.tsx")) ||
      sharedStateModules.has(entry.name)
    ) {
      continue;
    }

    const filePath = join(stateRendererRoot, entry.name);
    const source = readFileSync(filePath, "utf8");
    const relativePath = relative(packageRoot, filePath);

    violations.push(
      ...collectRendererViolations(entry.name, source, relativePath)
    );
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-VIS-003 state visual matrix lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkVisualStates();
  console.log("metadata-ui state visual matrix lint passed (MUI-VIS-003)");
}
