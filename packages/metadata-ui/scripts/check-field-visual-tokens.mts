import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const fieldRendererRoot = join(packageRoot, "src", "renderers", "fields");
const sharedFieldModules = new Set([
  "field-visual-state.ts",
  "metadata-field-shell.tsx",
  "index.ts",
]);

const forbiddenPatterns = [
  {
    pattern: /#[0-9a-fA-F]{3,8}\b/,
    message: "hardcoded hex color",
  },
  {
    pattern: /\brgb\s*\(/,
    message: "hardcoded rgb() color",
  },
  {
    pattern: /\bhsl\s*\(/,
    message: "hardcoded hsl() color",
  },
  {
    pattern: /<textarea\b/,
    message: "raw textarea element — use @repo/ui Textarea",
  },
  {
    pattern: /<select\b/,
    message: "raw select element — use @repo/ui NativeSelect",
  },
  {
    pattern: /<input\b(?![^>]*type=["']hidden["'])/,
    message: "raw input element — use @repo/ui Input, Checkbox, or Switch",
  },
  {
    pattern: /className=\{?\s*["'`][^"'`]*border-gray/,
    message: "non-token gray utility",
  },
];

function getFieldRendererFiles(): string[] {
  return readdirSync(fieldRendererRoot, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".renderer.tsx") &&
        !sharedFieldModules.has(entry.name)
    )
    .map((entry) => join(fieldRendererRoot, entry.name));
}

export function checkFieldVisualTokens(): void {
  const violations: string[] = [];

  for (const filePath of getFieldRendererFiles()) {
    const source = readFileSync(filePath, "utf8");
    const relativePath = relative(packageRoot, filePath);

    if (!source.includes("resolveFieldVisualState")) {
      violations.push(
        `${relativePath}: missing resolveFieldVisualState (MUI-VIS-002)`
      );
    }

    if (!source.includes("MetadataFieldShell")) {
      violations.push(
        `${relativePath}: missing MetadataFieldShell (MUI-VIS-002)`
      );
    }

    if (!source.includes("@repo/ui")) {
      violations.push(`${relativePath}: must compose @repo/ui primitives`);
    }

    for (const rule of forbiddenPatterns) {
      if (rule.pattern.test(source)) {
        violations.push(`${relativePath}: ${rule.message}`);
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-VIS-002 field visual token lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkFieldVisualTokens();
  console.log("metadata-ui field visual token lint passed (MUI-VIS-002)");
}
