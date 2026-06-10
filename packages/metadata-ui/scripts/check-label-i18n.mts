import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const labelResolverPath = join(
  packageRoot,
  "src",
  "localization",
  "resolve-metadata-label.ts"
);
const fieldAdapterPath = join(
  packageRoot,
  "src",
  "adapters",
  "ui-field-adapter.tsx"
);
const actionAdapterPath = join(
  packageRoot,
  "src",
  "adapters",
  "ui-action-adapter.tsx"
);
const sectionAdapterPath = join(
  packageRoot,
  "src",
  "adapters",
  "ui-section-adapter.tsx"
);
const renderContextDefaultsPath = join(
  packageRoot,
  "src",
  "contracts",
  "render-context.defaults.ts"
);
const labelTestPath = join(
  packageRoot,
  "tests",
  "label-i18n-and-section-completeness.test.tsx"
);

export function checkLabelI18n(): void {
  const violations: string[] = [];
  const labelResolverSource = readFileSync(labelResolverPath, "utf8");
  const fieldAdapterSource = readFileSync(fieldAdapterPath, "utf8");
  const actionAdapterSource = readFileSync(actionAdapterPath, "utf8");
  const sectionAdapterSource = readFileSync(sectionAdapterPath, "utf8");
  const renderContextDefaultsSource = readFileSync(
    renderContextDefaultsPath,
    "utf8"
  );
  const labelTestSource = readFileSync(labelTestPath, "utf8");

  if (!labelResolverSource.includes("labelCatalog")) {
    violations.push(
      `${relative(packageRoot, labelResolverPath)}: must resolve labelCatalog entries (MUI-016)`
    );
  }

  if (!renderContextDefaultsSource.includes("labelCatalog")) {
    violations.push(
      `${relative(packageRoot, renderContextDefaultsPath)}: must expose labelCatalog on render context defaults (MUI-016)`
    );
  }

  for (const [filePath, source] of [
    [fieldAdapterPath, fieldAdapterSource],
    [actionAdapterPath, actionAdapterSource],
    [sectionAdapterPath, sectionAdapterSource],
  ] as const) {
    if (!source.includes("withLocalized")) {
      violations.push(
        `${relative(packageRoot, filePath)}: must localize metadata labels before rendering (MUI-016)`
      );
    }
  }

  if (!labelTestSource.includes("resolveMetadataLabel")) {
    violations.push(
      `${relative(packageRoot, labelTestPath)}: must assert locale label resolution (MUI-016)`
    );
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-016 label i18n lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkLabelI18n();
  console.log("metadata-ui label i18n lint passed (MUI-016)");
}
