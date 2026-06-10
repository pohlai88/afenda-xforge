import { createMetadataUiCompatibilityReport } from "../src/registry/metadata-ui-compatibility.ts";
import { isEntrypoint } from "./generator-lib.mts";

export function checkCompatibility(): void {
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
      `Enterprise AC #4 compatibility verification failed:\n${details}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkCompatibility();
  console.log("Enterprise AC #4 compatibility verification passed.");
}
