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

export const fieldWorkerRemoteWorkforceManagementFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "industry-specific",
  feature: "field-worker-remote-workforce-management",
  packageName: "@repo/features-industry-specific-field-worker-remote-workforce-management",
} as const;
