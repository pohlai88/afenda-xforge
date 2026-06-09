#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const checkedExtensions = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "storybook-static",
]);

const packageRoots = {
  customization: path.join(root, "packages", "customization"),
  designSystem: path.join(root, "packages", "design-system"),
  metadata: path.join(root, "packages", "metadata"),
  metadataUi: path.join(root, "packages", "metadata-ui"),
  ui: path.join(root, "packages", "ui"),
};

const allowedWorkspaceDependenciesByPackage = {
  "@repo/customization": new Set([
    "@repo/metadata",
    "@repo/typescript-config",
  ]),
  "@repo/design-system": new Set(["@repo/typescript-config"]),
  "@repo/metadata": new Set(["@repo/typescript-config"]),
  "@repo/metadata-ui": new Set([
    "@repo/customization",
    "@repo/metadata",
    "@repo/typescript-config",
    "@repo/ui",
  ]),
  "@repo/ui": new Set(["@repo/design-system", "@repo/typescript-config"]),
};

const businessRuntimePrefixes = [
  "@repo/audit",
  "@repo/auth",
  "@repo/database",
  "@repo/execution",
  "@repo/features-",
  "@repo/logger",
  "@repo/customization",
  "@repo/metadata",
  "@repo/metadata-ui",
  "@repo/permissions",
  "@repo/search",
];

const uiRepoImports = new Set([
  "@repo/design-system",
  "@repo/typescript-config",
]);

const metadataUiRepoImports = new Set([
  "@repo/customization",
  "@repo/metadata",
  "@repo/typescript-config",
  "@repo/ui",
]);

const violations = [];

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function relativeToRoot(filePath) {
  return toPosix(path.relative(root, filePath));
}

function addViolation(message) {
  violations.push(message);
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
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

function getPackageKind(filePath) {
  const relativePath = relativeToRoot(filePath);

  if (relativePath.startsWith("packages/design-system/")) {
    return "designSystem";
  }

  if (relativePath.startsWith("packages/ui/")) {
    return "ui";
  }

  if (relativePath.startsWith("packages/metadata-ui/")) {
    return "metadataUi";
  }

  if (relativePath.startsWith("packages/customization/")) {
    return "customization";
  }

  if (relativePath.startsWith("packages/metadata/")) {
    return "metadata";
  }

  return null;
}

function checkRequiredDesignSystemScaffold() {
  const requiredFiles = [
    "architecture.md",
    "src/index.ts",
    "src/tokens/index.ts",
    "src/contracts/index.ts",
    "src/variants/index.ts",
  ];

  for (const relativeFile of requiredFiles) {
    const filePath = path.join(packageRoots.designSystem, relativeFile);

    if (!existsSync(filePath)) {
      addViolation(
        `packages/design-system must include ${relativeToRoot(filePath)}`
      );
    }
  }
}

function checkWorkspaceDependencies() {
  for (const packageRoot of Object.values(packageRoots)) {
    const packageJson = readJson(path.join(packageRoot, "package.json"));
    const packageName = packageJson.name;
    const allowedWorkspaceDependencies =
      allowedWorkspaceDependenciesByPackage[packageName];
    const declaredWorkspaceDependencies = [
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
      ...Object.keys(packageJson.peerDependencies ?? {}),
    ].filter((dependencyName) => dependencyName.startsWith("@repo/"));

    for (const dependencyName of declaredWorkspaceDependencies) {
      if (!allowedWorkspaceDependencies?.has(dependencyName)) {
        addViolation(
          `${packageName} must not declare workspace dependency ${dependencyName}`
        );
      }
    }
  }
}

function checkBusinessRuntimeImports(filePath, packageKind, specifier) {
  if (packageKind !== "designSystem" && packageKind !== "metadata") {
    return;
  }

  if (
    businessRuntimePrefixes.some(
      (prefix) => specifier === prefix || specifier.startsWith(`${prefix}/`)
    )
  ) {
    addViolation(
      `${relativeToRoot(filePath)}: ${packageKind} must not import runtime/business packages: ${specifier}`
    );
  }
}

function checkCrossPackageImports(filePath, packageKind, specifier) {
  if (
    packageKind === "designSystem" &&
    (specifier === "@repo/ui" ||
      specifier.startsWith("@repo/ui/") ||
      specifier === "@repo/metadata" ||
      specifier.startsWith("@repo/metadata/") ||
      specifier === "@repo/metadata-ui" ||
      specifier.startsWith("@repo/metadata-ui/"))
  ) {
    addViolation(
      `${relativeToRoot(filePath)}: @repo/design-system must stay vocabulary-only and must not import ${specifier}`
    );
  }

  if (
    packageKind === "ui" &&
    specifier.startsWith("@repo/") &&
    ![...uiRepoImports].some(
      (allowed) => specifier === allowed || specifier.startsWith(`${allowed}/`)
    )
  ) {
    addViolation(
      `${relativeToRoot(filePath)}: @repo/ui must only import design-system primitives and must not import ${specifier}`
    );
  }

  if (
    packageKind === "metadataUi" &&
    specifier.startsWith("@repo/") &&
    ![...metadataUiRepoImports].some(
      (allowed) => specifier === allowed || specifier.startsWith(`${allowed}/`)
    )
  ) {
    addViolation(
      `${relativeToRoot(filePath)}: @repo/metadata-ui must only import @repo/ui, @repo/metadata, and @repo/customization, not ${specifier}`
    );
  }

  if (
    packageKind === "customization" &&
    specifier.startsWith("@repo/") &&
    !["@repo/metadata"].some(
      (allowed) => specifier === allowed || specifier.startsWith(`${allowed}/`)
    )
  ) {
    addViolation(
      `${relativeToRoot(filePath)}: @repo/customization must only import @repo/metadata, not ${specifier}`
    );
  }
}

function checkImports() {
  for (const packageRoot of Object.values(packageRoots)) {
    for (const filePath of walk(packageRoot)) {
      const packageKind = getPackageKind(filePath);

      if (!packageKind) {
        continue;
      }

      const source = readFileSync(filePath, "utf8");
      const imports = extractImports(source);

      for (const specifier of imports) {
        checkBusinessRuntimeImports(filePath, packageKind, specifier);
        checkCrossPackageImports(filePath, packageKind, specifier);
      }
    }
  }
}

checkRequiredDesignSystemScaffold();
checkWorkspaceDependencies();
checkImports();

if (violations.length > 0) {
  console.error("UI/design-system/metadata boundary violations found:\n");

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exit(1);
}

console.log("UI/design-system/metadata boundary check passed.");
