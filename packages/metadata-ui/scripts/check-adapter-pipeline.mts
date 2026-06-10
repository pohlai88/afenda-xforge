import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

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
const metadataToolbarPath = join(
  packageRoot,
  "src",
  "components",
  "metadata-toolbar.tsx"
);
const metadataStateBoundaryPath = join(
  packageRoot,
  "src",
  "components",
  "metadata-state-boundary.tsx"
);
const tableCellAdapterPath = join(
  packageRoot,
  "src",
  "adapters",
  "ui-table-cell-adapter.tsx"
);
const adapterPipelineTestPath = join(
  packageRoot,
  "tests",
  "adapter-pipeline-surfaces.test.tsx"
);

const forbiddenComponentPatterns = [
  {
    file: metadataTablePath,
    pattern: /\.\/metadata-cell-renderers/,
    message:
      "metadata-table must route cells through adapters, not metadata-cell-renderers",
  },
  {
    file: metadataTablePath,
    pattern: /supportedTableCellKinds/,
    message:
      "metadata-table must derive supported column kinds from defaultFieldRegistry",
  },
  {
    file: activityTablePath,
    pattern: /from "\.\/state-panel"/,
    message:
      "activity-table async states must route through renderMetadataStateBoundaryResult",
  },
  {
    file: activityTablePath,
    pattern: /<StatePanel\b/,
    message:
      "activity-table must not render StatePanel directly for metadata states",
  },
] as const;

const requiredComponentPatterns = [
  {
    file: metadataFormPath,
    pattern: /resolveMetadataEntityCustomization/,
    message:
      "metadata-form must resolve customization through shared hook (MUI-017)",
  },
  {
    file: metadataSectionStackPath,
    pattern: /resolveMetadataEntityCustomization/,
    message:
      "metadata-section-stack must resolve customization through shared hook (MUI-017)",
  },
  {
    file: metadataTablePath,
    pattern: /renderMetadataTableCell\(/,
    message: "metadata-table must render cells via renderMetadataTableCell",
  },
  {
    file: metadataTablePath,
    pattern: /resolveMetadataEntityCustomization/,
    message:
      "metadata-table must resolve customization through shared hook (MUI-017)",
  },
  {
    file: metadataTablePath,
    pattern: /from "\.\.\/adapters\/ui-table-cell-adapter"/,
    message: "metadata-table must import table cell adapter from adapters",
  },
  {
    file: metadataTablePath,
    pattern: /defaultFieldRegistry\.has\(/,
    message:
      "metadata-table diagnostics must align with defaultFieldRegistry coverage",
  },
  {
    file: metadataFormPath,
    pattern: /renderMetadataField\(/,
    message: "metadata-form must render fields via renderMetadataField",
  },
  {
    file: metadataFormPath,
    pattern: /renderMetadataAction\(/,
    message: "metadata-form must render actions via renderMetadataAction",
  },
  {
    file: metadataFormPath,
    pattern: /renderMetadataStateBoundaryResult\(/,
    message: "metadata-form must route async states through state boundary",
  },
  {
    file: metadataSectionStackPath,
    pattern: /renderMetadataSection\(/,
    message: "metadata-section-stack must render sections via adapter",
  },
  {
    file: metadataToolbarPath,
    pattern: /renderMetadataAction\(/,
    message: "metadata-toolbar must render actions via adapter",
  },
  {
    file: metadataStateBoundaryPath,
    pattern: /renderMetadataState\(/,
    message: "metadata-state-boundary must route through renderMetadataState",
  },
  {
    file: activityTablePath,
    pattern: /renderMetadataStateBoundaryResult\(/,
    message: "activity-table must route async states through state boundary",
  },
  {
    file: tableCellAdapterPath,
    pattern: /renderMetadataField\(/,
    message: "table cell adapter must delegate to renderMetadataField",
  },
  {
    file: tableCellAdapterPath,
    pattern: /surfaceRole: "table-cell"/,
    message: "table cell adapter must mark table-cell surface role",
  },
] as const;

export function checkAdapterPipeline(): void {
  const violations: string[] = [];

  for (const rule of forbiddenComponentPatterns) {
    const source = readFileSync(rule.file, "utf8");

    if (rule.pattern.test(source)) {
      violations.push(
        `${relative(packageRoot, rule.file)}: ${rule.message} (MUI-002)`
      );
    }
  }

  for (const rule of requiredComponentPatterns) {
    const source = readFileSync(rule.file, "utf8");

    if (!rule.pattern.test(source)) {
      violations.push(
        `${relative(packageRoot, rule.file)}: ${rule.message} (MUI-002)`
      );
    }
  }

  if (
    !readFileSync(adapterPipelineTestPath, "utf8").includes(
      "renderMetadataTableCellResult"
    )
  ) {
    violations.push(
      `${relative(packageRoot, adapterPipelineTestPath)}: must assert table cell adapter registry flow (MUI-002)`
    );
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-002 adapter/registry pipeline lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkAdapterPipeline();
  console.log("MUI-002 adapter/registry pipeline lint passed.");
}
