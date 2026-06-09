import {
  getManifestEntries,
  isEntrypoint,
  quote,
  renderGeneratedHeader,
  writeGeneratedOutput,
} from "./generator-lib.mts";
import { validateManifestEntries } from "./validate-manifest.mts";

function renderExportFile(): string {
  const entries = validateManifestEntries(getManifestEntries()).filter(
    (entry) => entry.publicExport
  );
  const exportLines = Array.from(
    new Map(
      entries.map((entry) => [
        `${entry.rendererExport}:${entry.rendererPath}`,
        `export { ${entry.rendererExport} } from ${quote(entry.rendererPath)};`,
      ])
    ).values()
  );

  return `${renderGeneratedHeader("scripts/generate-exports.mts")}${exportLines.join("\n")}\n`;
}

export function generateExports(check = false): boolean {
  return writeGeneratedOutput(
    "src/generated/exports.generated.ts",
    renderExportFile(),
    check
  );
}

if (isEntrypoint(import.meta.url)) {
  generateExports(process.argv.includes("--check"));
}
