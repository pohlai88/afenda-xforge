import {
  hrSuiteFeatureSource,
  hrSuiteFeatureSuite,
  offboardingExitManagementDomain,
  offboardingExitManagementFeature,
  offboardingExitManagementPackageName,
} from "./identity.ts";
import type { OffboardingExitManagementPolicyContext } from "./policy.ts";

export type HrSuiteFeatureContext = OffboardingExitManagementPolicyContext;
export type OffboardingAccessContext = HrSuiteFeatureContext;

export const hrSuiteFeatureScope = {
  source: hrSuiteFeatureSource,
  suite: hrSuiteFeatureSuite,
} as const;

export type HrSuiteFeatureScope = typeof hrSuiteFeatureScope;

export const offboardingExitManagementFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: offboardingExitManagementDomain,
  feature: offboardingExitManagementFeature,
  packageName: offboardingExitManagementPackageName,
} as const;

export type OffboardingExitManagementFeatureScope =
  typeof offboardingExitManagementFeatureScope;
