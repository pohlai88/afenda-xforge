import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const scanRoots = [
  join(packageRoot, "src", "renderers"),
  join(packageRoot, "src", "components"),
];

const keyboardFocusContractPath = join(
  packageRoot,
  "src",
  "interaction",
  "keyboard-focus-contract.ts"
);

const activityTablePath = join(
  packageRoot,
  "src",
  "components",
  "activity-table.tsx"
);

const metadataCellRenderersPath = join(
  packageRoot,
  "src",
  "components",
  "metadata-cell-renderers.tsx"
);

const statePanelPath = join(
  packageRoot,
  "src",
  "components",
  "state-panel.tsx"
);

const baseActionPath = join(
  packageRoot,
  "src",
  "renderers",
  "actions",
  "base-action.renderer.tsx"
);

const uiButtonPath = join(
  packageRoot,
  "..",
  "ui",
  "src",
  "components",
  "ui-shadcn",
  "button.tsx"
);

const exemptOutlineNoneFiles = new Set([
  relative(packageRoot, keyboardFocusContractPath),
]);

const forbiddenPatterns = [
  {
    pattern: /pointer-events-none/,
    message:
      "pointer-events-none blocks keyboard focus — use disabled/tabIndex instead (MUI-VIS-006)",
  },
  {
    pattern: /<button\b/,
    message:
      "raw button element — use @repo/ui Button for focus-visible ring (MUI-VIS-006)",
  },
] as const;

function collectSourceFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const filePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(filePath));
      continue;
    }

    if (
      entry.isFile() &&
      (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))
    ) {
      files.push(filePath);
    }
  }

  return files;
}

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

export function checkKeyboardFocus(): void {
  const violations: string[] = [];

  for (const root of scanRoots) {
    for (const filePath of collectSourceFiles(root)) {
      const source = readFileSync(filePath, "utf8");
      const relativePath = relative(packageRoot, filePath);

      for (const rule of forbiddenPatterns) {
        if (rule.pattern.test(source)) {
          violations.push(`${relativePath}: ${rule.message}`);
        }
      }

      if (
        source.includes("outline-none") &&
        !exemptOutlineNoneFiles.has(relativePath) &&
        !source.includes("focus-visible:ring")
      ) {
        violations.push(
          `${relativePath}: outline-none requires focus-visible ring replacement (MUI-VIS-006)`
        );
      }
    }
  }

  const activityTableSource = readFileSync(activityTablePath, "utf8");
  assertRequiredPatterns(
    activityTablePath,
    activityTableSource,
    [
      {
        pattern: /handleKeyboardActivation/,
        message:
          "interactive rows must use handleKeyboardActivation (MUI-VIS-006)",
      },
      {
        pattern: /METADATA_INTERACTIVE_ROW_CLASS/,
        message:
          "interactive rows must expose token-backed focus ring (MUI-VIS-006)",
      },
      {
        pattern: /tabIndex=\{rowIsInteractive \? 0 : undefined\}/,
        message: "interactive rows must be keyboard focusable (MUI-VIS-006)",
      },
      {
        pattern: /variant="ghost"/,
        message: "column sort controls must use @repo/ui Button (MUI-VIS-006)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    metadataCellRenderersPath,
    readFileSync(metadataCellRenderersPath, "utf8"),
    [
      {
        pattern: /METADATA_INTERACTIVE_LINK_CLASS/,
        message:
          "mailto links must use token-backed focus-visible replacement (MUI-VIS-006)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    statePanelPath,
    readFileSync(statePanelPath, "utf8"),
    [
      {
        pattern: /disabled=\{action\.disabled\}/,
        message:
          "disabled link actions must use Button disabled prop (MUI-VIS-006)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    baseActionPath,
    readFileSync(baseActionPath, "utf8"),
    [
      {
        pattern: /tabIndex: action\.disabled \? -1 : undefined/,
        message:
          "disabled link actions must remove focus with tabIndex -1 (MUI-VIS-006)",
      },
    ],
    violations
  );

  const keyboardFocusContractSource = readFileSync(
    keyboardFocusContractPath,
    "utf8"
  );

  if (!keyboardFocusContractSource.includes("focus-visible:ring-[3px]")) {
    violations.push(
      `${relative(packageRoot, keyboardFocusContractPath)}: must define focus-visible ring tokens (MUI-VIS-006)`
    );
  }

  const uiButtonSource = readFileSync(uiButtonPath, "utf8");

  if (!uiButtonSource.includes("focus-visible:ring-[3px]")) {
    violations.push(
      `${relative(packageRoot, uiButtonPath)}: Button primitive must expose focus-visible ring (MUI-VIS-006)`
    );
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-VIS-006 keyboard/focus lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkKeyboardFocus();
  console.log("metadata-ui keyboard/focus lint passed (MUI-VIS-006)");
}
