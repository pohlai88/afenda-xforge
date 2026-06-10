import type { MetadataUiManifestEntry } from "../metadata-ui.manifest.ts";
import {
  getManifestEntries,
  groupManifestEntries,
  isEntrypoint,
  quote,
  renderGeneratedHeader,
  writeGeneratedOutput,
} from "./generator-lib.mts";
import { validateManifestEntries } from "./validate-manifest.mts";

function renderRegistrationLines(
  entries: readonly MetadataUiManifestEntry[]
): string {
  return entries
    .map(
      (entry) =>
        `  { key: ${quote(entry.registryKey)}, renderer: ${entry.rendererExport}, version: ${quote(
          entry.version ?? "1.0.0"
        )} },`
    )
    .join("\n");
}

function renderRendererImports(
  entries: readonly MetadataUiManifestEntry[]
): string {
  return Array.from(
    new Map(
      entries.map((entry) => [
        `${entry.rendererExport}:${entry.rendererPath}`,
        `import { ${entry.rendererExport} } from ${quote(entry.rendererPath)};`,
      ])
    ).values()
  ).join("\n");
}

function renderFieldRegistryFile(
  entries: readonly MetadataUiManifestEntry[]
): string {
  const rendererImports = renderRendererImports(entries);

  return `${renderGeneratedHeader("scripts/generate-registry.mts")}import type {
  MetadataFieldKind,
  MetadataFieldRenderer,
} from "../contracts/field-renderer.contract";
import type { MetadataRendererRegistration } from "../contracts/registry.contract";
${rendererImports ? `\n${rendererImports}` : ""}

type FieldRegistration = MetadataRendererRegistration<MetadataFieldRenderer> & {
  key: MetadataFieldKind;
};

export const generatedFieldRendererRegistrations = [
${renderRegistrationLines(entries)}
] satisfies readonly FieldRegistration[];
`;
}

function renderActionRegistryFile(
  entries: readonly MetadataUiManifestEntry[]
): string {
  const rendererImports = renderRendererImports(entries);

  return `${renderGeneratedHeader("scripts/generate-registry.mts")}import type {
  MetadataActionRenderer,
  MetadataActionSurface,
} from "../contracts/action-renderer.contract";
import type { MetadataRendererRegistration } from "../contracts/registry.contract";
${rendererImports ? `\n${rendererImports}` : ""}

type ActionRegistration = MetadataRendererRegistration<MetadataActionRenderer> & {
  key: MetadataActionSurface;
};

export const generatedActionRendererRegistrations = [
${renderRegistrationLines(entries)}
] satisfies readonly ActionRegistration[];
`;
}

function renderSectionRegistryFile(
  entries: readonly MetadataUiManifestEntry[]
): string {
  const rendererImports = renderRendererImports(entries);

  return `${renderGeneratedHeader("scripts/generate-registry.mts")}import type { MetadataRendererRegistration } from "../contracts/registry.contract";
import type {
  MetadataSectionKind,
  MetadataSectionRenderer as MetadataSectionRendererContract,
} from "../contracts/section-renderer.contract";
${rendererImports ? `\n${rendererImports}` : ""}

type SectionRegistration =
  MetadataRendererRegistration<MetadataSectionRendererContract> & {
    key: MetadataSectionKind;
  };

export const generatedSectionRendererRegistrations = [
${renderRegistrationLines(entries)}
] satisfies readonly SectionRegistration[];
`;
}

function renderStateRegistryFile(
  entries: readonly MetadataUiManifestEntry[]
): string {
  const rendererImports = renderRendererImports(entries);

  return `${renderGeneratedHeader("scripts/generate-registry.mts")}import type { MetadataRendererRegistration } from "../contracts/registry.contract";
import type {
  MetadataStateKind,
  MetadataStateRenderer,
} from "../contracts/state-renderer.contract";
${rendererImports ? `\n${rendererImports}` : ""}

type StateRegistration = MetadataRendererRegistration<MetadataStateRenderer> & {
  key: MetadataStateKind;
};

export const generatedStateRendererRegistrations = [
${renderRegistrationLines(entries)}
] satisfies readonly StateRegistration[];
`;
}

function renderRegistryAggregatorFile(): string {
  return `${renderGeneratedHeader("scripts/generate-registry.mts")}export { generatedActionRendererRegistrations } from "./action-renderer-registry.generated";
export { generatedFieldRendererRegistrations } from "./field-renderer-registry.generated";
export { generatedSectionRendererRegistrations } from "./section-renderer-registry.generated";
export { generatedStateRendererRegistrations } from "./state-renderer-registry.generated";
`;
}

export function generateRegistry(check = false): boolean[] {
  const entries = validateManifestEntries(getManifestEntries());
  const grouped = groupManifestEntries(entries);

  return [
    writeGeneratedOutput(
      "src/generated/field-renderer-registry.generated.ts",
      renderFieldRegistryFile(grouped.field),
      check
    ),
    writeGeneratedOutput(
      "src/generated/action-renderer-registry.generated.ts",
      renderActionRegistryFile(grouped.action),
      check
    ),
    writeGeneratedOutput(
      "src/generated/section-renderer-registry.generated.ts",
      renderSectionRegistryFile(grouped.section),
      check
    ),
    writeGeneratedOutput(
      "src/generated/state-renderer-registry.generated.ts",
      renderStateRegistryFile(grouped.state),
      check
    ),
    writeGeneratedOutput(
      "src/generated/renderer-registry.generated.ts",
      renderRegistryAggregatorFile(),
      check
    ),
  ];
}

if (isEntrypoint(import.meta.url)) {
  generateRegistry(process.argv.includes("--check"));
}
