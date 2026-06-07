#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);
const checkedExtensions = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
const featureInternalSegments = new Set([
  "actions",
  "components",
  "forms",
  "queries",
  "tables",
  "tests",
]);

const violations = [];

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function relativeToRoot(filePath) {
  return toPosix(path.relative(root, filePath));
}

function isIgnoredDirectory(name) {
  return ignoredDirectories.has(name);
}

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!isIgnoredDirectory(entry.name)) {
        files.push(...walk(path.join(directory, entry.name)));
      }

      continue;
    }

    if (entry.isFile() && checkedExtensions.has(path.extname(entry.name))) {
      files.push(path.join(directory, entry.name));
    }
  }

  return files;
}

function readPackageName(startDirectory) {
  let current = startDirectory;

  while (current.startsWith(root)) {
    const packagePath = path.join(current, "package.json");

    if (existsSync(packagePath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
        return typeof packageJson.name === "string" ? packageJson.name : null;
      } catch {
        return null;
      }
    }

    const parent = path.dirname(current);

    if (parent === current) {
      return null;
    }

    current = parent;
  }

  return null;
}

function extractImports(source) {
  const imports = new Set();
  const patterns = [
    /\b(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s*)["']([^"']+)["']/g,
    /\bimport\s*["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      imports.add(match[1]);
    }
  }

  return [...imports];
}

