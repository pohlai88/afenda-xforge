export type HrSuiteFeatureContext = {
  actorId?: string;
  actorEmployeeId?: string;
  canRead?: boolean;
  canReadAll?: boolean;
  canWrite?: boolean;
  companyId?: string;
  organizationId?: string;
  requestId?: string;
  tenantId?: string;
  userId?: string;
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
