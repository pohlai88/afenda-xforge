import { employeeSelfservicePortalRouteContracts } from "./contract.ts";
import { employeeSelfservicePortalRequirementCoverage } from "./registry/requirement-coverage.ts";

export type EmployeeSelfservicePortalManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  requirementCoverage: typeof employeeSelfservicePortalRequirementCoverage;
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
    requirementCoverage: employeeSelfservicePortalRequirementCoverage,
    routeContracts: employeeSelfservicePortalRouteContracts,
    suite: "hr-suite",
  };
