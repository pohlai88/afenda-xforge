import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const srcRoot = join(packageRoot, "src");
const adaptersRoot = join(srcRoot, "adapters");
const componentsRoot = join(srcRoot, "components");
const invalidContractFallbackPath = join(
  adaptersRoot,
  "invalid-contract-fallback.tsx"
);
const sectionCompletenessPath = join(adaptersRoot, "section-completeness.tsx");
const sectionStackPath = join(componentsRoot, "metadata-section-stack.tsx");
const fallbackRuntimeTestPath = join(
  packageRoot,
  "tests",
  "fallback-runtime.test.tsx"
);

const adapterPaths = [
  join(adaptersRoot, "ui-field-adapter.tsx"),
  join(adaptersRoot, "ui-action-adapter.tsx"),
  join(adaptersRoot, "ui-section-adapter.tsx"),
  join(adaptersRoot, "ui-layout-adapter.tsx"),
  join(adaptersRoot, "ui-composition-adapter.tsx"),
] as const;

const readSource = (filePath: string): string => readFileSync(filePath, "utf8");

export function checkFallbackRuntime(): void {
  const violations: string[] = [];

  if (!existsSync(invalidContractFallbackPath)) {
    violations.push(
      "src/adapters/invalid-contract-fallback.tsx is required for invalid-contract fallback UI (AC #6)"
    );
  }

  if (!existsSync(sectionCompletenessPath)) {
    violations.push(
      "src/adapters/section-completeness.tsx is required for partial/degraded section wrapping (AC #6)"
    );
  }

  if (!existsSync(fallbackRuntimeTestPath)) {
    violations.push(
      "tests/fallback-runtime.test.tsx is required for fallback runtime coverage (AC #6)"
    );
  }

  for (const adapterPath of adapterPaths) {
    const source = readSource(adapterPath);
    const relativePath = relative(packageRoot, adapterPath);

    if (!source.includes("createInvalidContractFallbackResult")) {
      violations.push(
        `${relativePath}: must route invalid-contract diagnostics through createInvalidContractFallbackResult (AC #6)`
      );
    }
  }

  const invalidContractFallbackSource = existsSync(invalidContractFallbackPath)
    ? readSource(invalidContractFallbackPath)
    : "";

  if (!invalidContractFallbackSource.includes("InvalidState")) {
    violations.push(
      "invalid-contract-fallback.tsx: must render InvalidState for invalid metadata contracts (AC #6)"
    );
  }

  const sectionAdapterSource = readSource(
    join(adaptersRoot, "ui-section-adapter.tsx")
  );

  if (!sectionAdapterSource.includes("wrapRenderedSectionElement")) {
    violations.push(
      "ui-section-adapter.tsx: must wrap rendered sections with partial/degraded completeness (AC #6)"
    );
  }

  const sectionStackSource = readSource(sectionStackPath);

  if (!sectionStackSource.includes("composeMetadataWithDiagnostics")) {
    violations.push(
      "metadata-section-stack.tsx: must aggregate section diagnostics without dropping fallback results (AC #6)"
    );
  }

  const fallbackTestSource = existsSync(fallbackRuntimeTestPath)
    ? readSource(fallbackRuntimeTestPath)
    : "";

  for (const marker of [
    "invalid-contract",
    "InvalidState",
    "PartialState",
    "DegradedState",
    "ErrorState",
    "MetadataSectionStack",
  ]) {
    if (!fallbackTestSource.includes(marker)) {
      violations.push(
        `tests/fallback-runtime.test.tsx: must cover ${marker} fallback paths (AC #6)`
      );
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `Enterprise AC #6 fallback runtime lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkFallbackRuntime();
  console.log("Enterprise AC #6 fallback runtime lint passed.");
}
