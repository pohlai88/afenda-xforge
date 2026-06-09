import { hrRecordsFeatureMetadata } from "./metadata.ts";

export type HrRecordsFeatureManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  suite: "hr-suite";
  title: string;
};

export const hrRecordsFeatureManifest: HrRecordsFeatureManifest = {
  id: hrRecordsFeatureMetadata.id,
  title: hrRecordsFeatureMetadata.title,
  description: hrRecordsFeatureMetadata.description,
  domain: hrRecordsFeatureMetadata.domain,
  packageName: "@repo/features-employee-management-employee-records-management",
  suite: "hr-suite",
};
