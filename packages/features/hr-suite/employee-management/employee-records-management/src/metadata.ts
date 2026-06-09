export { hrRecordsUiCopy } from "./hr.workforce.records-ui.copy.shared.ts";

export type HrRecordsFeatureMetadata = {
  description: string;
  domain: string;
  id: string;
  labels: {
    plural: string;
    singular: string;
  };
  source: "legacy-hr-suite";
  suite: "hr-suite";
  title: string;
};

export const hrRecordsFeatureMetadata: HrRecordsFeatureMetadata = {
  id: "hr-suite.employee-management.employee-records-management",
  title: "Employee Records Management",
  description:
    "Governed employee records package for Xforge, excluding UI components.",
  domain: "employee-management",
  labels: {
    singular: "Employee Records Management record",
    plural: "Employee Records Management records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
