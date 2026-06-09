export type EmployeeLifecycleManagementMetadata = {
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

export const employeeLifecycleManagementMetadata: EmployeeLifecycleManagementMetadata =
  {
    id: "hr-suite.employee-management.employee-lifecycle-management",
    title: "Employee Lifecycle Management",
    description:
      "Governed metadata for the employee-management lifecycle feature extracted from the legacy HR suite.",
    domain: "employee-management",
    labels: {
      singular: "Employee Lifecycle Management record",
      plural: "Employee Lifecycle Management records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
