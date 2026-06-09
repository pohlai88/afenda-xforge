import { employeeLifecycleManagementRouteContracts } from "./contract.ts";

export type EmployeeLifecycleManagementManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof employeeLifecycleManagementRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const employeeLifecycleManagementManifest: EmployeeLifecycleManagementManifest =
  {
    id: "hr-suite.employee-management.employee-lifecycle-management",
    title: "Employee Lifecycle Management",
    description:
      "Governed package for the legacy HR Suite employee-lifecycle-management slice at afenda-erp/packages/features/hr-suite/src/employee-management/employee-lifecycle-management.",
    domain: "employee-management",
    packageName:
      "@repo/features-employee-management-employee-lifecycle-management",
    routeContracts: employeeLifecycleManagementRouteContracts,
    suite: "hr-suite",
  };
