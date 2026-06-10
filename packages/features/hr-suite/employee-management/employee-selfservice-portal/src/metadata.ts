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
    title: "Employee Self-Service Portal",
    description:
      "Governed employee self-service portal package metadata for actor-scoped self-service reads and requests.",
    domain: "employee-management",
    labels: {
      singular: "Employee self-service portal record",
      plural: "Employee self-service portal records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
