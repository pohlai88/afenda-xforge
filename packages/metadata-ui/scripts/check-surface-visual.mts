import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const surfaceContractPath = join(
  packageRoot,
  "src",
  "visualization",
  "surface-visual-contract.ts"
);
const metadataSurfacePath = join(
  packageRoot,
  "src",
  "components",
  "metadata-surface.tsx"
);
const metadataSurfaceRegionPath = join(
  packageRoot,
  "src",
  "components",
  "metadata-surface-region.tsx"
);
const metadataToolbarPath = join(
  packageRoot,
  "src",
  "components",
  "metadata-toolbar.tsx"
);
const metadataFormPath = join(
  packageRoot,
  "src",
  "components",
  "metadata-form.tsx"
);
const metadataTablePath = join(
  packageRoot,
  "src",
  "components",
  "metadata-table.tsx"
);
const activityTablePath = join(
  packageRoot,
  "src",
  "components",
  "activity-table.tsx"
);
const metadataSectionStackPath = join(
  packageRoot,
  "src",
  "components",
  "metadata-section-stack.tsx"
);
const metadataSectionRendererPath = join(
  packageRoot,
  "src",
  "renderers",
  "sections",
  "metadata-section.renderer.tsx"
);

const requiredSurfaceKinds = [
  "dashboard",
  "detail",
  "form",
  "list",
  "workflow",
] as const;

function assertRequiredPatterns(
  filePath: string,
  source: string,
  patterns: Array<{ pattern: RegExp; message: string }>,
  violations: string[]
): void {
  const relativePath = relative(packageRoot, filePath);

  for (const rule of patterns) {
    if (!rule.pattern.test(source)) {
      violations.push(`${relativePath}: ${rule.message}`);
    }
  }
}

function checkSurfaceContract(violations: string[]): void {
  const source = readFileSync(surfaceContractPath, "utf8");
  const contractChecks = [
    {
      includes: "SURFACE_VISUAL_MATRIX",
      message: "must define SURFACE_VISUAL_MATRIX (MUI-VIS-011)",
    },
    {
      includes: "resolveSurfaceVisualDefinition",
      message: "must expose resolveSurfaceVisualDefinition (MUI-VIS-011)",
    },
    {
      includes: "resolveSurfaceKindProps",
      message: "must expose resolveSurfaceKindProps (MUI-VIS-011)",
    },
    {
      includes: "resolveSurfaceRegionProps",
      message: "must expose resolveSurfaceRegionProps (MUI-VIS-011)",
    },
    {
      includes: "resolveSectionSurfaceKind",
      message: "must map section kinds to surface kinds (MUI-VIS-011)",
    },
    {
      includes: "METADATA_SURFACE_HIERARCHY_SLOTS",
      message: "must declare core hierarchy slots (MUI-VIS-011)",
    },
  ] as const;

  for (const check of contractChecks) {
    if (!source.includes(check.includes)) {
      violations.push(
        `${relative(packageRoot, surfaceContractPath)}: ${check.message}`
      );
    }
  }

  for (const kind of requiredSurfaceKinds) {
    if (!source.includes(`${kind}:`)) {
      violations.push(
        `${relative(packageRoot, surfaceContractPath)}: SURFACE_VISUAL_MATRIX must include '${kind}' (MUI-VIS-011)`
      );
    }
  }
}

