import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

type PackageJson = {
  exports?: Record<string, string>;
};

type DeclarationSnapshot = {
  files: Record<string, string>;
};

const toDistDeclarationPath = (exportTarget: string): string | null => {
  if (exportTarget === "./package.json") {
    return null;
  }

  if (exportTarget === "./index.tsx") {
    return "dist/index.d.ts";
  }

  if (exportTarget.startsWith("./src/")) {
    return exportTarget
      .replace(/^\.\/src\//, "dist/src/")
      .replace(/\.(ts|tsx)$/, ".d.ts");
  }

  return exportTarget.replace(/^\.\//, "dist/").replace(/\.(ts|tsx)$/, ".d.ts");
};

export function checkPublicApi(): void {
  const packageJson = JSON.parse(
    readFileSync(join(packageRoot, "package.json"), "utf8")
  ) as PackageJson;
  const snapshotPath = join(
    packageRoot,
    "snapshots",
    "declaration-snapshot.json"
  );
  const violations: string[] = [];

  if (!existsSync(snapshotPath)) {
    violations.push(
      "Missing snapshots/declaration-snapshot.json — run update:declaration-snapshot after public API changes (MUI-011 / AC #7)"
    );
  }

  const snapshot = existsSync(snapshotPath)
    ? (JSON.parse(readFileSync(snapshotPath, "utf8")) as DeclarationSnapshot)
    : { files: {} };

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
      continue;
    }

    if (!snapshot.files[distDeclarationPath]) {
      violations.push(
        `Declaration snapshot missing hashed entry for '${exportKey}': ${distDeclarationPath} (MUI-011 / AC #7)`
      );
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `metadata-ui public API validation failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkPublicApi();
  console.log("metadata-ui public API checks passed");
}
