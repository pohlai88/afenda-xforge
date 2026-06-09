export type HrSuiteFeatureContext = {
  actorId?: string;
  companyId?: string;
  requestId?: string;
  tenantId?: string;
};

export const hrSuiteFeatureScope = {
  source: "legacy-hr-suite",
  suite: "hr-suite",
} as const;

export const retailSeasonalHourlyWorkforceSchedulingFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "industry-specific",
  feature: "retail-seasonal-hourly-workforce-scheduling",
  packageName:
    "@repo/features-industry-specific-retail-seasonal-hourly-workforce-scheduling",
} as const;
