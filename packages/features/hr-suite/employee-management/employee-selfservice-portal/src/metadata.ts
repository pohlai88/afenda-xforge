export type EmployeeSelfservicePortalMetadata = {
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

export const employeeSelfservicePortalMetadata: EmployeeSelfservicePortalMetadata =
  {
    id: "hr-suite.employee-management.employee-selfservice-portal",
    title: "Employee Selfservice Portal",
    description:
      "Governed employee self-service portal metadata extracted from the legacy HR suite.",
    domain: "employee-management",
    labels: {
      singular: "Employee Selfservice Portal record",
      plural: "Employee Selfservice Portal records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
