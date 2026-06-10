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

function renderMapEntries(entries: readonly MetadataUiManifestEntry[]): string {
  return entries
    .map(
      (entry) =>
        `    ${quote(entry.registryKey)}: ${quote(entry.composeGroup)},`
    )
    .join("\n");
}

function renderCompatibilityFile(): string {
  const entries = validateManifestEntries(getManifestEntries());
  const grouped = groupManifestEntries(entries);

  return `${renderGeneratedHeader("scripts/generate-compatibility.mts")}import type { ComposeRegistryGroupName } from "@repo/ui";

import type { MetadataActionSurface } from "../contracts/action-renderer.contract";
import type { MetadataFieldKind } from "../contracts/field-renderer.contract";
import type { MetadataStateKind } from "../contracts/state-renderer.contract";
import type { MetadataSectionKind } from "../contracts/section-renderer.contract";

export type MetadataUiGeneratedComposeCompatibilityMap = {
  action: Record<MetadataActionSurface, ComposeRegistryGroupName>;
  field: Record<MetadataFieldKind, ComposeRegistryGroupName>;
  section: Record<MetadataSectionKind, ComposeRegistryGroupName>;
  state: Record<MetadataStateKind, ComposeRegistryGroupName>;
};

export const generatedMetadataUiComposeCompatibilityMap = {
  action: {
${renderMapEntries(grouped.action)}
  },
  field: {
${renderMapEntries(grouped.field)}
  },
  section: {
${renderMapEntries(grouped.section)}
  },
  state: {
${renderMapEntries(grouped.state)}
  },
} satisfies MetadataUiGeneratedComposeCompatibilityMap;
`;
}

export function generateCompatibility(check = false): boolean {
  return writeGeneratedOutput(
    "src/generated/compatibility.generated.ts",
    renderCompatibilityFile(),
    check
  );
}

if (isEntrypoint(import.meta.url)) {
  generateCompatibility(process.argv.includes("--check"));
}
