import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const coreStateKinds = [
  "loading",
  "empty",
  "error",
  "forbidden",
  "ready",
] as const;

const coreStateRendererFiles = coreStateKinds.map((kind) =>
  join(packageRoot, "src", "renderers", "states", `${kind}-state.renderer.tsx`)
);

const stateBoundaryPath = join(
  packageRoot,
  "src",
  "components",
  "metadata-state-boundary.tsx"
);
const stateBoundaryTestPath = join(
  packageRoot,
  "tests",
  "state-boundary.test.tsx"
);
const renderersIndexPath = join(
  packageRoot,
  "src",
  "renderers",
  "states",
  "index.ts"
);
const componentsIndexPath = join(packageRoot, "src", "components", "index.ts");
const clientEntryPath = join(packageRoot, "src", "client.ts");

export function checkStateRendererOwnership(): void {
  const violations: string[] = [];

  for (const file of coreStateRendererFiles) {
    if (!existsSync(file)) {
      violations.push(
        `${relative(packageRoot, file)}: missing package-owned state renderer (Enterprise AC #3 / MUI-003)`
      );
    }
  }

  const renderersIndex = readFileSync(renderersIndexPath, "utf8");
  for (const kind of coreStateKinds) {
    const exportName =
      kind === "ready"
        ? "ReadyState"
        : `${kind.charAt(0).toUpperCase()}${kind.slice(1)}State`;
    if (!renderersIndex.includes(exportName)) {
      violations.push(
        `${relative(packageRoot, renderersIndexPath)}: must export ${exportName} for reusable state surfaces (Enterprise AC #3)`
      );
    }
  }

  const componentsIndex = readFileSync(componentsIndexPath, "utf8");
  if (!componentsIndex.includes("MetadataStateBoundary")) {
    violations.push(
      `${relative(packageRoot, componentsIndexPath)}: must export MetadataStateBoundary for reusable state orchestration (Enterprise AC #3)`
    );
  }

  const clientEntry = readFileSync(clientEntryPath, "utf8");
  if (!clientEntry.includes('./renderers"')) {
    violations.push(
      `${relative(packageRoot, clientEntryPath)}: client entry must re-export renderers for reusable state components (Enterprise AC #3)`
    );
  }

  const stateBoundary = readFileSync(stateBoundaryPath, "utf8");
  if (!stateBoundary.includes("renderMetadataState(")) {
    violations.push(
      `${relative(packageRoot, stateBoundaryPath)}: MetadataStateBoundary must route through renderMetadataState (MUI-003)`
    );
  }

  const stateBoundaryTest = readFileSync(stateBoundaryTestPath, "utf8");
  for (const kind of coreStateKinds) {
    if (!stateBoundaryTest.includes(`state: "${kind}"`)) {
      violations.push(
        `${relative(packageRoot, stateBoundaryTestPath)}: must cover MetadataStateBoundary state="${kind}" (Enterprise AC #3)`
      );
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `Enterprise AC #3 state renderer ownership lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkStateRendererOwnership();
  console.log("Enterprise AC #3 state renderer ownership lint passed.");
}
