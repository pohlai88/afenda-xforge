import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const contentLengthContractPath = join(
  packageRoot,
  "src",
  "visualization",
  "content-length-visual-contract.ts"
);
const activityTablePath = join(
  packageRoot,
  "src",
  "components",
  "activity-table.tsx"
);
const fieldTableCellDisplayPath = join(
  packageRoot,
  "src",
  "renderers",
  "fields",
  "field-table-cell-display.tsx"
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
const metadataFieldShellPath = join(
  packageRoot,
  "src",
  "renderers",
  "fields",
  "metadata-field-shell.tsx"
);
const metadataValueFormatterPath = join(
  packageRoot,
  "src",
  "formatting",
  "metadata-value-formatter.ts"
);
const textFieldRendererPath = join(
  packageRoot,
  "src",
  "renderers",
  "fields",
  "text-field.renderer.tsx"
);
const fieldRendererRoot = join(packageRoot, "src", "renderers", "fields");

const fieldRendererFiles = readdirSync(fieldRendererRoot).filter((fileName) =>
  fileName.endsWith("-field.renderer.tsx")
);

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

function checkContentLengthContract(violations: string[]): void {
  const source = readFileSync(contentLengthContractPath, "utf8");
  const contractChecks = [
    {
      includes: "METADATA_EMPTY_DISPLAY_VALUE",
      message: "must define METADATA_EMPTY_DISPLAY_VALUE (MUI-VIS-009)",
    },
    {
      includes: "METADATA_LONG_CONTENT_FIXTURES",
      message: "must define long-content fixtures (MUI-VIS-009)",
    },
    {
      includes: "resolveMetadataDisplayValue",
      message: "must expose resolveMetadataDisplayValue (MUI-VIS-009)",
    },
    {
      includes: "METADATA_TABLE_CELL_CONTENT_CLASS",
      message: "must define table cell truncation classes (MUI-VIS-009)",
    },
    {
      includes: "METADATA_FIELD_LABEL_CLASS",
      message: "must define field label truncation classes (MUI-VIS-009)",
    },
  ] as const;

  for (const check of contractChecks) {
    if (!source.includes(check.includes)) {
      violations.push(
        `${relative(packageRoot, contentLengthContractPath)}: ${check.message}`
      );
    }
  }
}

function checkFieldShellContentLength(violations: string[]): void {
  assertRequiredPatterns(
    metadataFieldShellPath,
    readFileSync(metadataFieldShellPath, "utf8"),
    [
      {
        pattern: /METADATA_FIELD_LABEL_CLASS/,
        message: "field shell must clamp/truncate labels (MUI-VIS-009)",
      },
      {
        pattern: /METADATA_FIELD_HELP_CLASS/,
        message: "field shell must clamp/truncate help text (MUI-VIS-009)",
      },
    ],
    violations
  );
}

function checkSurfaceContentLength(violations: string[]): void {
  assertRequiredPatterns(
    metadataToolbarPath,
    readFileSync(metadataToolbarPath, "utf8"),
    [
      {
        pattern: /METADATA_TOOLBAR_TITLE_CLASS/,
        message: "toolbar must truncate long titles (MUI-VIS-009)",
      },
      {
        pattern: /METADATA_TOOLBAR_DESCRIPTION_CLASS/,
        message: "toolbar must wrap/clamp long descriptions (MUI-VIS-009)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    metadataFormPath,
    readFileSync(metadataFormPath, "utf8"),
    [
      {
        pattern: /METADATA_FORM_TITLE_CLASS/,
        message: "form must truncate long titles (MUI-VIS-009)",
      },
      {
        pattern: /METADATA_FORM_DESCRIPTION_CLASS/,
        message: "form must wrap/clamp long descriptions (MUI-VIS-009)",
      },
    ],
    violations
  );
}

function checkTableContentLength(violations: string[]): void {
  assertRequiredPatterns(
    activityTablePath,
    readFileSync(activityTablePath, "utf8"),
    [
      {
        pattern: /METADATA_TABLE_CELL_CONTENT_CLASS/,
        message:
          "activity table must truncate fallback cell content (MUI-VIS-009)",
      },
      {
        pattern: /METADATA_TABLE_HEADER_LABEL_CLASS/,
        message: "activity table must truncate column headers (MUI-VIS-009)",
      },
      {
        pattern: /resolveMetadataDisplayValue/,
        message:
          "activity table must normalize empty cell values (MUI-VIS-009)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    fieldTableCellDisplayPath,
    readFileSync(fieldTableCellDisplayPath, "utf8"),
    [
      {
        pattern: /resolveMetadataDisplayValue/,
        message:
          "cell renderers must normalize empty display values (MUI-VIS-009)",
      },
      {
        pattern: /METADATA_TABLE_LINK_CLASS|resolveMetadataTableCellClassName/,
        message: "cell renderers must truncate long cell content (MUI-VIS-009)",
      },
      {
        pattern: /METADATA_STATUS_BADGE_CLASS/,
        message: "status cells must truncate long badge labels (MUI-VIS-009)",
      },
    ],
    violations
  );
}

function checkEmptyDisplayNormalization(violations: string[]): void {
  const formatterSource = readFileSync(metadataValueFormatterPath, "utf8");

  if (!formatterSource.includes("resolveMetadataFormattedDisplayValue")) {
    violations.push(
      `${relative(packageRoot, metadataValueFormatterPath)}: table formatters must normalize empty formatted values (MUI-VIS-009)`
    );
  }

  const textFieldSource = readFileSync(textFieldRendererPath, "utf8");

  if (!textFieldSource.includes("resolveMetadataDisplayValue")) {
    violations.push(
      `${relative(packageRoot, textFieldRendererPath)}: status field must use shared empty display contract (MUI-VIS-009)`
    );
  }

  for (const fileName of fieldRendererFiles) {
    const filePath = join(fieldRendererRoot, fileName);
    const source = readFileSync(filePath, "utf8");

    if (source.includes('"—"') || source.includes("'—'")) {
      violations.push(
        `${relative(packageRoot, filePath)}: use resolveMetadataDisplayValue instead of hardcoded em dash (MUI-VIS-009)`
      );
    }
  }
}

export function checkContentLength(): void {
  const violations: string[] = [];

  checkContentLengthContract(violations);
  checkFieldShellContentLength(violations);
  checkSurfaceContentLength(violations);
  checkTableContentLength(violations);
  checkEmptyDisplayNormalization(violations);

  if (violations.length > 0) {
    throw new Error(
      `MUI-VIS-009 content-length lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkContentLength();
  console.log("metadata-ui content-length lint passed (MUI-VIS-009)");
}
