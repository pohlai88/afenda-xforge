import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { checkComposeGroups } from "./check-compose-groups.mts";
import { generate } from "./generate.mts";
import { isEntrypoint, packageRoot } from "./generator-lib.mts";
import { validateManifestEntries } from "./validate-manifest.mts";

const rendererSmokeTestPath = join(
  packageRoot,
  "tests",
  "generated",
  "renderer-smoke.generated.test.tsx"
);
const manifestExportsTestPath = join(
  packageRoot,
  "tests",
  "manifest-exports-alignment.test.ts"
);

export function checkRendererRegistry(): void {
  validateManifestEntries();
  generate(true);
  checkComposeGroups();

  const smokeTestSource = readFileSync(rendererSmokeTestPath, "utf8");
  const requiredSmokePatterns = [
    "generatedStateRendererRegistrations",
    "defaultStateRegistry",
  ] as const;

  for (const pattern of requiredSmokePatterns) {
    if (!smokeTestSource.includes(pattern)) {
      throw new Error(
        `${relative(packageRoot, rendererSmokeTestPath)}: missing ${pattern} registry parity assertion (MUI-007 / AC #4)`
      );
    }
  }

  if (
    !readFileSync(manifestExportsTestPath, "utf8").includes(
      "exports.generated.ts"
    )
  ) {
    throw new Error(
      `${relative(packageRoot, manifestExportsTestPath)}: must assert manifest/export alignment (AC #4)`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkRendererRegistry();
  console.log("Enterprise AC #4/#7 renderer registry verification passed.");
}
