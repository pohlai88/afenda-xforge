import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const scanRoots = [
  join(packageRoot, "src", "renderers"),
  join(packageRoot, "src", "adapters"),
] as const;

const relativeImportPattern = /from\s+["'](\.[^"']+)["']/g;
const jsxPattern = /<\/[A-Za-z][A-Za-z0-9]*>/;

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "generated") {
        return [];
      }

      return collectSourceFiles(fullPath);
    }

    return entry.isFile() && /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

function resolveRelativeImport(fromFile: string, spec: string): boolean {
  const base = join(dirname(fromFile), spec);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];

  return candidates.some(
    (candidate) => existsSync(candidate) && statSync(candidate).isFile()
  );
}

export function checkRendererImportPaths(): void {
  const violations: string[] = [];

  for (const root of scanRoots) {
    for (const filePath of collectSourceFiles(root)) {
      const source = readFileSync(filePath, "utf8");

      for (const match of source.matchAll(relativeImportPattern)) {
        const spec = match[1];

        if (!resolveRelativeImport(filePath, spec)) {
          violations.push(
            `${relative(packageRoot, filePath)}: unresolved relative import "${spec}"`
          );
        }
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `Renderer import path lint failed (MUI-VIS-013):\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

export function checkJsxExtensions(): void {
  const violations: string[] = [];
  const srcRoot = join(packageRoot, "src");

  for (const filePath of collectSourceFiles(srcRoot)) {
    if (!filePath.endsWith(".ts")) {
      continue;
    }

    const source = readFileSync(filePath, "utf8");

    if (jsxPattern.test(source)) {
      violations.push(
        `${relative(packageRoot, filePath)}: contains JSX but uses .ts extension — rename to .tsx`
      );
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `JSX file extension lint failed (MUI-VIS-013):\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

export function checkOrbitLayoutContract(): void {
  const violations: string[] = [];
  const orbitLayoutPath = join(
    packageRoot,
    "src",
    "visualization",
    "orbit-layout.ts"
  );
  const layoutContractPath = join(
    packageRoot,
    "src",
    "visualization",
    "layout-composition-contract.ts"
  );
  const orbitTestPath = join(packageRoot, "tests", "orbit-layout.test.ts");
  const packageJsonPath = join(packageRoot, "package.json");

  const orbitSource = readFileSync(orbitLayoutPath, "utf8");
  const requiredExports = [
    "resolveOrbitLayoutMetrics",
    "resolveOrbitNodePosition",
    "resolveOrbitNodePinStyle",
  ] as const;

  for (const exportName of requiredExports) {
    if (!orbitSource.includes(`export function ${exportName}`)) {
      violations.push(
        `${relative(packageRoot, orbitLayoutPath)}: missing export ${exportName} (MUI-VIS-013)`
      );
    }
  }

  if (!existsSync(layoutContractPath)) {
    violations.push(
      "src/visualization/layout-composition-contract.ts is required (MUI-VIS-013)"
    );
  }

  if (!existsSync(orbitTestPath)) {
    violations.push("tests/orbit-layout.test.ts is required (MUI-VIS-013)");
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
    exports?: Record<string, string>;
  };

  if (
    packageJson.exports?.["./visualization/orbit-layout"] !==
    "./src/visualization/orbit-layout.ts"
  ) {
    violations.push(
      'package.json must export "./visualization/orbit-layout" (MUI-VIS-013)'
    );
  }

  if (violations.length > 0) {
    throw new Error(
      `Orbit layout contract lint failed (MUI-VIS-013):\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

export function checkLayoutRendererSurfaces(): void {
  const violations: string[] = [];
  const layoutsRoot = join(packageRoot, "src", "renderers", "layouts");

  if (!existsSync(layoutsRoot)) {
    return;
  }

  for (const filePath of collectSourceFiles(layoutsRoot)) {
    if (!filePath.endsWith(".renderer.tsx")) {
      continue;
    }

    const source = readFileSync(filePath, "utf8");
    const relativePath = relative(packageRoot, filePath);

    if (
      !source.includes("@repo/ui") &&
      !source.includes("MetadataSurfaceRegion")
    ) {
      violations.push(
        `${relativePath}: layout renderer must compose @repo/ui or MetadataSurfaceRegion (MUI-VIS-013)`
      );
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `Layout renderer surface lint failed (MUI-VIS-013):\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

export function checkLayoutCompositionVisual(): void {
  checkRendererImportPaths();
  checkJsxExtensions();
  checkOrbitLayoutContract();
  checkLayoutRendererSurfaces();
}

if (isEntrypoint(import.meta.url)) {
  checkLayoutCompositionVisual();
  console.log(
    "metadata-ui layout composition visual lint passed (MUI-VIS-013)"
  );
}
