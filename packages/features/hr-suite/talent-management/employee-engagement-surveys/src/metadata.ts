export type EmployeeEngagementSurveysMetadata = {
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

export const employeeEngagementSurveysMetadata: EmployeeEngagementSurveysMetadata = {
  id: "hr-suite.talent-management.employee-engagement-surveys",
  title: "Employee Engagement Surveys",
  description:
    "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
  domain: "talent-management",
  labels: {
    singular: "Employee Engagement Surveys record",
    plural: "Employee Engagement Surveys records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
