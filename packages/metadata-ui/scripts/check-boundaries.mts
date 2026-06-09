import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const packageRoot = resolve(import.meta.dirname, "..");
const srcRoot = join(packageRoot, "src");
const contractsRoot = join(srcRoot, "contracts");

const getSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return getSourceFiles(fullPath);
    }

    return entry.isFile() && /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });

const forbiddenSourcePatterns = [
  /from\s+["']@repo\/ui\/components\/compose\/(?:_previews|previews)(?:\/|["'])/,
  /from\s+["']@repo\/(?:database|auth|execution|audit)(?:\/|["'])/,
  /from\s+["']@repo\/design-system(?:\/|["'])/,
];

const forbiddenContractPatterns = [
  /from\s+["']@repo\/metadata(?:\/|["'])/,
  /from\s+["']@repo\/ui(?:\/|["'])/,
];

const violations: string[] = [];

for (const filePath of getSourceFiles(srcRoot)) {
  const source = readFileSync(filePath, "utf8");
  const relativePath = relative(packageRoot, filePath);

  for (const pattern of forbiddenSourcePatterns) {
    if (pattern.test(source)) {
      violations.push(`${relativePath}: forbidden package dependency`);
    }
  }
}

for (const filePath of getSourceFiles(contractsRoot)) {
  const source = readFileSync(filePath, "utf8");
  const relativePath = relative(packageRoot, filePath);

  for (const pattern of forbiddenContractPatterns) {
    if (pattern.test(source)) {
      violations.push(
        `${relativePath}: contracts must not couple to @repo/metadata or @repo/ui`
      );
    }
  }
}

if (violations.length > 0) {
  console.error("metadata-ui boundary violations detected:");

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exit(1);
}

console.log("metadata-ui boundary checks passed");
