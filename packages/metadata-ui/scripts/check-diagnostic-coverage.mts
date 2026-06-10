import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const diagnosticsPath = join(packageRoot, "src", "adapters", "diagnostics.ts");
const contractValidationPath = join(
  packageRoot,
  "src",
  "adapters",
  "contract-validation.ts"
);
const coverageTestPath = join(
  packageRoot,
  "tests",
  "diagnostic-code-coverage.test.tsx"
);
const adapterPaths = [
  "src/adapters/ui-field-adapter.tsx",
  "src/adapters/ui-action-adapter.tsx",
  "src/adapters/ui-section-adapter.tsx",
  "src/adapters/ui-state-adapter.tsx",
  "src/adapters/metadata-renderer-resolvers.tsx",
].map((path) => join(packageRoot, path));

const requiredDiagnosticCodes = [
  "invalid-contract",
  "deprecated-renderer",
  "duplicate-renderer",
  "unsupported-state",
] as const;

const requiredFactories = [
  "createInvalidContractDiagnostic",
  "createDeprecatedRendererDiagnostic",
  "createDuplicateRendererDiagnostic",
  "createUnsupportedStateDiagnostic",
  "collectManifestDuplicateRendererDiagnostics",
  "validateMetadataFieldContract",
  "validateMetadataActionContract",
  "validateMetadataSectionContract",
  "isKnownMetadataUiState",
] as const;

function assertRequiredPatterns(
  filePath: string,
  source: string,
  patterns: readonly string[],
  violations: string[]
): void {
  const relativePath = relative(packageRoot, filePath);

  for (const pattern of patterns) {
    if (!source.includes(pattern)) {
      violations.push(`${relativePath}: missing required symbol ${pattern}`);
    }
  }
}

export function checkDiagnosticCoverage(): void {
  const violations: string[] = [];
  const diagnosticsSource = readFileSync(diagnosticsPath, "utf8");
  const contractValidationSource = readFileSync(contractValidationPath, "utf8");
  const coverageTestSource = readFileSync(coverageTestPath, "utf8");

  for (const code of requiredDiagnosticCodes) {
    if (!diagnosticsSource.includes(`"${code}"`)) {
      violations.push(
        `src/adapters/diagnostics.ts: missing diagnostic code ${code}`
      );
    }
  }

  assertRequiredPatterns(
    diagnosticsPath,
    diagnosticsSource,
    requiredFactories.slice(0, 4),
    violations
  );

  assertRequiredPatterns(
    contractValidationPath,
    contractValidationSource,
    requiredFactories.slice(4),
    violations
  );

  for (const code of requiredDiagnosticCodes) {
    if (!coverageTestSource.includes(code)) {
      violations.push(
        `tests/diagnostic-code-coverage.test.tsx: missing coverage assertion for ${code}`
      );
    }
  }

  assertRequiredPatterns(
    join(packageRoot, "src/adapters/ui-field-adapter.tsx"),
    readFileSync(
      join(packageRoot, "src/adapters/ui-field-adapter.tsx"),
      "utf8"
    ),
    ["validateMetadataFieldContract"],
    violations
  );

  assertRequiredPatterns(
    join(packageRoot, "src/adapters/ui-state-adapter.tsx"),
    readFileSync(
      join(packageRoot, "src/adapters/ui-state-adapter.tsx"),
      "utf8"
    ),
    ["createUnsupportedStateDiagnostic", "isKnownMetadataUiState"],
    violations
  );

  assertRequiredPatterns(
    join(packageRoot, "src/adapters/metadata-renderer-resolvers.tsx"),
    readFileSync(
      join(packageRoot, "src/adapters/metadata-renderer-resolvers.tsx"),
      "utf8"
    ),
    ["createDeprecatedRendererDiagnostic"],
    violations
  );

  for (const adapterPath of adapterPaths) {
    const source = readFileSync(adapterPath, "utf8");

    if (
      adapterPath.endsWith("metadata-renderer-resolvers.tsx") &&
      !source.includes("createDeprecatedRendererDiagnostic")
    ) {
      violations.push(
        `${relative(packageRoot, adapterPath)}: must emit deprecated-renderer diagnostics`
      );
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `metadata-ui diagnostic code coverage check failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkDiagnosticCoverage();
  console.log("metadata-ui diagnostic code coverage check passed");
}
