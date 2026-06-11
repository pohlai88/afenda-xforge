import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const APP_ROOT = join(import.meta.dirname, "..");
const SCAN_DIRS = [join(APP_ROOT, "app"), join(APP_ROOT, "lib")];

const CLIENT_FILE_PATTERN = /^\s*["']use client["'];?/m;

const FORBIDDEN_CLIENT_IMPORTS = [
  {
    fix: "@repo/auth/provider or @repo/auth/client or @repo/auth/routes",
    pattern: /from\s+["']@repo\/auth["']/g,
  },
  {
    fix: "server-only — move to Server Component or route handler",
    pattern: /from\s+["']@repo\/auth\/server["']/g,
  },
  {
    fix: "server-only repository module",
    pattern: /from\s+["']@repo\/database["']/g,
  },
  {
    fix: "server-only execution pipeline",
    pattern: /from\s+["']@repo\/execution["']/g,
  },
];

const collectSourceFiles = (directory: string): string[] => {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") {
        continue;
      }
      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (/\.(tsx|ts)$/.test(entry)) {
      files.push(fullPath);
    }
  }

  return files;
};

const violations: string[] = [];

for (const scanDir of SCAN_DIRS) {
  for (const filePath of collectSourceFiles(scanDir)) {
    const source = readFileSync(filePath, "utf8");
    if (!CLIENT_FILE_PATTERN.test(source)) {
      continue;
    }

    const relativePath = relative(APP_ROOT, filePath).replaceAll("\\", "/");

    for (const rule of FORBIDDEN_CLIENT_IMPORTS) {
      if (rule.pattern.test(source)) {
        violations.push(
          `${relativePath}: forbidden client import — use ${rule.fix}`
        );
      }
      rule.pattern.lastIndex = 0;
    }
  }
}

if (violations.length > 0) {
  console.error("Client/server boundary violations:\n");
  for (const violation of violations) {
    console.error(`  - ${violation}`);
  }
  process.exit(1);
}

console.log("Client/server boundary check passed.");
