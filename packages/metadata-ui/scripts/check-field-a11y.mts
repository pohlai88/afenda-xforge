import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const fieldRendererRoot = join(packageRoot, "src", "renderers", "fields");
const uiFieldErrorPath = join(
  packageRoot,
  "..",
  "ui",
  "src",
  "components",
  "ui-shadcn",
  "field.tsx"
);
const sharedFieldModules = new Set([
  "field-visual-state.ts",
  "metadata-field-shell.tsx",
  "index.ts",
]);

const shellPath = join(fieldRendererRoot, "metadata-field-shell.tsx");

const requiredControlPatterns = [
  {
    pattern: /id=\{visualState\.controlId\}/,
    message: "missing control id={visualState.controlId}",
  },
  {
    pattern: /aria-describedby=\{visualState\.describedBy\}/,
    message: "missing aria-describedby={visualState.describedBy}",
  },
  {
    pattern: /aria-invalid=\{visualState\.hasError/,
    message: "missing aria-invalid={visualState.hasError ...}",
  },
] as const;

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

export function checkFieldA11y(): void {
  const violations: string[] = [];
  const shellSource = readFileSync(shellPath, "utf8");
  const shellRelativePath = relative(packageRoot, shellPath);

  if (!shellSource.includes("htmlFor={visualState.controlId}")) {
    violations.push(
      `${shellRelativePath}: FieldLabel must use htmlFor={visualState.controlId} (MUI-VIS-005)`
    );
  }

  if (!shellSource.includes("id={visualState.helpId}")) {
    violations.push(
      `${shellRelativePath}: FieldDescription must expose id={visualState.helpId} (MUI-VIS-005)`
    );
  }

  if (!shellSource.includes("id={visualState.errorId}")) {
    violations.push(
      `${shellRelativePath}: FieldError must expose id={visualState.errorId} (MUI-VIS-005)`
    );
  }

  if (!shellSource.includes("FieldError")) {
    violations.push(
      `${shellRelativePath}: must render FieldError for inline errors (MUI-VIS-005)`
    );
  }

  const uiFieldErrorSource = readFileSync(uiFieldErrorPath, "utf8");

  if (!uiFieldErrorSource.includes('role="alert"')) {
    violations.push(
      `${relative(packageRoot, uiFieldErrorPath)}: FieldError must expose role="alert" (MUI-VIS-005)`
    );
  }

  for (const filePath of getFieldRendererFiles()) {
    const source = readFileSync(filePath, "utf8");
    const relativePath = relative(packageRoot, filePath);

    if (!source.includes("resolveFieldVisualState")) {
      violations.push(
        `${relativePath}: missing resolveFieldVisualState (MUI-VIS-005)`
      );
    }

    if (!source.includes("MetadataFieldShell")) {
      violations.push(
        `${relativePath}: missing MetadataFieldShell (MUI-VIS-005)`
      );
    }

    for (const rule of requiredControlPatterns) {
      if (!rule.pattern.test(source)) {
        violations.push(`${relativePath}: ${rule.message}`);
      }
    }

    if (
      (filePath.endsWith("checkbox-field.renderer.tsx") ||
        filePath.endsWith("switch-field.renderer.tsx")) &&
      source.includes("aria-label={field.label}")
    ) {
      violations.push(
        `${relativePath}: must not duplicate FieldLabel naming with aria-label (MUI-VIS-005)`
      );
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-VIS-005 field a11y lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkFieldA11y();
  console.log("metadata-ui field a11y lint passed (MUI-VIS-005)");
}
