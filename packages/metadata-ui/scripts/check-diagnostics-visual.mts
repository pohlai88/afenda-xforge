import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const diagnosticsContractPath = join(
  packageRoot,
  "src",
  "visualization",
  "diagnostics-visual-contract.ts"
);
const metadataDiagnosticsPanelPath = join(
  packageRoot,
  "src",
  "components",
  "metadata-diagnostics-panel.tsx"
);
const composeDiagnosticsPath = join(
  packageRoot,
  "src",
  "components",
  "compose-metadata-with-diagnostics.tsx"
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
const uiStateAdapterPath = join(
  packageRoot,
  "src",
  "adapters",
  "ui-state-adapter.tsx"
);
const fallbacksPath = join(packageRoot, "src", "adapters", "fallbacks.tsx");
const errorStatePath = join(
  packageRoot,
  "src",
  "renderers",
  "states",
  "error-state.renderer.tsx"
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

function checkDiagnosticsContract(violations: string[]): void {
  const source = readFileSync(diagnosticsContractPath, "utf8");
  const contractChecks = [
    {
      includes: "DIAGNOSTICS_VISUAL_DEFINITION",
      message: "must define DIAGNOSTICS_VISUAL_DEFINITION (MUI-VIS-012)",
    },
    {
      includes: "shouldSurfaceDiagnostics",
      message: "must expose shouldSurfaceDiagnostics (MUI-VIS-012)",
    },
    {
      includes: "filterUiVisibleDiagnostics",
      message: "must filter UI-visible severities (MUI-VIS-012)",
    },
    {
      includes: "resolveDiagnosticsPanelProps",
      message: "must expose diagnostics panel data attributes (MUI-VIS-012)",
    },
    {
      includes: "resolveFallbackDiagnosticsShellClassName",
      message: "must expose fallback diagnostics shell class (MUI-VIS-012)",
    },
  ] as const;

  for (const check of contractChecks) {
    if (!source.includes(check.includes)) {
      violations.push(
        `${relative(packageRoot, diagnosticsContractPath)}: ${check.message}`
      );
    }
  }
}

function checkDiagnosticsComponents(violations: string[]): void {
  assertRequiredPatterns(
    metadataDiagnosticsPanelPath,
    readFileSync(metadataDiagnosticsPanelPath, "utf8"),
    [
      {
        pattern: /resolveDiagnosticsPanelProps/,
        message:
          "diagnostics panel must expose data-diagnostics-panel (MUI-VIS-012)",
      },
      {
        pattern: /resolveDiagnosticsCorrelationProps/,
        message:
          "diagnostics panel must expose correlation ID marker (MUI-VIS-012)",
      },
      {
        pattern: /context\.correlationId/,
        message:
          "diagnostics panel must render context correlation ID (MUI-VIS-012)",
      },
      {
        pattern: /shouldSurfaceDiagnostics/,
        message:
          "diagnostics panel must gate on shouldSurfaceDiagnostics (MUI-VIS-012)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    composeDiagnosticsPath,
    readFileSync(composeDiagnosticsPath, "utf8"),
    [
      {
        pattern: /composeMetadataWithDiagnostics/,
        message:
          "must expose composeMetadataWithDiagnostics helper (MUI-VIS-012)",
      },
      {
        pattern: /MetadataDiagnosticsPanel/,
        message:
          "compose helper must append MetadataDiagnosticsPanel (MUI-VIS-012)",
      },
    ],
    violations
  );
}

function checkDiagnosticsWiring(violations: string[]): void {
  assertRequiredPatterns(
    metadataFormPath,
    readFileSync(metadataFormPath, "utf8"),
    [
      {
        pattern: /composeMetadataWithDiagnostics/,
        message:
          "form must compose diagnostics panel when enabled (MUI-VIS-012)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    metadataTablePath,
    readFileSync(metadataTablePath, "utf8"),
    [
      {
        pattern: /composeMetadataWithDiagnostics/,
        message:
          "table/panel must compose diagnostics panel when enabled (MUI-VIS-012)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    uiStateAdapterPath,
    readFileSync(uiStateAdapterPath, "utf8"),
    [
      {
        pattern: /composeMetadataWithDiagnostics/,
        message: "state adapter must compose diagnostics panel (MUI-VIS-012)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    fallbacksPath,
    readFileSync(fallbacksPath, "utf8"),
    [
      {
        pattern: /context=\{props\.context\}/,
        message:
          "fallback renderers must pass context for diagnostics UI (MUI-VIS-012)",
      },
      {
        pattern: /correlationId=\{fallback\.correlationId\}/,
        message:
          "fallback renderers must pass diagnostic correlation ID (MUI-VIS-012)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    errorStatePath,
    readFileSync(errorStatePath, "utf8"),
    [
      {
        pattern: /data-fallback-surface="true"/,
        message:
          "ErrorState must mark fallback surfaces distinctly (MUI-VIS-012)",
      },
      {
        pattern: /MetadataDiagnosticsCorrelationFooter/,
        message:
          "ErrorState must render correlation footer when enabled (MUI-VIS-012)",
      },
      {
        pattern: /resolveFallbackDiagnosticsShellClassName/,
        message:
          "ErrorState must apply fallback diagnostics shell class (MUI-VIS-012)",
      },
    ],
    violations
  );
}

export function checkDiagnosticsVisual(): void {
  const violations: string[] = [];

  checkDiagnosticsContract(violations);
  checkDiagnosticsComponents(violations);
  checkDiagnosticsWiring(violations);

  if (violations.length > 0) {
    throw new Error(
      `MUI-VIS-012 diagnostics visual lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkDiagnosticsVisual();
  console.log("metadata-ui diagnostics visual lint passed (MUI-VIS-012)");
}
