import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const srcRoot = join(packageRoot, "src");
const contractsRoot = join(srcRoot, "contracts");
const customizationRoot = join(srcRoot, "customization");
const componentsRoot = join(srcRoot, "components");
const adaptersRoot = join(srcRoot, "adapters");
const renderersRoot = join(srcRoot, "renderers");
const policyRoot = join(srcRoot, "policy");
const governancePath = join(policyRoot, "governance.ts");
const customizationFacadePath = join(customizationRoot, "index.ts");
const customizationResolverPath = join(
  customizationRoot,
  "resolve-metadata-customization.ts"
);
const metadataTablePath = join(componentsRoot, "metadata-table.tsx");
const authorityTestPath = join(
  packageRoot,
  "tests",
  "authority-boundary.test.ts"
);

const runtimeAuthorityPatterns = [
  /\bfetch\s*\(/,
  /["']use server["']/,
  /from\s+["']@repo\/(?:auth|database|execution|audit)(?:\/|["'])/,
  /from\s+["']@repo\/design-system(?:\/|["'])/,
] as const;

const upstreamContractPatterns = [
  /from\s+["']@repo\/metadata(?:\/|["'])/,
  /from\s+["']@repo\/ui(?:\/|["'])/,
  /from\s+["']@repo\/customization(?:\/|["'])/,
] as const;

const walkTypeScriptFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return walkTypeScriptFiles(fullPath);
    }

    return entry.isFile() && /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });

const readSource = (filePath: string): string => readFileSync(filePath, "utf8");

function assertNoPatterns(
  filePath: string,
  patterns: readonly RegExp[],
  message: string,
  violations: string[]
): void {
  const source = readSource(filePath);
  const relativePath = relative(packageRoot, filePath);

  for (const pattern of patterns) {
    if (pattern.test(source)) {
      violations.push(`${relativePath}: ${message}`);
    }
  }
}

export function checkAuthorityBoundary(): void {
  const violations: string[] = [];

  for (const filePath of walkTypeScriptFiles(contractsRoot)) {
    assertNoPatterns(
      filePath,
      upstreamContractPatterns,
      "contracts must remain package-owned and decoupled from upstream metadata/customization/ui packages (MUI-005 / AC #5)",
      violations
    );
  }

  for (const root of [adaptersRoot, renderersRoot, policyRoot]) {
    for (const filePath of walkTypeScriptFiles(root)) {
      assertNoPatterns(
        filePath,
        [
          /from\s+["']@repo\/metadata(?:\/|["'])/,
          /from\s+["']@repo\/customization(?:\/|["'])/,
          ...runtimeAuthorityPatterns,
        ],
        "runtime adapters/renderers/policy must not own metadata source, customization resolution, or server authority (MUI-005 / AC #5)",
        violations
      );
    }
  }

  for (const filePath of walkTypeScriptFiles(componentsRoot)) {
    assertNoPatterns(
      filePath,
      [/from\s+["']@repo\/customization(?:\/|["'])/],
      "components must consume customization only through src/customization facade (MUI-005 / AC #5)",
      violations
    );
  }

  for (const filePath of walkTypeScriptFiles(customizationRoot)) {
    if (
      filePath !== customizationFacadePath &&
      filePath !== customizationResolverPath
    ) {
      violations.push(
        `${relative(packageRoot, filePath)}: customization integration must stay centralized in resolve-metadata-customization.ts (MUI-005 / AC #5)`
      );
    }
  }

  const governanceSource = readSource(governancePath);

  if (!/server-side authorization/i.test(governanceSource)) {
    violations.push(
      `${relative(packageRoot, governancePath)}: must document UI-only governance and preserved server authority (AC #5)`
    );
  }

  const metadataTableSource = readSource(metadataTablePath);

  if (/from\s+["']@repo\/customization/.test(metadataTableSource)) {
    violations.push(
      `${relative(packageRoot, metadataTablePath)}: must not import @repo/customization directly (AC #5)`
    );
  }

  if (!metadataTableSource.includes("resolveMetadataEntityCustomization")) {
    violations.push(
      `${relative(packageRoot, metadataTablePath)}: must resolve customization through shared facade (MUI-017 / AC #5)`
    );
  }

  const authorityTestSource = readSource(authorityTestPath);

  if (!authorityTestSource.includes("contracts stay decoupled")) {
    violations.push(
      `${relative(packageRoot, authorityTestPath)}: must assert contract ownership boundary (AC #5)`
    );
  }

  if (violations.length > 0) {
    throw new Error(
      `Enterprise AC #5 authority boundary lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkAuthorityBoundary();
  console.log("Enterprise AC #5 authority boundary lint passed.");
}
