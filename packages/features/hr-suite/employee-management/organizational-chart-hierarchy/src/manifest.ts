import { hrOrgFeatureMetadata } from "./metadata.ts";

export type HrOrgFeatureManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  suite: "hr-suite";
  title: string;
};

export const hrOrgFeatureManifest: HrOrgFeatureManifest = {
  id: hrOrgFeatureMetadata.id,
  title: hrOrgFeatureMetadata.title,
  description: hrOrgFeatureMetadata.description,
  domain: hrOrgFeatureMetadata.domain,
  packageName:
    "@repo/features-employee-management-organizational-chart-hierarchy",
  suite: "hr-suite",
};
