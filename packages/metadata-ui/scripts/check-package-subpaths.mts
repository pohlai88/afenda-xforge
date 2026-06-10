import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

type PackageJson = {
  exports?: Record<string, string>;
};

const requiredConsumerSubpaths = [
  ".",
  "./adapters",
  "./client",
  "./components",
  "./compatibility",
  "./contracts",
  "./fixtures",
  "./policy",
  "./registry",
  "./renderers",
  "./server",
] as const;

const consumerFixturePath = join(
  packageRoot,
  "tests",
  "public-api-consumer.render.test.tsx"
);
const packageSubpathsTestPath = join(
  packageRoot,
  "tests",
  "package-subpaths.test.ts"
);

const forbiddenConsumerImportPattern = /@repo\/metadata-ui\/src(?:\/|["'])/;

const monorepoConsumerRoots = [
  resolve(packageRoot, "..", "..", "apps"),
  resolve(packageRoot, "..", "..", "packages"),
].filter((directory) => existsSync(directory));

const getSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") {
        return [];
      }

      return getSourceFiles(fullPath);
    }

    return entry.isFile() && /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });

function resolveImportPath(subpath: (typeof requiredConsumerSubpaths)[number]) {
  return subpath === "."
    ? "@repo/metadata-ui"
    : `@repo/metadata-ui${subpath.slice(1)}`;
}

function checkRequiredExports(
  exportsMap: Record<string, string>,
  violations: string[]
): void {
  for (const subpath of requiredConsumerSubpaths) {
    const exportTarget = exportsMap[subpath];

    if (!exportTarget) {
      violations.push(`package.json is missing required export '${subpath}'`);
      continue;
    }

    if (!existsSync(join(packageRoot, exportTarget))) {
      violations.push(
        `Missing export target for '${subpath}': ${exportTarget}`
      );
    }
  }
}

function checkSubpathTestCoverage(
  consumerFixtureSource: string,
  packageSubpathsSource: string,
  violations: string[]
): void {
  for (const subpath of requiredConsumerSubpaths) {
    const importPath = resolveImportPath(subpath);
    const covered =
      consumerFixtureSource.includes(importPath) ||
      packageSubpathsSource.includes(importPath);

    if (!covered) {
      violations.push(
        `subpath '${subpath}' is not covered by consumer or package-subpaths tests (${importPath})`
      );
    }
  }

  if (consumerFixtureSource.includes("../index.tsx")) {
    violations.push(
      "public-api-consumer.render.test.tsx must not import through ../index.tsx; use explicit subpaths"
    );
  }

  if (consumerFixtureSource.includes("../src/contracts/index.ts")) {
    violations.push(
      "public-api-consumer.render.test.tsx must import contracts through @repo/metadata-ui/contracts"
    );
  }
}

function checkMonorepoConsumerImports(violations: string[]): void {
  const metadataUiDirectory = join("packages", "metadata-ui");

  for (const consumerRoot of monorepoConsumerRoots) {
    for (const filePath of getSourceFiles(consumerRoot)) {
      if (filePath.includes(metadataUiDirectory)) {
        continue;
      }

      const source = readFileSync(filePath, "utf8");

      if (
        source.includes("@repo/metadata-ui") &&
        forbiddenConsumerImportPattern.test(source)
      ) {
        violations.push(
          `${relative(resolve(packageRoot, "..", ".."), filePath)}: consumers must not import @repo/metadata-ui/src`
        );
      }
    }
  }
}

export function checkPackageSubpaths(): void {
  const violations: string[] = [];
  const packageJson = JSON.parse(
    readFileSync(join(packageRoot, "package.json"), "utf8")
  ) as PackageJson;
  const consumerFixtureSource = readFileSync(consumerFixturePath, "utf8");
  const packageSubpathsSource = readFileSync(packageSubpathsTestPath, "utf8");

  checkRequiredExports(packageJson.exports ?? {}, violations);
  checkSubpathTestCoverage(
    consumerFixtureSource,
    packageSubpathsSource,
    violations
  );
  checkMonorepoConsumerImports(violations);

  if (violations.length > 0) {
    throw new Error(
      `metadata-ui package subpath checks failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkPackageSubpaths();
  console.log("metadata-ui package subpath checks passed (MUI-001 / AC #1)");
}
