import {
  getManifestEntries,
  isEntrypoint,
  updateReadmeSection,
} from "./generator-lib.mts";
import { validateManifestEntries } from "./validate-manifest.mts";

function renderReadmeSection(): string {
  const entries = validateManifestEntries(getManifestEntries());
  const rows = entries.map(
    (entry) =>
      `| ${entry.kind} | \`${entry.registryKey}\` | \`${entry.rendererExport}\` | \`${entry.composeGroup}\` |`
  );

  return [
    "<!-- This section is auto-generated. Do not edit manually. -->",
    "",
    "| Kind | Registry Key | Renderer Export | Compose Group |",
    "| --- | --- | --- | --- |",
    ...rows,
  ].join("\n");
}

export function generateReadmeSection(check = false): boolean {
  return updateReadmeSection(renderReadmeSection(), check);
}

if (isEntrypoint(import.meta.url)) {
  generateReadmeSection(process.argv.includes("--check"));
}
