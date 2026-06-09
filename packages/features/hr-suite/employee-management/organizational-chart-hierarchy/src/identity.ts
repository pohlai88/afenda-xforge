export const hrSuiteFeatureSource = "hr-suite" as const;

export const hrSuiteFeatureSuite = "hr-suite" as const;

export const organizationalChartHierarchyDomain =
  "employee-management" as const;

export const organizationalChartHierarchyFeature =
  "organizational-chart-hierarchy" as const;

export const organizationalChartHierarchyPackageName =
  "@repo/features-employee-management-organizational-chart-hierarchy" as const;

export const organizationalChartHierarchyFeatureId =
  `${hrSuiteFeatureSuite}.${organizationalChartHierarchyDomain}.${organizationalChartHierarchyFeature}` as const;
