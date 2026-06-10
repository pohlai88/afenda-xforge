import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const fieldRendererRoot = join(packageRoot, "src", "renderers", "fields");
const fieldContractPath = join(
  packageRoot,
  "src",
  "contracts",
  "field-renderer.contract.ts"
);
const fieldAdapterPath = join(
  packageRoot,
  "src",
  "adapters",
  "ui-field-adapter.tsx"
);
const formPath = join(packageRoot, "src", "components", "metadata-form.tsx");
const fieldValueBindingTestPath = join(
  packageRoot,
  "tests",
  "field-value-binding.test.tsx"
);

const interactiveFieldRenderers = [
  "checkbox-field.renderer.tsx",
  "date-field.renderer.tsx",
  "money-field.renderer.tsx",
  "number-field.renderer.tsx",
  "select-field.renderer.tsx",
  "switch-field.renderer.tsx",
  "text-field.renderer.tsx",
  "textarea-field.renderer.tsx",
] as const;

export function checkFieldValueBinding(): void {
  const violations: string[] = [];
  const bindingHelperPath = join(fieldRendererRoot, "field-value-binding.ts");
  const bindingHelperSource = readFileSync(bindingHelperPath, "utf8");
  const fieldAdapterSource = readFileSync(fieldAdapterPath, "utf8");
  const formSource = readFileSync(formPath, "utf8");
  const fieldContractSource = readFileSync(fieldContractPath, "utf8");
  const bindingTestSource = readFileSync(fieldValueBindingTestPath, "utf8");

  if (!bindingHelperSource.includes("resolveFieldValueBinding")) {
    violations.push(
      `${relative(packageRoot, bindingHelperPath)}: must define resolveFieldValueBinding (MUI-013)`
    );
  }

  if (!fieldContractSource.includes("onChange?: (value: unknown) => void")) {
    violations.push(
      `${relative(packageRoot, fieldContractPath)}: field renderer props must expose onChange (MUI-013)`
    );
  }

  if (!fieldAdapterSource.includes("onChange")) {
    violations.push(
      `${relative(packageRoot, fieldAdapterPath)}: must forward onChange to field renderers (MUI-013)`
    );
  }

  if (!formSource.includes("onFieldChange")) {
    violations.push(
      `${relative(packageRoot, formPath)}: must expose onFieldChange (MUI-013)`
    );
  }

  for (const fileName of interactiveFieldRenderers) {
    const filePath = join(fieldRendererRoot, fileName);
    const source = readFileSync(filePath, "utf8");

    if (!source.includes("field-value-binding")) {
      violations.push(
        `${relative(packageRoot, filePath)}: must compose field-value-binding helpers (MUI-013)`
      );
    }
  }

  if (!bindingTestSource.includes("onFieldChange")) {
    violations.push(
      `${relative(packageRoot, fieldValueBindingTestPath)}: must assert controlled form binding (MUI-013)`
    );
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-013 field value binding lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkFieldValueBinding();
  console.log("MUI-013 field value binding lint passed.");
}
