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

export const shiftSchedulingFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "time-attendance",
  feature: "shift-scheduling",
  packageName: "@repo/features-time-attendance-shift-scheduling",
} as const;
