import { readdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { getComposeRegistryGroup } from "@repo/ui";
import type { MetadataUiManifestEntry } from "../metadata-ui.manifest.ts";
import {
  getManifestEntries,
  isEntrypoint,
  packageRoot,
  quote,
  resolveRendererSourcePath,
  sourceHasNamedExport,
} from "./generator-lib.mts";

const internalRendererAllowlist = new Set([
  "base-action.renderer.tsx",
  "metadata-stack-layout.renderer.tsx",
]);

function getRendererFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return getRendererFiles(fullPath);
    }

    return entry.isFile() && entry.name.endsWith(".renderer.tsx")
      ? [fullPath]
      : [];
  });
}

export function validateManifestComposeGroups(
  entries: readonly MetadataUiManifestEntry[] = getManifestEntries()
): readonly MetadataUiManifestEntry[] {
  for (const entry of entries) {
    const registryGroup = getComposeRegistryGroup(entry.composeGroup);

    if (!registryGroup) {
      throw new Error(
        `Manifest entry '${entry.kind}:${entry.registryKey}' references unregistered compose group ${quote(entry.composeGroup)}.`
      );
    }

    if (registryGroup.readiness !== "metadata-ready") {
      throw new Error(
        `Manifest entry '${entry.kind}:${entry.registryKey}' references compose group ${quote(entry.composeGroup)} that is not metadata-ready.`
      );
    }
  }

  return entries;
}

export function validateManifestRendererCoverage(
  entries: readonly MetadataUiManifestEntry[] = getManifestEntries()
): readonly MetadataUiManifestEntry[] {
  const manifestPaths = new Set(
    entries.map((entry) => basename(resolveRendererSourcePath(entry)))
  );
  const rendererRoot = resolve(packageRoot, "src", "renderers");
  const rendererFiles = getRendererFiles(rendererRoot);

  for (const filePath of rendererFiles) {
    const fileName = basename(filePath);

    if (internalRendererAllowlist.has(fileName)) {
      continue;
    }

    if (!manifestPaths.has(fileName)) {
      throw new Error(
        `Renderer file '${fileName}' is not referenced by metadata-ui.manifest.ts.`
      );
    }
  }

  return entries;
}

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

    if (!entry.composeGroup.trim()) {
      throw new Error(
        `Manifest entry '${entry.kind}:${entry.registryKey}' is missing a composeGroup.`
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

  validateManifestComposeGroups(entries);
  validateManifestRendererCoverage(entries);

  return entries;
}

if (isEntrypoint(import.meta.url)) {
  validateManifestEntries();
  console.log("metadata-ui manifest validation passed");
}
