import {
  hrSuiteFeatureSource,
  hrSuiteFeatureSuite,
  organizationalChartHierarchyDomain,
  organizationalChartHierarchyFeature,
  organizationalChartHierarchyPackageName,
} from "./identity.ts";
import type { HrOrgPolicyContext } from "./policy.ts";

export type HrSuiteFeatureContext = HrOrgPolicyContext;
export type HrOrgAccessContext = HrSuiteFeatureContext;

export const hrSuiteFeatureScope = {
  source: hrSuiteFeatureSource,
  suite: hrSuiteFeatureSuite,
} as const;

export type HrSuiteFeatureScope = typeof hrSuiteFeatureScope;

export const organizationalChartHierarchyFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: organizationalChartHierarchyDomain,
  feature: organizationalChartHierarchyFeature,
  packageName: organizationalChartHierarchyPackageName,
} as const;

export const hrOrgFeatureScope: OrganizationalChartHierarchyFeatureScope =
  organizationalChartHierarchyFeatureScope;

export type OrganizationalChartHierarchyFeatureScope =
  typeof organizationalChartHierarchyFeatureScope;

export type HrOrgFeatureScope = OrganizationalChartHierarchyFeatureScope;
