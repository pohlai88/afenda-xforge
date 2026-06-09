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

export const flexibleWorkArrangementTrackingFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "time-attendance",
  feature: "flexible-work-arrangement-tracking",
  packageName:
    "@repo/features-time-attendance-flexible-work-arrangement-tracking",
} as const;
