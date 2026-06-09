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

export const geolocationRemoteCheckinFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "time-attendance",
  feature: "geolocation-remote-checkin",
  packageName: "@repo/features-time-attendance-geolocation-remote-checkin",
} as const;
