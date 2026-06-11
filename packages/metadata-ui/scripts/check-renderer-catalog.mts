import { readFileSync } from "node:fs";
import { join } from "node:path";

import { metadataUiManifest } from "../metadata-ui.manifest.ts";
import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const minimumCatalogScore = 95;
const fixtureRequiredKinds = new Set(["action", "field", "section"]);

type CatalogSignal = {
  label: string;
  passed: boolean;
  weight: number;
};

function scoreSignals(signals: readonly CatalogSignal[]): number {
  const totalWeight = signals.reduce((sum, signal) => sum + signal.weight, 0);
  const passedWeight = signals.reduce(
    (sum, signal) => sum + (signal.passed ? signal.weight : 0),
    0
  );

  return Math.round((passedWeight / totalWeight) * 100);
}

function countGeneratedRegistryKeys(relativePath: string): number {
  const source = readFileSync(join(packageRoot, relativePath), "utf8");
  return (source.match(/\{\s*key:\s*"/g) ?? []).length;
}

function countManifestKind(kind: MetadataUiManifestKind): number {
  return metadataUiManifest.renderers.filter((entry) => entry.kind === kind)
    .length;
}

type MetadataUiManifestKind = "action" | "field" | "section" | "state";

export function checkRendererCatalog(): number {
  const violations: string[] = [];
  const manifestRenderers = metadataUiManifest.renderers;
  const smokeCount = manifestRenderers.filter(
    (entry) => entry.smokeTest
  ).length;
  const fixtureRequired = manifestRenderers.filter((entry) =>
    fixtureRequiredKinds.has(entry.kind)
  );
  const fixtureReadyCount = fixtureRequired.filter(
    (entry) => entry.fixture
  ).length;
  const publicExportCount = manifestRenderers.filter(
    (entry) => entry.publicExport
  ).length;

  const registryCounts = {
    action: countGeneratedRegistryKeys(
      "src/generated/action-renderer-registry.generated.ts"
    ),
    field: countGeneratedRegistryKeys(
      "src/generated/field-renderer-registry.generated.ts"
    ),
    section: countGeneratedRegistryKeys(
      "src/generated/section-renderer-registry.generated.ts"
    ),
    state: countGeneratedRegistryKeys(
      "src/generated/state-renderer-registry.generated.ts"
    ),
  };

  for (const entry of manifestRenderers) {
    if (!entry.smokeTest) {
      violations.push(
        `${entry.kind}/${entry.registryKey}: smokeTest must be true for catalog 9.5 coverage`
      );
    }

    if (!entry.publicExport) {
      violations.push(
        `${entry.kind}/${entry.registryKey}: publicExport must be true for catalog 9.5 coverage`
      );
    }

    if (fixtureRequiredKinds.has(entry.kind) && !entry.fixture) {
      violations.push(
        `${entry.kind}/${entry.registryKey}: fixture must be true for catalog 9.5 coverage`
      );
    }
  }

  const menuActionSource = readFileSync(
    join(packageRoot, "src", "renderers", "actions", "menu-action-surface.tsx"),
    "utf8"
  );

  const signals: CatalogSignal[] = [
    {
      label: "manifest/registry parity",
      passed:
        registryCounts.action === countManifestKind("action") &&
        registryCounts.field === countManifestKind("field") &&
        registryCounts.section === countManifestKind("section") &&
        registryCounts.state === countManifestKind("state") &&
        registryCounts.action +
          registryCounts.field +
          registryCounts.section +
          registryCounts.state ===
          manifestRenderers.length,
      weight: 4,
    },
    {
      label: "smokeTest coverage",
      passed: smokeCount === manifestRenderers.length,
      weight: 3,
    },
    {
      label: "field/action/section fixture coverage",
      passed: fixtureReadyCount === fixtureRequired.length,
      weight: 2,
    },
    {
      label: "public export coverage",
      passed: publicExportCount === manifestRenderers.length,
      weight: 2,
    },
    {
      label: "menu action dropdown surface",
      passed:
        menuActionSource.includes("DropdownMenu") &&
        menuActionSource.includes("DropdownMenuItem"),
      weight: 2,
    },
    {
      label: "axe audit test present",
      passed: readFileSync(
        join(packageRoot, "tests", "renderer-axe-audit.test.tsx"),
        "utf8"
      ).includes("metadataUiManifest"),
      weight: 2,
    },
  ];

  const catalogScore = scoreSignals(signals);

  if (violations.length > 0) {
    throw new Error(
      `renderer catalog gate failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }

  if (catalogScore < minimumCatalogScore) {
    throw new Error(
      `renderer catalog score ${catalogScore} is below minimum ${minimumCatalogScore} (9.5 target)`
    );
  }

  return catalogScore;
}

if (isEntrypoint(import.meta.url)) {
  const score = checkRendererCatalog();
  console.log(
    `metadata-ui renderer catalog score ${score}/100 meets 9.5 threshold (${metadataUiManifest.renderers.length} renderers)`
  );
}
