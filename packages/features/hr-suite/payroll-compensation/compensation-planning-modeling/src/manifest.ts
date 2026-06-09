import { compensationPlanningModelingRouteContracts } from "./contract.ts";

export type CompensationPlanningModelingManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof compensationPlanningModelingRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const compensationPlanningModelingManifest: CompensationPlanningModelingManifest =
  {
    id: "hr-suite.payroll-compensation.compensation-planning-modeling",
    title: "Compensation Planning Modeling",
    description:
      "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/payroll-compensation/compensation-planning-modeling.",
    domain: "payroll-compensation",
    packageName:
      "@repo/features-payroll-compensation-compensation-planning-modeling",
    routeContracts: compensationPlanningModelingRouteContracts,
    suite: "hr-suite",
  };
