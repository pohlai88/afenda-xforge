import { employeeSelfservicePortalRouteContracts } from "./contract.ts";

export type EmployeeSelfservicePortalManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof employeeSelfservicePortalRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const employeeSelfservicePortalManifest: EmployeeSelfservicePortalManifest =
  {
    id: "hr-suite.employee-management.employee-selfservice-portal",
    title: "Employee Selfservice Portal",
    description:
      "Governed package for the legacy HR Suite employee-selfservice-portal slice at afenda-erp/packages/features/hr-suite/src/employee-management/employee-selfservice-portal.",
    domain: "employee-management",
    packageName:
      "@repo/features-employee-management-employee-selfservice-portal",
    routeContracts: employeeSelfservicePortalRouteContracts,
    suite: "hr-suite",
  };
