import {
  complianceRegulatoryTrackingDomain,
  complianceRegulatoryTrackingFeature,
  complianceRegulatoryTrackingPackageName,
  hrSuiteFeatureSource,
  hrSuiteFeatureSuite,
} from "./identity.ts";
import type { CompliancePolicyContext } from "./policy.ts";

export type HrSuiteFeatureContext = CompliancePolicyContext;
export type ComplianceAccessContext = HrSuiteFeatureContext;

export const hrSuiteFeatureScope = {
  source: hrSuiteFeatureSource,
  suite: hrSuiteFeatureSuite,
} as const;

export type HrSuiteFeatureScope = typeof hrSuiteFeatureScope;

export const complianceRegulatoryTrackingFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: complianceRegulatoryTrackingDomain,
  feature: complianceRegulatoryTrackingFeature,
  packageName: complianceRegulatoryTrackingPackageName,
} as const;

export type ComplianceRegulatoryTrackingFeatureScope =
  typeof complianceRegulatoryTrackingFeatureScope;
