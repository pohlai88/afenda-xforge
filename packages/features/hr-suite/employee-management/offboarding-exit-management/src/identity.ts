export const hrSuiteFeatureSource = "hr-suite" as const;
export const hrSuiteFeatureSuite = "hr-suite" as const;

export const offboardingExitManagementDomain = "employee-management" as const;
export const offboardingExitManagementFeature =
  "offboarding-exit-management" as const;
export const offboardingExitManagementPackageName =
  "@repo/features-employee-management-offboarding-exit-management" as const;
export const offboardingExitManagementFeatureId =
  `${hrSuiteFeatureSuite}.${offboardingExitManagementDomain}.${offboardingExitManagementFeature}` as const;
export const offboardingExitManagementFeatureLabel =
  "Offboarding Exit Management" as const;

export type OffboardingExitManagementDomain =
  typeof offboardingExitManagementDomain;
export type OffboardingExitManagementFeatureId =
  typeof offboardingExitManagementFeatureId;
export type OffboardingExitManagementFeatureLabel =
  typeof offboardingExitManagementFeatureLabel;
export type OffboardingExitManagementPackageName =
  typeof offboardingExitManagementPackageName;
export type OffboardingExitManagementSuite = typeof hrSuiteFeatureSuite;
