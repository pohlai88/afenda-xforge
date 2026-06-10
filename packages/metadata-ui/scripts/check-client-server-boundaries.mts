import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const serverEntryPath = join(packageRoot, "src", "server.ts");
const clientEntryPath = join(packageRoot, "src", "client.ts");
const serverSafeScanRoots = [
  join(packageRoot, "src", "contracts"),
  join(packageRoot, "src", "policy"),
  join(packageRoot, "src", "compatibility", "compose-compatibility.ts"),
  join(packageRoot, "src", "compatibility", "metadata-ui-quality.ts"),
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
  /from\s+["']\.\/compatibility["']/,
] as const;

const forbiddenServerGraphPathPatterns = [
  /[\\/]src[\\/]adapters[\\/]/,
  /[\\/]src[\\/]components[\\/]/,
  /[\\/]src[\\/]registry[\\/]/,
  /[\\/]src[\\/]renderers[\\/]/,
  /[\\/]src[\\/]client\.ts$/,
  /[\\/]src[\\/]compatibility[\\/]index\.ts$/,
] as const;

const forbiddenServerSafeImportPatterns = [
  /\.\.\/adapters(?:\/|["'])/,
  /\.\.\/components(?:\/|["'])/,
  /\.\.\/registry(?:\/|["'])/,
  /\.\.\/renderers(?:\/|["'])/,
  /\.\/index(?:\.ts)?["']/,
] as const;

const requiredClientExportPatterns = [
  /export \* from "\.\/adapters"/,
  /export \* from "\.\/components"/,
  /export \* from "\.\/registry"/,
  /export \* from "\.\/renderers"/,
] as const;

const requiredServerExportPatterns = [
  /import "server-only"/,
  /export \* from "\.\/contracts"/,
  /export \* from "\.\/policy"/,
  /from "\.\/compatibility\/compose-compatibility"/,
] as const;

const relativeImportPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[\w*{}\s,$]+\s+from\s+)?["'](\.[^"']+)["']/g;

const collectFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectFiles(fullPath);
    }

    return entry.isFile() && /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });

const resolveRelativeImport = (
  fromFile: string,
  spec: string
): string | null => {
  const basePath = resolve(dirname(fromFile), spec);

  if (existsSync(basePath) && statSync(basePath).isDirectory()) {
    for (const candidate of ["index.ts", "index.tsx"]) {
      const indexPath = join(basePath, candidate);

      if (existsSync(indexPath)) {
        return indexPath;
      }
    }
  }

  for (const candidate of [`${basePath}.ts`, `${basePath}.tsx`, basePath]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
};

const collectServerEntryGraph = (entryPath: string): readonly string[] => {
  const visited = new Set<string>();
  const queue = [entryPath];

  while (queue.length > 0) {
    const filePath = queue.pop();

    if (!filePath || visited.has(filePath)) {
      continue;
    }

    visited.add(filePath);
    const source = readFileSync(filePath, "utf8");

    for (const match of source.matchAll(relativeImportPattern)) {
      const resolved = resolveRelativeImport(filePath, match[1]);

      if (resolved) {
        queue.push(resolved);
      }
    }
  }

  return [...visited];
};

const checkServerEntryGraph = (violations: string[]): void => {
  for (const filePath of collectServerEntryGraph(serverEntryPath)) {
    const normalizedPath = filePath.replaceAll("\\", "/");

    for (const pattern of forbiddenServerGraphPathPatterns) {
      if (pattern.test(normalizedPath)) {
        violations.push(
          `${relative(packageRoot, filePath)}: server entry graph must not reach client-only modules (MUI-008)`
        );
        break;
      }
    }

    const source = readFileSync(filePath, "utf8");

    if (/^import\s+(?!type\b).*from\s+["']react(?:\/|["'])/m.test(source)) {
      violations.push(
        `${relative(packageRoot, filePath)}: server entry graph must not import React values (MUI-008)`
      );
    }
  }
};

const checkServerEntrySource = (
  serverSource: string,
  violations: string[]
): void => {
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
        `${relative(packageRoot, serverEntryPath)}: server entry must satisfy ${pattern.source} (MUI-008)`
      );
    }
  }
};

const checkClientEntrySource = (
  clientSource: string,
  violations: string[]
): void => {
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
};

const checkServerSafeModules = (violations: string[]): void => {
  for (const root of serverSafeScanRoots) {
    const files = root.endsWith(".ts") ? [root] : collectFiles(root);

    for (const filePath of files) {
      const source = readFileSync(filePath, "utf8");

      if (/^import\s+(?!type\b).*from\s+["']react(?:\/|["'])/m.test(source)) {
        violations.push(
          `${relative(packageRoot, filePath)}: server-safe modules must not import React values (MUI-008)`
        );
      }

      for (const pattern of forbiddenServerSafeImportPatterns) {
        if (pattern.test(source)) {
          violations.push(
            `${relative(packageRoot, filePath)}: server-safe modules must not import client barrels (MUI-008)`
          );
        }
      }
    }
  }
};

const checkBoundaryTests = (
  boundaryTestSource: string,
  violations: string[]
): void => {
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
};

export function checkClientServerBoundaries(): void {
  const violations: string[] = [];
  const serverSource = readFileSync(serverEntryPath, "utf8");
  const clientSource = readFileSync(clientEntryPath, "utf8");
  const boundaryTestSource = readFileSync(clientBoundaryTestPath, "utf8");

  checkServerEntrySource(serverSource, violations);
  checkClientEntrySource(clientSource, violations);
  checkServerEntryGraph(violations);
  checkServerSafeModules(violations);
  checkBoundaryTests(boundaryTestSource, violations);

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
