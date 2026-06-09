import type { MetadataUiManifestEntry } from "../metadata-ui.manifest.ts";
import {
  getManifestEntries,
  isEntrypoint,
  quote,
  resolveRendererSourcePath,
  sourceHasNamedExport,
} from "./generator-lib.mts";

export function validateManifestEntries(
  entries: readonly MetadataUiManifestEntry[] = getManifestEntries()
): readonly MetadataUiManifestEntry[] {
  const seen = new Set<string>();

  for (const entry of entries) {
    if (!entry.registryKey.trim()) {
      throw new Error(
        `Manifest entry '${entry.rendererExport}' is missing a registryKey.`
      );
    }

    if (!entry.rendererPath.trim()) {
      throw new Error(
        `Manifest entry '${entry.kind}:${entry.registryKey}' is missing a rendererPath.`
      );
    }

    if (!entry.rendererExport.trim()) {
      throw new Error(
        `Manifest entry '${entry.kind}:${entry.registryKey}' is missing a rendererExport.`
      );
    }

    const duplicateKey = `${entry.kind}:${entry.registryKey}`;

    if (seen.has(duplicateKey)) {
      throw new Error(
        `Duplicate manifest registry key detected for ${quote(duplicateKey)}.`
      );
    }

    seen.add(duplicateKey);

    const sourcePath = resolveRendererSourcePath(entry);

    if (!sourceHasNamedExport(sourcePath, entry.rendererExport)) {
      throw new Error(
        `Manifest entry '${entry.kind}:${entry.registryKey}' references missing export '${entry.rendererExport}' in '${entry.rendererPath}'.`
      );
    }
  }

  return entries;
}

if (isEntrypoint(import.meta.url)) {
  validateManifestEntries();
  console.log("metadata-ui manifest validation passed");
}
