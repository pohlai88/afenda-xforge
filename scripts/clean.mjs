#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const rootPackageJson = path.join(root, "package.json");

if (!fs.existsSync(rootPackageJson)) {
  throw new Error(`Workspace root not found: ${root}`);
}

const REMOVABLE_DIRS = [
  "node_modules",
  ".turbo",
  ".cache",
  ".next",
  "dist",
  "coverage",
];

function isIgnoredDir(name) {
  return name === ".git" || name === "node_modules";
}

function isWithinRoot(targetPath) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(targetPath);
  return (
    resolvedTarget === resolvedRoot ||
    resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`)
  );
}

function removeDir(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return false;
  }

  if (!isWithinRoot(targetPath)) {
    throw new Error(`Refusing to remove path outside workspace: ${targetPath}`);
  }

  fs.rmSync(targetPath, { force: true, recursive: true });
  return true;
}

function collectWorkspaceDirs(dir, matches = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (isIgnoredDir(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const packageJsonPath = path.join(fullPath, "package.json");

    if (fs.existsSync(packageJsonPath)) {
      matches.push(fullPath);
    }

    collectWorkspaceDirs(fullPath, matches);
  }

  return matches;
}

function cleanDir(baseDir, removed) {
  for (const removableDir of REMOVABLE_DIRS) {
    const targetPath = path.join(baseDir, removableDir);
    if (removeDir(targetPath)) {
      removed.push(path.relative(root, targetPath) || removableDir);
    }
  }
}

function main() {
  const removed = [];
  const workspaceDirs = new Set([root, ...collectWorkspaceDirs(root)]);

  for (const workspaceDir of workspaceDirs) {
    cleanDir(workspaceDir, removed);
  }

  if (removed.length === 0) {
    console.log("Nothing to clean.");
    return;
  }

  for (const relativePath of removed.sort()) {
    console.log(`removed ${relativePath}`);
  }

  console.log("");
  console.log(`Cleaned ${removed.length} directories.`);
}

main();
