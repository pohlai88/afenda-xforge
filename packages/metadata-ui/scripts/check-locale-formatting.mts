import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const fieldRendererRoot = join(packageRoot, "src", "renderers", "fields");
const formatterPath = join(
  packageRoot,
  "src",
  "formatting",
  "metadata-value-formatter.ts"
);
const fieldTableCellDisplayPath = join(
  packageRoot,
  "src",
  "renderers",
  "fields",
  "field-table-cell-display.tsx"
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

const localeFieldRenderers = [
  "number-field.renderer.tsx",
  "money-field.renderer.tsx",
  "date-field.renderer.tsx",
] as const;

const requiredFieldPatterns = [
  {
    pattern: /metadata-value-formatter/,
    message: "must compose metadata-value-formatter (MUI-VIS-007)",
  },
  {
    pattern: /shouldFormatFieldForDisplay/,
    message: "must branch display formatting via shouldFormatFieldForDisplay",
  },
  {
    pattern: /(\bprops\.context\b|const \{[^}]*\bcontext\b)/,
    message: "must read locale/timezone from props.context",
  },
] as const;

export function checkLocaleFormatting(): void {
  const violations: string[] = [];
  const formatterSource = readFileSync(formatterPath, "utf8");

  if (!formatterSource.includes("Intl.NumberFormat")) {
    violations.push(
      `${relative(packageRoot, formatterPath)}: must use Intl.NumberFormat (MUI-VIS-007)`
    );
  }

  if (!formatterSource.includes("Intl.DateTimeFormat")) {
    violations.push(
      `${relative(packageRoot, formatterPath)}: must use Intl.DateTimeFormat (MUI-VIS-007)`
    );
  }

  if (!formatterSource.includes("timeZone: formatting.timezone")) {
    violations.push(
      `${relative(packageRoot, formatterPath)}: date formatting must honor context timezone (MUI-VIS-007)`
    );
  }

  for (const fileName of localeFieldRenderers) {
    const filePath = join(fieldRendererRoot, fileName);
    const source = readFileSync(filePath, "utf8");
    const relativePath = relative(packageRoot, filePath);

    for (const rule of requiredFieldPatterns) {
      if (!rule.pattern.test(source)) {
        violations.push(`${relativePath}: ${rule.message}`);
      }
    }
  }

  const cellRendererSource = readFileSync(fieldTableCellDisplayPath, "utf8");

  if (
    !(
      cellRendererSource.includes("renderMetadataTableCellSpan") ||
      readFileSync(
        join(
          packageRoot,
          "src",
          "renderers",
          "fields",
          "date-field.renderer.tsx"
        ),
        "utf8"
      ).includes("formatMetadataDate")
    )
  ) {
    violations.push(
      `${relative(packageRoot, fieldTableCellDisplayPath)}: table cell display must route through field formatters (MUI-VIS-007)`
    );
  }

  const activityTableSource = readFileSync(activityTablePath, "utf8");

  if (!activityTableSource.includes("formatMetadataTableCellValue")) {
    violations.push(
      `${relative(packageRoot, activityTablePath)}: must format fallback cells with locale/timezone (MUI-VIS-007)`
    );
  }

  const metadataTableSource = readFileSync(metadataTablePath, "utf8");

  if (!metadataTableSource.includes("defaultFieldRegistry.has(")) {
    violations.push(
      `${relative(packageRoot, metadataTablePath)}: must align table cell kinds with defaultFieldRegistry (MUI-VIS-007)`
    );
  }

  if (
    !metadataTableSource.includes(
      "renderMetadataTableCell(column, value, resolvedContext)"
    )
  ) {
    violations.push(
      `${relative(packageRoot, metadataTablePath)}: must pass render context into table cell renderer (MUI-VIS-007)`
    );
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-VIS-007 locale formatting lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkLocaleFormatting();
  console.log("metadata-ui locale formatting lint passed (MUI-VIS-007)");
}
