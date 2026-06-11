import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { metadataUiManifest } from "../metadata-ui.manifest.ts";
import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const axeTestPath = join(packageRoot, "tests", "renderer-axe-audit.test.tsx");
const menuActionSurfacePath = join(
  packageRoot,
  "src",
  "renderers",
  "actions",
  "menu-action-surface.tsx"
);

export function checkRendererAxeAudit(): void {
  const violations: string[] = [];

  if (existsSync(axeTestPath)) {
    const source = readFileSync(axeTestPath, "utf8");

    if (!source.includes("metadataUiManifest")) {
      violations.push(
        `${relative(packageRoot, axeTestPath)}: must iterate manifest smokeTest entries (MUI-VIS-016)`
      );
    }

    if (!source.includes("toHaveNoViolations")) {
      violations.push(
        `${relative(packageRoot, axeTestPath)}: must assert axe violations via vitest-axe (MUI-VIS-016)`
      );
    }
  } else {
    violations.push(
      "tests/renderer-axe-audit.test.tsx is required for MUI-VIS-016 per-renderer axe audit"
    );
  }

  const smokeEntries = metadataUiManifest.renderers.filter(
    (entry) => entry.smokeTest
  );

  if (smokeEntries.length !== metadataUiManifest.renderers.length) {
    violations.push(
      "all manifest renderers must declare smokeTest: true for catalog axe coverage (MUI-VIS-016)"
    );
  }

  const menuSurfaceSource = readFileSync(menuActionSurfacePath, "utf8");

  if (!menuSurfaceSource.includes("DropdownMenu")) {
    violations.push(
      `${relative(packageRoot, menuActionSurfacePath)}: menu surface must use @repo/ui DropdownMenu (MUI-VIS-004 / catalog 9.5)`
    );
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-VIS-016 renderer axe audit gate failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }

  execSync("pnpm exec vitest run tests/renderer-axe-audit.test.tsx", {
    cwd: packageRoot,
    stdio: "inherit",
  });
}

if (isEntrypoint(import.meta.url)) {
  checkRendererAxeAudit();
  console.log(
    `metadata-ui renderer axe audit passed for ${metadataUiManifest.renderers.length} manifest renderers (MUI-VIS-016)`
  );
}
