import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

type PackageJson = {
  scripts?: Record<string, string>;
};

const generateScriptPath = join(packageRoot, "scripts", "generate.mts");
const packageJsonPath = join(packageRoot, "package.json");
const verificationGovernanceTestPath = join(
  packageRoot,
  "tests",
  "verification-governance.test.ts"
);
const indexTestPath = join(packageRoot, "tests", "index.test.ts");

const requiredGateScripts = [
  "scripts/check-public-api.mts",
  "scripts/check-declaration-snapshot.mts",
  "scripts/generate.mts",
  "scripts/check-compatibility.mts",
  "scripts/check-renderer-registry.mts",
  "scripts/check-package-subpaths.mts",
  "scripts/validate-manifest.mts",
  "scripts/update-declaration-snapshot.mts",
] as const;

const requiredVerifyGates = [
  "check:public-api",
  "check:package-subpaths",
  "check:declaration-snapshot",
  "check:generated",
  "check:compatibility",
  "check:renderer-registry",
] as const;

const requiredTests = [
  "tests/verification-governance.test.ts",
  "tests/manifest-generation.test.ts",
  "tests/manifest-exports-alignment.test.ts",
  "tests/renderer-registry.test.tsx",
  "tests/package-subpaths.test.ts",
] as const;

const readSource = (filePath: string): string => readFileSync(filePath, "utf8");

const assertFileExists = (
  relativePath: string,
  violations: string[]
): string | undefined => {
  const fullPath = join(packageRoot, relativePath);

  if (!existsSync(fullPath)) {
    violations.push(`${relativePath} is required for Enterprise AC #7`);
    return;
  }

  return fullPath;
};

function checkRequiredScripts(violations: string[]): void {
  for (const scriptPath of requiredGateScripts) {
    assertFileExists(scriptPath, violations);
  }
}

function checkVerifyGates(
  verifyScript: string,
  packageJson: PackageJson,
  violations: string[]
): void {
  for (const gate of requiredVerifyGates) {
    if (!verifyScript.includes(gate)) {
      violations.push(
        `package.json verify must include '${gate}' to fail on drift (Enterprise AC #7)`
      );
    }
  }

  if (!verifyScript.includes("check:verification-governance")) {
    violations.push(
      "package.json verify must include check:verification-governance (Enterprise AC #7)"
    );
  }

  const buildIndex = verifyScript.indexOf("pnpm run build");
  const orderedGates = [
    {
      gate: "check:declaration-snapshot",
      message:
        "verify must run check:declaration-snapshot after build so declaration drift fails CI (Enterprise AC #7)",
    },
    {
      gate: "check:public-api",
      message:
        "verify must run check:public-api after build so export drift fails CI (Enterprise AC #7)",
    },
    {
      gate: "check:generated",
      message:
        "verify must run check:generated after build so registry artifact drift fails CI (Enterprise AC #7)",
    },
  ] as const;

  for (const { gate, message } of orderedGates) {
    const gateIndex = verifyScript.indexOf(gate);

    if (buildIndex === -1 || gateIndex === -1 || gateIndex < buildIndex) {
      violations.push(message);
    }
  }

  if (!packageJson.scripts?.["update:declaration-snapshot"]) {
    violations.push(
      "package.json must expose update:declaration-snapshot for intentional public API changes (MUI-011 / AC #7)"
    );
  }
}

function checkSourceWiring(violations: string[]): void {
  const wiringChecks = [
    {
      path: generateScriptPath,
      marker: "validateManifestEntries",
      message:
        "scripts/generate.mts must validate manifest registry keys before generation (Enterprise AC #7)",
    },
    {
      path: join(packageRoot, "scripts", "check-renderer-registry.mts"),
      marker: "validateManifestEntries",
      message:
        "scripts/check-renderer-registry.mts must validate manifest registry conflicts (Enterprise AC #7)",
    },
    {
      path: join(packageRoot, "scripts", "check-public-api.mts"),
      marker: "declaration-snapshot.json",
      message:
        "scripts/check-public-api.mts must tie export subpaths to declaration snapshot coverage (Enterprise AC #7)",
    },
  ] as const;

  for (const check of wiringChecks) {
    if (!readSource(check.path).includes(check.marker)) {
      violations.push(check.message);
    }
  }
}

function checkSnapshotStructure(violations: string[]): void {
  const snapshotPath = assertFileExists(
    "snapshots/declaration-snapshot.json",
    violations
  );

  if (!snapshotPath) {
    return;
  }

  const snapshot = JSON.parse(readSource(snapshotPath)) as {
    files?: Record<string, string>;
  };

  if (!snapshot.files || Object.keys(snapshot.files).length === 0) {
    violations.push(
      "snapshots/declaration-snapshot.json must hash public declaration outputs (MUI-011 / AC #7)"
    );
  }
}

function checkTestCoverage(violations: string[]): void {
  for (const testPath of requiredTests) {
    assertFileExists(testPath, violations);
  }

  if (!readSource(indexTestPath).includes("verification-governance.test.ts")) {
    violations.push(
      "tests/index.test.ts must include verification-governance.test.ts (Enterprise AC #7)"
    );
  }

  const verificationTestSource = existsSync(verificationGovernanceTestPath)
    ? readSource(verificationGovernanceTestPath)
    : "";

  for (const marker of [
    "checkVerificationGovernance",
    "Duplicate manifest registry key",
    "MetadataRendererRegistryDuplicateError",
    "declaration-snapshot.json",
    "TextFieldRenderer",
  ]) {
    if (!verificationTestSource.includes(marker)) {
      violations.push(
        `tests/verification-governance.test.ts must cover ${marker} (Enterprise AC #7)`
      );
    }
  }
}

export function checkVerificationGovernance(): void {
  const violations: string[] = [];
  const packageJson = JSON.parse(
    readFileSync(packageJsonPath, "utf8")
  ) as PackageJson;
  const verifyScript = packageJson.scripts?.verify ?? "";

  checkRequiredScripts(violations);
  checkVerifyGates(verifyScript, packageJson, violations);
  checkSourceWiring(violations);
  checkSnapshotStructure(violations);
  checkTestCoverage(violations);

  if (violations.length > 0) {
    throw new Error(
      `Enterprise AC #7 verification governance lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkVerificationGovernance();
  console.log("Enterprise AC #7 verification governance lint passed.");
}
