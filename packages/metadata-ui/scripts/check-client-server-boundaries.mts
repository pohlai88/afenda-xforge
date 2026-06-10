import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const serverEntryPath = join(packageRoot, "src", "server.ts");
const clientEntryPath = join(packageRoot, "src", "client.ts");
const serverSafeRoots = [
  join(packageRoot, "src", "contracts"),
  join(packageRoot, "src", "policy"),
  join(packageRoot, "src", "compatibility"),
];
const clientBoundaryTestPath = join(
  packageRoot,
  "tests",
  "client-server-boundaries.test.ts"
);

const forbiddenServerImportPatterns = [
  /\.\/adapters(?:\/|["'])/,
  /\.\/components(?:\/|["'])/,
  /\.\/registry(?:\/|["'])/,
  /\.\/renderers(?:\/|["'])/,
  /from\s+["']react(?:\/|["'])/,
] as const;

const requiredClientExportPatterns = [
  /export \* from "\.\/adapters"/,
  /export \* from "\.\/components"/,
  /export \* from "\.\/registry"/,
  /export \* from "\.\/renderers"/,
] as const;

const requiredServerExportPatterns = [
  /export \* from "\.\/contracts"/,
  /export \* from "\.\/policy"/,
  /from "\.\/compatibility"/,
] as const;

const collectFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectFiles(fullPath);
    }

    return entry.isFile() && /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });

export function checkClientServerBoundaries(): void {
  const violations: string[] = [];
  const serverSource = readFileSync(serverEntryPath, "utf8");
  const clientSource = readFileSync(clientEntryPath, "utf8");
  const boundaryTestSource = readFileSync(clientBoundaryTestPath, "utf8");

  for (const pattern of forbiddenServerImportPatterns) {
    if (pattern.test(serverSource)) {
      violations.push(
        `${relative(packageRoot, serverEntryPath)}: server entry must not import client barrels or React (MUI-008)`
      );
    }
  }

  for (const pattern of requiredServerExportPatterns) {
    if (!pattern.test(serverSource)) {
      violations.push(
        `${relative(packageRoot, serverEntryPath)}: server entry must export ${pattern.source} (MUI-008)`
      );
    }
  }

  for (const pattern of requiredClientExportPatterns) {
    if (!pattern.test(clientSource)) {
      violations.push(
        `${relative(packageRoot, clientEntryPath)}: client entry must export ${pattern.source} (MUI-008)`
      );
    }
  }

  if (/\.\/server(?:\/|["'])/.test(clientSource)) {
    violations.push(
      `${relative(packageRoot, clientEntryPath)}: client entry must not import server entry (MUI-008)`
    );
  }

  for (const root of serverSafeRoots) {
    for (const filePath of collectFiles(root)) {
      const source = readFileSync(filePath, "utf8");

      if (/^import\s+(?!type\b).*from\s+["']react(?:\/|["'])/m.test(source)) {
        violations.push(
          `${relative(packageRoot, filePath)}: server-safe modules must not import React values (MUI-008)`
        );
      }
    }
  }

  if (!boundaryTestSource.includes("@repo/metadata-ui/server")) {
    violations.push(
      `${relative(packageRoot, clientBoundaryTestPath)}: must assert server subpath boundary (MUI-008)`
    );
  }

  if (!boundaryTestSource.includes("@repo/metadata-ui/client")) {
    violations.push(
      `${relative(packageRoot, clientBoundaryTestPath)}: must assert client subpath boundary (MUI-008)`
    );
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-008 client/server boundary lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkClientServerBoundaries();
  console.log("MUI-008 client/server boundary lint passed.");
}
