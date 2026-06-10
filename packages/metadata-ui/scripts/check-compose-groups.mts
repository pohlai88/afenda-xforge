import { createMetadataUiCompatibilityReport } from "../src/registry/metadata-ui-compatibility.ts";
import { isEntrypoint } from "./generator-lib.mts";
import { validateManifestEntries } from "./validate-manifest.mts";

export function checkComposeGroups(): void {
  validateManifestEntries();
  const report = createMetadataUiCompatibilityReport();

  if (!report.ok) {
    const details = report.issues
      .map(
        (issue) =>
          `- [${issue.area}:${issue.key}] ${issue.message}${
            issue.composeGroup ? ` (${issue.composeGroup})` : ""
          }`
      )
      .join("\n");

    throw new Error(
      `MUI-VIS-001 compose-group verification failed:\n${details}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkComposeGroups();
  console.log("metadata-ui compose-group verification passed (MUI-VIS-001)");
}
