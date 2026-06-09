import { hrRecordsFeatureManifestSchema } from "./contracts/manifest.contract.ts";
import { hrRecordsFeatureId, hrRecordsFeaturePackageName } from "./identity.ts";
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
  id: hrRecordsFeatureId,
  title: hrRecordsFeatureMetadata.title,
  description: hrRecordsFeatureMetadata.description,
  domain: hrRecordsFeatureMetadata.domain,
  packageName: hrRecordsFeaturePackageName,
  suite: "hr-suite",
};

hrRecordsFeatureManifestSchema.parse(hrRecordsFeatureManifest);
