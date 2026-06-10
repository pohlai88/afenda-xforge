import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = fileURLToPath(new URL("..", import.meta.url));
const scanRoots = [join(appRoot, "app"), join(appRoot, "tests")];

const forbiddenRootBarrelPattern = /from\s+["']@repo\/metadata-ui["']/;

const allowedSubpathPrefixes = [
  "@repo/metadata-ui/adapters",
  "@repo/metadata-ui/client",
  "@repo/metadata-ui/components",
  "@repo/metadata-ui/compatibility",
  "@repo/metadata-ui/contracts",
  "@repo/metadata-ui/fixtures",
  "@repo/metadata-ui/policy",
  "@repo/metadata-ui/registry",
  "@repo/metadata-ui/renderers",
  "@repo/metadata-ui/server",
  "@repo/metadata-ui/visualization/",
] as const;

const getSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") {
        return [];
      }

      return getSourceFiles(fullPath);
    }

    return entry.isFile() && /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });

export function checkMetadataUiImports(): void {
  const violations: string[] = [];

  for (const root of scanRoots) {
    for (const filePath of getSourceFiles(root)) {
      const source = readFileSync(filePath, "utf8");

      if (forbiddenRootBarrelPattern.test(source)) {
        violations.push(
          `${relative(appRoot, filePath)}: use explicit @repo/metadata-ui subpaths (${allowedSubpathPrefixes.join(", ")}) instead of the root barrel (MUI-008)`
        );
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `app metadata-ui import boundary lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

checkMetadataUiImports();
console.log("app metadata-ui import boundary checks passed (MUI-008)");
