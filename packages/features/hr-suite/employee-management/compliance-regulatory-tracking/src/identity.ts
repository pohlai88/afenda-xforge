export const hrSuiteFeatureSource = "hr-suite" as const;

export const hrSuiteFeatureSuite = "hr-suite" as const;

export const complianceRegulatoryTrackingDomain =
  "employee-management" as const;

export const complianceRegulatoryTrackingFeature =
  "compliance-regulatory-tracking" as const;

export const complianceRegulatoryTrackingPackageName =
  "@repo/features-employee-management-compliance-regulatory-tracking" as const;

export const complianceRegulatoryTrackingFeatureId =
  `${hrSuiteFeatureSuite}.${complianceRegulatoryTrackingDomain}.${complianceRegulatoryTrackingFeature}` as const;
