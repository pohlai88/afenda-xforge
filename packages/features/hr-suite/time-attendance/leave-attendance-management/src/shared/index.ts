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

export const leaveAttendanceManagementFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "time-attendance",
  feature: "leave-attendance-management",
  packageName: "@repo/features-time-attendance-leave-attendance-management",
} as const;
