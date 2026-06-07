#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const uiRoot = path.join(root, "packages", "ui");
const designSystemRoot = path.join(root, "packages", "design-system");
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
]);
const uiForbiddenDirectories = ["hooks", "lib", "providers", "styles"];
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

function checkForbiddenUiDirectories() {
  for (const directoryName of uiForbiddenDirectories) {
    const fullPath = path.join(uiRoot, directoryName);

    if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
      addViolation(
        `packages/ui must not own ${directoryName}/; move that responsibility into packages/design-system`
      );
    }
  }
}

function checkPackageExports() {
  const uiPackage = readJson(path.join(uiRoot, "package.json"));
  const designSystemPackage = readJson(
    path.join(designSystemRoot, "package.json")
  );
  const uiExports = Object.keys(uiPackage.exports ?? {});

  for (const exportKey of uiExports) {
    if (
      exportKey.startsWith("./hooks") ||
      exportKey.startsWith("./lib") ||
      exportKey.startsWith("./providers") ||
      exportKey.startsWith("./styles")
    ) {
      addViolation(
        `packages/ui package exports must stay presentational and must not expose ${exportKey}`
      );
    }
  }

  const designSystemDependencies = {
    ...(designSystemPackage.dependencies ?? {}),
    ...(designSystemPackage.devDependencies ?? {}),
  };

  if (Object.hasOwn(designSystemDependencies, "@repo/ui")) {
    addViolation("packages/design-system must not depend on @repo/ui");
  }
}

function checkRootEntrypoints() {
  const designSystemIndex = readFileSync(
    path.join(designSystemRoot, "index.tsx"),
    "utf8"
  );
  const uiIndex = readFileSync(path.join(uiRoot, "index.tsx"), "utf8");

  for (const forbiddenName of ["ModeToggle", "cn", "capitalize"]) {
    if (designSystemIndex.includes(forbiddenName)) {
      addViolation(
        `packages/design-system/index.tsx must stay infrastructure-only and must not re-export ${forbiddenName}`
      );
    }
  }

  if (uiIndex.includes("@repo/design-system")) {
    addViolation(
      "packages/ui/index.tsx must export local UI components only and must not re-export @repo/design-system directly"
    );
  }
}

function getFilesToCheck() {
  const files = [
    ...walk(uiRoot),
    ...walk(designSystemRoot),
    ...walk(path.join(root, "apps")),
    ...walk(path.join(root, "packages")),
  ];
  return [...new Set(files)];
}

function checkDesignSystemImports({
  isDesignSystemFile,
  relativePath,
  specifier,
}) {
  if (isDesignSystemFile && specifier.startsWith("@repo/ui")) {
    addViolation(
      `${relativePath}: packages/design-system must not import @repo/ui`
    );
  }
}

function checkUiImports({ isUiFile, relativePath, specifier }) {
  if (isUiFile && specifier === "@repo/design-system") {
    addViolation(
      `${relativePath}: packages/ui must use explicit @repo/design-system subpath imports`
    );
  }

  if (
    isUiFile &&
    (specifier.startsWith("@repo/design-system/providers/") ||
      specifier.startsWith("@repo/design-system/styles/") ||
      specifier.startsWith("@repo/design-system/hooks/"))
  ) {
    addViolation(
      `${relativePath}: packages/ui must not depend on design-system provider/style/hook internals: ${specifier}`
    );
  }
}

function checkExternalDesignSystemImports({
  isDesignSystemFile,
  isUiFile,
  relativePath,
  specifier,
}) {
  if (
    !(isUiFile || isDesignSystemFile) &&
    (specifier.startsWith("@repo/design-system/components/") ||
      specifier.startsWith("@repo/design-system/lib/") ||
      specifier.startsWith("@repo/design-system/hooks/") ||
      specifier.startsWith("@repo/design-system/providers/"))
  ) {
    addViolation(
      `${relativePath}: application and feature code must import presentational components from @repo/ui and design-system infrastructure only from approved root/style entrypoints: ${specifier}`
    );
  }
}

function checkImportsForFile(filePath) {
  const relativePath = relativeToRoot(filePath);
  const source = readFileSync(filePath, "utf8");
  const imports = extractImports(source);
  const isUiFile = relativePath.startsWith("packages/ui/");
  const isDesignSystemFile = relativePath.startsWith("packages/design-system/");

  for (const specifier of imports) {
    const context = {
      isDesignSystemFile,
      isUiFile,
      relativePath,
      specifier,
    };

    checkDesignSystemImports(context);
    checkUiImports(context);
    checkExternalDesignSystemImports(context);
  }
}

function checkImports() {
  for (const filePath of getFilesToCheck()) {
    checkImportsForFile(filePath);
  }
}

checkForbiddenUiDirectories();
checkPackageExports();
checkRootEntrypoints();
checkImports();

if (violations.length > 0) {
  console.error("UI/design-system boundary violations found:\n");

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exit(1);
}

console.log("UI/design-system boundary check passed.");
