import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const fieldRendererRoot = join(packageRoot, "src", "renderers", "fields");
const densityContractPath = join(
  packageRoot,
  "src",
  "visualization",
  "density-visual-contract.ts"
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
const metadataCardSectionRendererPath = join(
  packageRoot,
  "src",
  "renderers",
  "sections",
  "metadata-card-section.renderer.tsx"
);
const activityTablePath = join(
  packageRoot,
  "src",
  "components",
  "activity-table.tsx"
);
const metadataTablePath = join(
  packageRoot,
  "src",
  "components",
  "metadata-table.tsx"
);
const fieldShellPath = join(
  packageRoot,
  "src",
  "renderers",
  "fields",
  "metadata-field-shell.tsx"
);

const fieldRendererFiles = readdirSync(fieldRendererRoot).filter((fileName) =>
  fileName.endsWith("-field.renderer.tsx")
);

const requiredFieldPatterns = [
  {
    pattern: /density=\{context\.density\}/,
    message: "must pass context.density to MetadataFieldShell (MUI-VIS-008)",
  },
  {
    pattern: /(\bprops\.context\b|const \{[^}]*\bcontext\b)/,
    message: "must read density from props.context (MUI-VIS-008)",
  },
] as const;

const inputFieldRenderers = new Set([
  "text-field.renderer.tsx",
  "textarea-field.renderer.tsx",
  "select-field.renderer.tsx",
  "number-field.renderer.tsx",
  "money-field.renderer.tsx",
  "date-field.renderer.tsx",
]);

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

function checkDensityContract(violations: string[]): void {
  const densityContractSource = readFileSync(densityContractPath, "utf8");
  const contractChecks = [
    {
      includes: "DENSITY_VISUAL_MATRIX",
      message: "must define DENSITY_VISUAL_MATRIX (MUI-VIS-008)",
    },
    {
      includes: "resolveDensityVisualDefinition",
      message: "must expose resolveDensityVisualDefinition (MUI-VIS-008)",
    },
    {
      includes: "control-density",
      message: "must define control-density sizing helper (MUI-VIS-008)",
    },
  ] as const;

  for (const check of contractChecks) {
    if (!densityContractSource.includes(check.includes)) {
      violations.push(
        `${relative(packageRoot, densityContractPath)}: ${check.message}`
      );
    }
  }
}

function checkFieldRenderers(violations: string[]): void {
  for (const fileName of fieldRendererFiles) {
    const filePath = join(fieldRendererRoot, fileName);
    const source = readFileSync(filePath, "utf8");
    const relativePath = relative(packageRoot, filePath);

    assertRequiredPatterns(filePath, source, requiredFieldPatterns, violations);

    if (inputFieldRenderers.has(fileName)) {
      if (!source.includes("resolveFieldControlClassName")) {
        violations.push(
          `${relativePath}: input field must compose resolveFieldControlClassName with density (MUI-VIS-008)`
        );
      }

      if (!source.includes("context.density")) {
        violations.push(
          `${relativePath}: input field must pass context.density into control class resolver (MUI-VIS-008)`
        );
      }
    }

    if (
      fileName === "textarea-field.renderer.tsx" &&
      !source.includes("resolveDensityTextareaClassName")
    ) {
      violations.push(
        `${relativePath}: textarea must use resolveDensityTextareaClassName (MUI-VIS-008)`
      );
    }
  }

  const fieldShellSource = readFileSync(fieldShellPath, "utf8");

  if (!fieldShellSource.includes("resolveDensitySurfaceProps")) {
    violations.push(
      `${relative(packageRoot, fieldShellPath)}: field shell must apply data-density via resolveDensitySurfaceProps (MUI-VIS-008)`
    );
  }
}

function checkDensitySurfaces(violations: string[]): void {
  assertRequiredPatterns(
    metadataToolbarPath,
    readFileSync(metadataToolbarPath, "utf8"),
    [
      {
        pattern: /resolveDensityVisualDefinition\(context\.density\)/,
        message:
          "toolbar must resolve spacing/title classes from context.density (MUI-VIS-008)",
      },
      {
        pattern: /resolveDensitySurfaceProps\(context\.density\)/,
        message: "toolbar must expose data-density surface props (MUI-VIS-008)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    metadataFormPath,
    readFileSync(metadataFormPath, "utf8"),
    [
      {
        pattern: /resolveDensityVisualDefinition\(resolvedContext\.density\)/,
        message:
          "form must resolve density spacing from render context (MUI-VIS-008)",
      },
      {
        pattern: /resolveDensitySurfaceProps\(resolvedContext\.density\)/,
        message: "form must expose data-density surface props (MUI-VIS-008)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    metadataSectionStackPath,
    readFileSync(metadataSectionStackPath, "utf8"),
    [
      {
        pattern: /resolveDensityVisualDefinition\(resolvedContext\.density\)/,
        message:
          "section stack must resolve stack spacing from render context (MUI-VIS-008)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    metadataSectionRendererPath,
    readFileSync(metadataSectionRendererPath, "utf8"),
    [
      {
        pattern: /resolveDensityVisualDefinition\(context\.density\)/,
        message:
          "section renderer must resolve section spacing from context.density (MUI-VIS-008)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    metadataCardSectionRendererPath,
    readFileSync(metadataCardSectionRendererPath, "utf8"),
    [
      {
        pattern: /resolveDensityVisualDefinition\(context\.density\)/,
        message:
          "card section renderer must resolve card padding from context.density (MUI-VIS-008)",
      },
    ],
    violations
  );
}

function checkTableDensity(violations: string[]): void {
  assertRequiredPatterns(
    activityTablePath,
    readFileSync(activityTablePath, "utf8"),
    [
      {
        pattern: /density\?: MetadataRenderDensity/,
        message: "activity table must accept density prop (MUI-VIS-008)",
      },
      {
        pattern: /resolveDensitySurfaceProps\(density\)/,
        message:
          "activity table must expose data-density on surface (MUI-VIS-008)",
      },
      {
        pattern: /resolveFieldControlDensityClassName/,
        message:
          "activity table search input must use control-density sizing (MUI-VIS-008)",
      },
      {
        pattern: /resolveTableRowDensityClassName/,
        message:
          "activity table rows must use row-density sizing (MUI-VIS-008)",
      },
    ],
    violations
  );

  const metadataTableSource = readFileSync(metadataTablePath, "utf8");

  if (!metadataTableSource.includes("density={resolvedContext.density}")) {
    violations.push(
      `${relative(packageRoot, metadataTablePath)}: must pass render context density into ActivityTable (MUI-VIS-008)`
    );
  }
}

export function checkDensityVisual(): void {
  const violations: string[] = [];

  checkDensityContract(violations);
  checkFieldRenderers(violations);
  checkDensitySurfaces(violations);
  checkTableDensity(violations);

  if (violations.length > 0) {
    throw new Error(
      `MUI-VIS-008 density visual lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkDensityVisual();
  console.log("metadata-ui density visual lint passed (MUI-VIS-008)");
}