function checkSurfaceComponents(violations: string[]): void {
  assertRequiredPatterns(
    metadataSurfacePath,
    readFileSync(metadataSurfacePath, "utf8"),
    [
      {
        pattern: /resolveSurfaceKindProps\(surface\.kind\)/,
        message: "MetadataSurface must declare data-surface-kind (MUI-VIS-011)",
      },
      {
        pattern:
          /MetadataSurfaceRegion kind=\{surface\.kind\} region="primary"/,
        message:
          "MetadataSurface must expose primary content region (MUI-VIS-011)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    metadataSurfaceRegionPath,
    readFileSync(metadataSurfaceRegionPath, "utf8"),
    [
      {
        pattern: /resolveSurfaceRegionProps\(kind, region\)/,
        message:
          "MetadataSurfaceRegion must emit data-surface-region markers (MUI-VIS-011)",
      },
    ],
    violations
  );
}

function checkSurfaceWiring(violations: string[]): void {
  assertRequiredPatterns(
    metadataToolbarPath,
    readFileSync(metadataToolbarPath, "utf8"),
    [
      {
        pattern: /surfaceKind\?: MetadataSurfaceKind/,
        message: "toolbar must accept surfaceKind (MUI-VIS-011)",
      },
      {
        pattern: /wrapSurfaceRegion\([^,]+,\s*"title"/,
        message: "toolbar must mark title hierarchy slot (MUI-VIS-011)",
      },
      {
        pattern: /wrapSurfaceRegion\([^,]+,\s*"description"/,
        message: "toolbar must mark description hierarchy slot (MUI-VIS-011)",
      },
      {
        pattern: /wrapSurfaceRegion\([^,]+,\s*"secondary-actions"/,
        message:
          "toolbar must mark secondary action hierarchy slot (MUI-VIS-011)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    metadataFormPath,
    readFileSync(metadataFormPath, "utf8"),
    [
      {
        pattern: /resolveSurfaceKindProps\("form"\)/,
        message: "form must declare list surface kind 'form' (MUI-VIS-011)",
      },
      {
        pattern: /region="field-groups"/,
        message: "form must mark field-groups primary region (MUI-VIS-011)",
      },
      {
        pattern: /region="secondary-actions"/,
        message: "form must mark secondary action region (MUI-VIS-011)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    metadataTablePath,
    readFileSync(metadataTablePath, "utf8"),
    [
      {
        pattern: /resolveSurfaceKindProps\("list"\)/,
        message: "panel must declare list surface kind (MUI-VIS-011)",
      },
      {
        pattern: /surfaceKind="list"/,
        message: "panel toolbar must pass list surfaceKind (MUI-VIS-011)",
      },
      {
        pattern: /MetadataSurfaceRegion kind="list" region="primary"/,
        message: "panel must wrap table body in primary region (MUI-VIS-011)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    activityTablePath,
    readFileSync(activityTablePath, "utf8"),
    [
      {
        pattern: /region="filters"/,
        message: "activity table must mark filters region (MUI-VIS-011)",
      },
      {
        pattern: /region="data-grid"/,
        message: "activity table must mark data-grid region (MUI-VIS-011)",
      },
      {
        pattern: /region="pagination"/,
        message: "activity table must mark pagination region (MUI-VIS-011)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    metadataSectionStackPath,
    readFileSync(metadataSectionStackPath, "utf8"),
    [
      {
        pattern: /resolveSurfaceKindProps\("detail"\)/,
        message: "section stack must declare detail surface kind (MUI-VIS-011)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    metadataSectionRendererPath,
    readFileSync(metadataSectionRendererPath, "utf8"),
    [
      {
        pattern: /resolveSectionSurfaceKind\(section\.kind\)/,
        message:
          "section renderer must resolve surface kind from section (MUI-VIS-011)",
      },
      {
        pattern: /region="primary"/,
        message: "section renderer must expose primary region (MUI-VIS-011)",
      },
      {
        pattern: /surfaceKind=\{surfaceKind\}/,
        message:
          "section renderer must pass surfaceKind to toolbar (MUI-VIS-011)",
      },
    ],
    violations
  );
}

export function checkSurfaceVisual(): void {
  const violations: string[] = [];

  checkSurfaceContract(violations);
  checkSurfaceComponents(violations);
  checkSurfaceWiring(violations);

  if (violations.length > 0) {
    throw new Error(
      `MUI-VIS-011 surface visual lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkSurfaceVisual();
  console.log("metadata-ui surface visual lint passed (MUI-VIS-011)");
}
