import { hrRecordsFeatureId } from "./identity.ts";
import {
  hrRecordsFeatureMetadataSchema,
  type HrRecordsFeatureMetadata,
} from "./contracts/metadata.contract.ts";
export { hrRecordsUiCopy } from "./hr.workforce.records-ui.copy.shared.ts";

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
