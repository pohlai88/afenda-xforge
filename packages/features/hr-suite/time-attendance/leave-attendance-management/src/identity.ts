export const hrSuiteFeatureSource = "hr-suite" as const;

export const hrSuiteFeatureSuite = "hr-suite" as const;

export const leaveAttendanceManagementDomain = "time-attendance" as const;

export const leaveAttendanceManagementFeature =
  "leave-attendance-management" as const;

export const leaveAttendanceManagementPackageName =
  "@repo/features-time-attendance-leave-attendance-management" as const;

export const leaveAttendanceManagementFeatureId =
  `${hrSuiteFeatureSuite}.${leaveAttendanceManagementDomain}.${leaveAttendanceManagementFeature}` as const;
