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
    title: "Employee Self-Service Portal",
    description:
      "Governed package for employee self-service portal identity, scoped reads, and request-oriented execution surfaces.",
    domain: "employee-management",
    packageName:
      "@repo/features-employee-management-employee-selfservice-portal",
    routeContracts: employeeSelfservicePortalRouteContracts,
    suite: "hr-suite",
  };
