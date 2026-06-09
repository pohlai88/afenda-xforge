import type { HrRecordsFeatureMetadata } from "./contracts/metadata.contract.ts";
import { hrRecordsFeatureMetadataSchema } from "./contracts/metadata.contract.ts";
import { hrRecordsFeatureId } from "./identity.ts";

export { hrRecordsUiCopy } from "./ui.copy.shared.ts";

export const hrRecordsFeatureMetadata: HrRecordsFeatureMetadata =
  hrRecordsFeatureMetadataSchema.parse({
    id: hrRecordsFeatureId,
    title: "Employee Records Management",
    description:
      "Governed employee records package for Xforge, excluding UI components.",
    domain: "employee-management",
    labels: {
      singular: "Employee Records Management record",
      plural: "Employee Records Management records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  });
