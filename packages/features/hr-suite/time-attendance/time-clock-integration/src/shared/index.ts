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

export const timeClockIntegrationFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "time-attendance",
  feature: "time-clock-integration",
  packageName: "@repo/features-time-attendance-time-clock-integration",
} as const;
