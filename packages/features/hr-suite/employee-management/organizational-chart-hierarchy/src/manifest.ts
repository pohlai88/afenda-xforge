import {
  hrSuiteFeatureSuite,
  organizationalChartHierarchyFeatureId,
  organizationalChartHierarchyPackageName,
} from "./identity.ts";
import { hrOrgFeatureMetadata } from "./metadata.ts";

export type HrOrgFeatureManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  suite: typeof hrSuiteFeatureSuite;
  title: string;
};

export const hrOrgFeatureManifest: HrOrgFeatureManifest = {
  id: organizationalChartHierarchyFeatureId,
  title: hrOrgFeatureMetadata.title,
  description: hrOrgFeatureMetadata.description,
  domain: hrOrgFeatureMetadata.domain,
  packageName: organizationalChartHierarchyPackageName,
  suite: hrSuiteFeatureSuite,
};
