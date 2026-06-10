import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const layoutAdapterPath = join(
  packageRoot,
  "src",
  "adapters",
  "ui-layout-adapter.tsx"
);
const compositionAdapterPath = join(
  packageRoot,
  "src",
  "adapters",
  "ui-composition-adapter.tsx"
);
const layoutRegistryPath = join(
  packageRoot,
  "src",
  "registry",
  "default-layout-registry.ts"
);
const resolverPath = join(
  packageRoot,
  "src",
  "adapters",
  "metadata-renderer-resolvers.tsx"
);
const layoutTestPath = join(
  packageRoot,
  "tests",
  "layout-composition.test.tsx"
);

export function checkLayoutComposition(): void {
  const violations: string[] = [];

  for (const [filePath, pattern, message] of [
    [
      layoutAdapterPath,
      /renderMetadataLayout\(/,
      "must expose renderMetadataLayout adapter entry point",
    ],
    [
      compositionAdapterPath,
      /renderMetadataComposition\(/,
      "must expose renderMetadataComposition adapter entry point",
    ],
    [
      layoutRegistryPath,
      /defaultLayoutRegistry/,
      "must register default layout renderers",
    ],
    [
      resolverPath,
      /resolveMetadataLayoutRenderer/,
      "must resolve layout renderers through the registry pipeline",
    ],
    [
      layoutTestPath,
      /renderMetadataLayout/,
      "must assert layout adapter pipeline",
    ],
    [
      layoutTestPath,
      /renderMetadataComposition/,
      "must assert composition adapter pipeline",
    ],
  ] as const) {
    const source = readFileSync(filePath, "utf8");

    if (!pattern.test(source)) {
      violations.push(
        `${relative(packageRoot, filePath)}: ${message} (MUI-015)`
      );
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-015 layout/composition lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkLayoutComposition();
  console.log("metadata-ui layout/composition lint passed (MUI-015)");
}
