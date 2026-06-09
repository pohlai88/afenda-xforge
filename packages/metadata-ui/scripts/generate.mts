import { generateCompatibility } from "./generate-compatibility.mts";
import { generateExports } from "./generate-exports.mts";
import { generateFixtures } from "./generate-fixtures.mts";
import { generateReadmeSection } from "./generate-readme-section.mts";
import { generateRegistry } from "./generate-registry.mts";
import { isEntrypoint } from "./generator-lib.mts";
import { validateManifestEntries } from "./validate-manifest.mts";

export function generate(check = false): void {
  validateManifestEntries();

  generateRegistry(check);
  generateExports(check);
  generateFixtures(check);
  generateCompatibility(check);
  generateReadmeSection(check);
}

if (isEntrypoint(import.meta.url)) {
  generate(process.argv.includes("--check"));
  console.log(
    process.argv.includes("--check")
      ? "metadata-ui generated outputs are current"
      : "metadata-ui generated outputs updated"
  );
}
