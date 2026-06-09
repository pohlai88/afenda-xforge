import { hrSuiteFeatureSource, hrSuiteFeatureSuite } from "./identity.ts";

export type HrOrgFeatureMetadata = {
  description: string;
  domain: string;
  id: string;
  labels: {
    plural: string;
    singular: string;
  };
  source: typeof hrSuiteFeatureSource;
  suite: typeof hrSuiteFeatureSuite;
  title: string;
};

export { hrOrgUiCopy } from "./shared/ui-copy.shared.ts";

export const hrOrgFeatureMetadata: HrOrgFeatureMetadata = {
  id: "hr-suite.employee-management.organizational-chart-hierarchy",
  title: "Organizational Chart Hierarchy",
  description:
    "Governed organizational chart hierarchy package for Xforge, excluding UI components.",
  domain: "employee-management",
  labels: {
    singular: "Organizational Chart Hierarchy record",
    plural: "Organizational Chart Hierarchy records",
  },
  source: hrSuiteFeatureSource,
  suite: hrSuiteFeatureSuite,
};
