import {
  hrRecordsFeature,
  hrRecordsFeatureDomain,
  hrRecordsFeaturePackageName,
  hrRecordsFeatureSource,
  hrRecordsFeatureSuite,
} from "./identity.ts";

export type HrSuiteFeatureScope = {
  source: typeof hrRecordsFeatureSource;
  suite: typeof hrRecordsFeatureSuite;
};

export const hrSuiteFeatureScope = {
  source: hrRecordsFeatureSource,
  suite: hrRecordsFeatureSuite,
} as const satisfies HrSuiteFeatureScope;

export const hrRecordsFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: hrRecordsFeatureDomain,
  feature: hrRecordsFeature,
  packageName: hrRecordsFeaturePackageName,
} as const;