function resolveRelativeImport(fromFile, specifier) {
  if (!specifier.startsWith(".")) {
    return null;
  }

  const basePath = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.jsx`,
    `${basePath}.mjs`,
    `${basePath}.mts`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
    path.join(basePath, "index.js"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      const stat = statSync(candidate);
      return stat.isDirectory() ? null : candidate;
    }
  }

  return basePath;
}

function getFeatureRoot(filePath) {
  const relative = relativeToRoot(filePath);
  const parts = relative.split("/");

  if (parts[0] === "packages" && parts[1] === "features" && parts.length >= 4) {
    return parts.slice(0, 4).join("/");
  }

  return null;
}

function getResolvedFeatureRoot(fromFile, specifier) {
  const resolved = resolveRelativeImport(fromFile, specifier);

  if (resolved) {
    return getFeatureRoot(resolved);
  }

  return null;
}

function getFeatureAliasPackage(specifier) {
  const match = specifier.match(/^(@repo\/features-[^/]+)(?:\/|$)/);
  return match?.[1] ?? null;
}

function getFeatureInternalSegmentFromSpecifier(specifier) {
  const match = specifier.match(/^@repo\/features-[^/]+\/([^/]+)/);

  if (match && featureInternalSegments.has(match[1])) {
    return match[1];
  }

  return null;
}

function getFeatureInternalSegmentFromResolvedPath(resolvedPath) {
  const relative = relativeToRoot(resolvedPath);
  const parts = relative.split("/");

  if (parts[0] !== "packages" || parts[1] !== "features" || parts.length < 6) {
    return null;
  }

  const srcIndex = parts.indexOf("src");
  const segment = srcIndex >= 0 ? parts[srcIndex + 1] : null;
  const basename = path.basename(relative, path.extname(relative));

  if (segment && featureInternalSegments.has(segment)) {
    return segment;
  }

  if (featureInternalSegments.has(basename)) {
    return basename;
  }

  return null;
}

function isAppOrOrchestration(filePath) {
  const relative = relativeToRoot(filePath);
  return (
    relative.startsWith("apps/") ||
    relative.startsWith("packages/orchestration/")
  );
}

function isClientComponent(source) {
  return /^\s*["']use client["'];?/.test(source);
}

function isUiPackage(filePath) {
  const relative = relativeToRoot(filePath);
  return (
    relative.startsWith("packages/ui/") ||
    relative.startsWith("packages/design-system/")
  );
}

function isMetadataFile(filePath) {
  const relative = relativeToRoot(filePath);
  return (
    relative.startsWith("packages/metadata/") ||
    /(^|\/)metadata\.(ts|tsx|js|jsx|mjs|mts)$/.test(relative)
  );
}

function addViolation(filePath, message) {
  violations.push(`${relativeToRoot(filePath)}: ${message}`);
}

function checkImport(filePath, source, specifier, packageName) {
  const resolvedPath = resolveRelativeImport(filePath, specifier);

  checkFeatureIsolation(filePath, specifier, packageName);
  checkAppFeatureEntrypoints(filePath, specifier, resolvedPath);
  checkClientDatabaseImports(filePath, source, specifier, resolvedPath);
  checkUiPackageImports(filePath, specifier, resolvedPath);
  checkMetadataImports(filePath, specifier, resolvedPath);
}

function checkFeatureIsolation(filePath, specifier, packageName) {
  const currentFeatureRoot = getFeatureRoot(filePath);
  const resolvedFeatureRoot =
    getResolvedFeatureRoot(filePath, specifier) ?? null;
  const featureAliasPackage = getFeatureAliasPackage(specifier);

  if (currentFeatureRoot) {
    if (resolvedFeatureRoot && resolvedFeatureRoot !== currentFeatureRoot) {
      addViolation(
        filePath,
        `feature packages must not import sibling feature internals: ${specifier}`
      );
    }

    if (featureAliasPackage && featureAliasPackage !== packageName) {
      addViolation(
        filePath,
        `feature packages must not import other feature packages: ${specifier}`
      );
    }
  }
}

function checkAppFeatureEntrypoints(filePath, specifier, resolvedPath) {
  if (isAppOrOrchestration(filePath)) {
    const internalSegment =
      getFeatureInternalSegmentFromSpecifier(specifier) ??
      (resolvedPath
        ? getFeatureInternalSegmentFromResolvedPath(resolvedPath)
        : null);

    if (internalSegment) {
      addViolation(
        filePath,
        `apps and orchestration must use feature server/index entrypoints, not ${internalSegment}: ${specifier}`
      );
    }
  }
}

function checkClientDatabaseImports(filePath, source, specifier, resolvedPath) {
  if (isClientComponent(source)) {
    const importsDatabase =
      specifier === "@repo/database" ||
      specifier.startsWith("@repo/database/") ||
      (resolvedPath &&
        relativeToRoot(resolvedPath).startsWith("packages/database/"));

    if (importsDatabase) {
      addViolation(
        filePath,
        `client components must not import database code: ${specifier}`
      );
    }
  }
}

function checkUiPackageImports(filePath, specifier, resolvedPath) {
  if (isUiPackage(filePath)) {
    const importsForbiddenRuntime =
      specifier === "@repo/database" ||
      specifier.startsWith("@repo/database/") ||
      specifier === "@repo/auth" ||
      specifier.startsWith("@repo/auth/") ||
      specifier.startsWith("@repo/features-") ||
      (resolvedPath &&
        (relativeToRoot(resolvedPath).startsWith("packages/database/") ||
          relativeToRoot(resolvedPath).startsWith("packages/auth/") ||
          relativeToRoot(resolvedPath).startsWith("packages/features/")));

    if (importsForbiddenRuntime) {
      addViolation(
        filePath,
        `UI packages must stay presentational and must not import runtime/business packages: ${specifier}`
      );
    }
  }
}

function checkMetadataImports(filePath, specifier, resolvedPath) {
  if (isMetadataFile(filePath)) {
    const importsBusinessAuthority =
      specifier === "@repo/database" ||
      specifier.startsWith("@repo/database/") ||
      specifier === "@repo/execution" ||
      specifier.startsWith("@repo/execution/") ||
      specifier === "@repo/permissions" ||
      specifier.startsWith("@repo/permissions/") ||
      specifier === "@repo/audit" ||
      specifier.startsWith("@repo/audit/") ||
      (resolvedPath &&
        [
          "packages/database/",
          "packages/execution/",
          "packages/permissions/",
          "packages/audit/",
        ].some((prefix) => relativeToRoot(resolvedPath).startsWith(prefix)));

    if (importsBusinessAuthority) {
      addViolation(
        filePath,
        `metadata must stay declarative and must not import business authority packages: ${specifier}`
      );
    }
  }
}

function checkFeatureActionFile(filePath, source) {
  const relative = relativeToRoot(filePath);

  if (
    !/^packages\/features\/.+\/src\/actions\.(ts|tsx|js|jsx|mjs|mts)$/.test(
      relative
    )
  ) {
    return;
  }

  if (!/from\s+["'](?:\.\/execution|@repo\/execution)/.test(source)) {
    addViolation(
      filePath,
      "feature actions must call the canonical execution pipeline through ./execution or @repo/execution"
    );
  }
}

for (const filePath of walk(root)) {
  const source = readFileSync(filePath, "utf8");
  const packageName = readPackageName(path.dirname(filePath));

  for (const specifier of extractImports(source)) {
    checkImport(filePath, source, specifier, packageName);
  }

  checkFeatureActionFile(filePath, source);
}

if (violations.length > 0) {
  console.error("Architecture boundary violations found:\n");

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exit(1);
}

console.log("Architecture boundary check passed.");
