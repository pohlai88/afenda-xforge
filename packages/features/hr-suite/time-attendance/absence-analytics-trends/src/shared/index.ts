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

export const absenceAnalyticsTrendsFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "time-attendance",
  feature: "absence-analytics-trends",
  packageName: "@repo/features-time-attendance-absence-analytics-trends",
} as const;
