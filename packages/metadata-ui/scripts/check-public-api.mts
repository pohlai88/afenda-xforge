import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

type PackageJson = {
  exports?: Record<string, string>;
};

const packageRoot = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf8")
) as PackageJson;

const toDistDeclarationPath = (exportTarget: string): string | null => {
  if (exportTarget === "./package.json") {
    return null;
  }

  if (exportTarget === "./index.tsx") {
    return "./dist/index.d.ts";
  }

  if (exportTarget.startsWith("./src/")) {
    return exportTarget
      .replace(/^\.\/src\//, "./dist/src/")
      .replace(/\.(ts|tsx)$/, ".d.ts");
  }

  return exportTarget.replace(/\.(ts|tsx)$/, ".d.ts");
};

const violations: string[] = [];

for (const [exportKey, exportTarget] of Object.entries(
  packageJson.exports ?? {}
)) {
  const sourcePath = join(packageRoot, exportTarget);

  if (!existsSync(sourcePath)) {
    violations.push(
      `Missing export target for '${exportKey}': ${exportTarget}`
    );
    continue;
  }

  const distDeclarationPath = toDistDeclarationPath(exportTarget);

  if (!distDeclarationPath) {
    continue;
  }

  const declarationPath = join(packageRoot, distDeclarationPath);

  if (!existsSync(declarationPath)) {
    violations.push(
      `Missing declaration output for '${exportKey}': ${distDeclarationPath}`
    );
  }
}

if (violations.length > 0) {
  console.error("metadata-ui public API validation failed:");

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exit(1);
}

console.log("metadata-ui public API checks passed");
