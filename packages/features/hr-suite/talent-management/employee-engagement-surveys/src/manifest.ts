import { employeeEngagementSurveysRouteContracts } from "./contract.ts";

export type EmployeeEngagementSurveysManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof employeeEngagementSurveysRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const employeeEngagementSurveysManifest: EmployeeEngagementSurveysManifest = {
  id: "hr-suite.talent-management.employee-engagement-surveys",
  title: "Employee Engagement Surveys",
  description:
    "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/talent-management/employee-engagement-surveys.",
  domain: "talent-management",
  packageName: "@repo/features-talent-management-employee-engagement-surveys",
  routeContracts: employeeEngagementSurveysRouteContracts,
  suite: "hr-suite",
};
